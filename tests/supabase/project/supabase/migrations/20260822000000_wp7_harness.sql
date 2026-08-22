create table public.harness_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null check (status in ('pending', 'active', 'deleting'))
);

create table public.harness_categories (
  id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  primary key (id),
  unique (id, user_id)
);

create index harness_categories_owner_idx on public.harness_categories (user_id, id);

create table public.harness_items (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid,
  name text not null check (btrim(name) <> ''),
  quantity numeric not null check (quantity >= 0),
  foreign key (category_id, user_id)
    references public.harness_categories (id, user_id)
    on delete restrict
);

create index harness_items_owner_idx on public.harness_items (user_id, id);
create index harness_items_category_owner_idx on public.harness_items (category_id, user_id);

create table public.harness_grantless_items (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null
);

alter table public.harness_accounts enable row level security;
alter table public.harness_categories enable row level security;
alter table public.harness_items enable row level security;
alter table public.harness_grantless_items enable row level security;

revoke all on table public.harness_accounts from anon, authenticated;
revoke all on table public.harness_categories from anon, authenticated;
revoke all on table public.harness_items from anon, authenticated;
revoke all on table public.harness_grantless_items from anon, authenticated;

grant all on table public.harness_accounts to service_role;
grant all on table public.harness_categories to service_role;
grant all on table public.harness_items to service_role;
grant all on table public.harness_grantless_items to service_role;

grant select on table public.harness_accounts to authenticated;
grant select, insert, update, delete on table public.harness_categories to authenticated;
grant select, insert, update, delete on table public.harness_items to authenticated;

create policy "account owner can inspect lifecycle"
on public.harness_accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "active owner can read categories"
on public.harness_categories
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "active owner can insert categories"
on public.harness_categories
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "active owner can update categories"
on public.harness_categories
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "active owner can delete categories"
on public.harness_categories
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "active owner can read items"
on public.harness_items
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "active owner can insert items"
on public.harness_items
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "active owner can update items"
on public.harness_items
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "active owner can delete items"
on public.harness_items
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.harness_accounts account
    where account.user_id = (select auth.uid()) and account.status = 'active'
  )
);

create policy "grantless owner policy"
on public.harness_grantless_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create schema if not exists private;

create function private.harness_can_access_item(request_user_id uuid, request_item_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.harness_items item
    join public.harness_accounts account on account.user_id = item.user_id
    where item.id::text = request_item_id
      and item.user_id = request_user_id
      and account.status = 'active'
  );
$$;

revoke all on function private.harness_can_access_item(uuid, text) from public;
grant usage on schema private to authenticated;
grant execute on function private.harness_can_access_item(uuid, text) to authenticated;

create policy "active owner can read harness images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'harness-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.harness_can_access_item(
    (select auth.uid()),
    (storage.foldername(name))[2]
  )
);

create policy "active owner can insert harness images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'harness-private'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and private.harness_can_access_item(
    (select auth.uid()),
    (storage.foldername(name))[2]
  )
);
