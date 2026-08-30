create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.application_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null check (status in ('pending', 'active', 'deleting')),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);
create table public.category_templates (
  key text primary key,
  display_name text not null check (btrim(display_name) <> ''),
  default_sort_order integer not null unique check (default_sort_order >= 0),
  preset_color_key text check (preset_color_key is null),
  is_active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);
create table public.attribute_definitions (
  template_key text not null references public.category_templates (key) on delete restrict,
  key text not null,
  value_type text not null check (value_type in ('text', 'boolean')),
  display_name text not null check (btrim(display_name) <> ''),
  sort_order integer not null check (sort_order >= 0),
  searchable boolean not null,
  is_active boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  primary key (template_key, key),
  unique (template_key, sort_order)
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_key text references public.category_templates (key) on delete restrict,
  name text not null,
  name_key text not null,
  color_key text check (color_key is null),
  sort_order integer not null check (sort_order >= 0),
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  unique (id, user_id),
  unique (user_id, name_key)
);
create unique index categories_owner_template_key on public.categories (user_id, template_key) where template_key is not null;
create index categories_owner_sort on public.categories (user_id, sort_order, id);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid,
  item_name text not null check (btrim(item_name) <> ''),
  quantity numeric not null default 1,
  unit text not null default 'point' check (unit in ('point','piece','stick','sheet','book','garment','pair','set','box','bag','pack','machine','gram','kilogram','milliliter','liter','centimeter','meter')),
  low_stock_threshold numeric,
  image_path text check (image_path is null),
  notes text,
  purchase_date date,
  brand text,
  color text,
  model_code text,
  attributes jsonb not null default '{"version":1,"categories":{}}'::jsonb,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  foreign key (category_id, user_id) references public.categories (id, user_id) on delete restrict,
  constraint items_quantity_range check (quantity >= 0 and quantity < 100000000000000 and quantity = round(quantity, 6)),
  constraint items_threshold_range check (low_stock_threshold is null or (low_stock_threshold >= 0 and low_stock_threshold < 100000000000000 and low_stock_threshold = round(low_stock_threshold, 6))),
  constraint items_count_amounts_are_integers check (
    unit not in ('point','piece','stick','sheet','book','garment','pair','set','box','bag','pack','machine')
    or (quantity = trunc(quantity) and (low_stock_threshold is null or low_stock_threshold = trunc(low_stock_threshold)))
  )
);
create index items_owner_created on public.items (user_id, created_at desc, id);
create index items_owner_updated on public.items (user_id, updated_at desc, id);
create index items_owner_category on public.items (user_id, category_id);
create index items_owner_unit_quantity on public.items (user_id, unit, quantity, id);
create index items_owner_purchase on public.items (user_id, purchase_date, id) where purchase_date is not null;

insert into public.category_templates (key, display_name, default_sort_order) values
  ('daily_goods','日用品',0),('food_beverage','食品・飲料',1),('clothing_accessories','衣類・服飾',2),
  ('electronics_appliances','家電・電子機器',3),('hobby_collection','趣味・コレクション',4),('tools_supplies','工具・用品',5);
insert into public.attribute_definitions (template_key,key,value_type,display_name,sort_order,searchable) values
  ('daily_goods','spec_size','text','規格・サイズ',0,true),('daily_goods','opened','boolean','開封済み',1,false),
  ('food_beverage','content_amount','text','内容量',0,true),('food_beverage','opened','boolean','開封済み',1,false),
  ('clothing_accessories','size','text','サイズ',0,true),('clothing_accessories','material','text','素材',1,true),
  ('electronics_appliances','serial_number','text','シリアル番号',0,true),
  ('hobby_collection','series','text','シリーズ',0,true),('hobby_collection','material','text','素材',1,true),
  ('tools_supplies','spec_size','text','規格・サイズ',0,true),('tools_supplies','material','text','材質',1,true);

create function private.normalize_category_name(value text) returns text
language sql immutable strict set search_path = '' as $$
  select lower(btrim(regexp_replace(normalize(value, NFKC), U&'[\0009-\000D\0020\0085\00A0\1680\2000-\200A\2028\2029\202F\205F\3000]+', ' ', 'g')));
$$;
create function private.set_category_name_key() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.name_key := private.normalize_category_name(new.name);
  if new.name_key = '' then raise exception 'category name must not be blank' using errcode = '23514'; end if;
  return new;
end;
$$;

create function private.validate_item_attributes(value jsonb) returns boolean
language sql immutable strict set search_path = '' as $$
  select coalesce(jsonb_typeof(value) = 'object', false)
    and value ? 'version'
    and value -> 'version' = '1'::jsonb
    and value ? 'categories'
    and coalesce(jsonb_typeof(value -> 'categories') = 'object', false)
    and not exists (select 1 from jsonb_each(value -> 'categories') as c(k,v) where jsonb_typeof(v) <> 'object')
    and (value #> '{categories,daily_goods,spec_size}' is null or jsonb_typeof(value #> '{categories,daily_goods,spec_size}') = 'string')
    and (value #> '{categories,daily_goods,opened}' is null or jsonb_typeof(value #> '{categories,daily_goods,opened}') = 'boolean')
    and (value #> '{categories,food_beverage,content_amount}' is null or jsonb_typeof(value #> '{categories,food_beverage,content_amount}') = 'string')
    and (value #> '{categories,food_beverage,opened}' is null or jsonb_typeof(value #> '{categories,food_beverage,opened}') = 'boolean')
    and (value #> '{categories,clothing_accessories,size}' is null or jsonb_typeof(value #> '{categories,clothing_accessories,size}') = 'string')
    and (value #> '{categories,clothing_accessories,material}' is null or jsonb_typeof(value #> '{categories,clothing_accessories,material}') = 'string')
    and (value #> '{categories,electronics_appliances,serial_number}' is null or jsonb_typeof(value #> '{categories,electronics_appliances,serial_number}') = 'string')
    and (value #> '{categories,hobby_collection,series}' is null or jsonb_typeof(value #> '{categories,hobby_collection,series}') = 'string')
    and (value #> '{categories,hobby_collection,material}' is null or jsonb_typeof(value #> '{categories,hobby_collection,material}') = 'string')
    and (value #> '{categories,tools_supplies,spec_size}' is null or jsonb_typeof(value #> '{categories,tools_supplies,spec_size}') = 'string')
    and (value #> '{categories,tools_supplies,material}' is null or jsonb_typeof(value #> '{categories,tools_supplies,material}') = 'string');
$$;
alter table public.items add constraint items_attributes_valid check (private.validate_item_attributes(attributes));

create function private.touch_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at := statement_timestamp(); return new; end;
$$;
create function private.set_system_timestamps() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.created_at := statement_timestamp(); new.updated_at := new.created_at; return new; end;
$$;
create function private.protect_category_update() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.id <> old.id or new.user_id <> old.user_id or new.template_key is distinct from old.template_key or new.created_at <> old.created_at or new.color_key is not null then
    raise exception 'immutable category field changed' using errcode = '42501';
  end if;
  if old.template_key is not null and (new.name is distinct from old.name or new.name_key is distinct from old.name_key or new.sort_order is distinct from old.sort_order) then
    raise exception 'system category is protected' using errcode = '42501';
  end if;
  return new;
end;
$$;
create function private.protect_item_update() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.id <> old.id or new.user_id <> old.user_id or new.created_at <> old.created_at then
    raise exception 'immutable item field changed' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger categories_name_key before insert or update of name on public.categories for each row execute function private.set_category_name_key();
create trigger categories_protect_update before update on public.categories for each row execute function private.protect_category_update();
create trigger items_protect_update before update on public.items for each row execute function private.protect_item_update();
create trigger application_accounts_set_timestamps before insert on public.application_accounts for each row execute function private.set_system_timestamps();
create trigger category_templates_set_timestamps before insert on public.category_templates for each row execute function private.set_system_timestamps();
create trigger attribute_definitions_set_timestamps before insert on public.attribute_definitions for each row execute function private.set_system_timestamps();
create trigger categories_set_timestamps before insert on public.categories for each row execute function private.set_system_timestamps();
create trigger items_set_timestamps before insert on public.items for each row execute function private.set_system_timestamps();
create trigger application_accounts_touch_updated_at before update on public.application_accounts for each row execute function private.touch_updated_at();
create trigger category_templates_touch_updated_at before update on public.category_templates for each row execute function private.touch_updated_at();
create trigger attribute_definitions_touch_updated_at before update on public.attribute_definitions for each row execute function private.touch_updated_at();
create trigger categories_touch_updated_at before update on public.categories for each row execute function private.touch_updated_at();
create trigger items_touch_updated_at before update on public.items for each row execute function private.touch_updated_at();
revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.normalize_category_name(text) to authenticated;
grant execute on function private.validate_item_attributes(jsonb) to authenticated;
grant usage on schema private to service_role;
grant execute on function private.normalize_category_name(text) to service_role;
grant execute on function private.validate_item_attributes(jsonb) to service_role;

alter table public.items add constraint items_name_not_blank check (private.normalize_category_name(item_name) <> '');

alter table public.application_accounts enable row level security;
alter table public.category_templates enable row level security;
alter table public.attribute_definitions enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.application_accounts force row level security;
alter table public.category_templates force row level security;
alter table public.attribute_definitions force row level security;
alter table public.categories force row level security;
alter table public.items force row level security;

revoke all on table public.application_accounts, public.category_templates, public.attribute_definitions, public.categories, public.items from public, anon, authenticated;
grant all on table public.application_accounts, public.category_templates, public.attribute_definitions, public.categories, public.items to service_role;
grant select on table public.application_accounts, public.category_templates, public.attribute_definitions to authenticated;
grant select, insert, update, delete on table public.categories, public.items to authenticated;

create policy application_accounts_owner_select on public.application_accounts for select to authenticated using ((select auth.uid()) = user_id);
create policy category_templates_active_select on public.category_templates for select to authenticated using (exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy attribute_definitions_active_select on public.attribute_definitions for select to authenticated using (exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy categories_active_owner_select on public.categories for select to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy categories_active_owner_insert on public.categories for insert to authenticated with check ((select auth.uid()) = user_id and template_key is null and color_key is null and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy categories_active_owner_update on public.categories for update to authenticated
  using ((select auth.uid()) = user_id and template_key is null and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'))
  with check ((select auth.uid()) = user_id and template_key is null and color_key is null and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy categories_active_owner_delete on public.categories for delete to authenticated using ((select auth.uid()) = user_id and template_key is null and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy items_active_owner_select on public.items for select to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy items_active_owner_insert on public.items for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy items_active_owner_update on public.items for update to authenticated
  using ((select auth.uid()) = user_id and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'))
  with check ((select auth.uid()) = user_id and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
create policy items_active_owner_delete on public.items for delete to authenticated using ((select auth.uid()) = user_id and exists (select 1 from public.application_accounts a where a.user_id = (select auth.uid()) and a.status = 'active'));
