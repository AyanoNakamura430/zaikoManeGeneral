-- JavaScript clients represent persisted amounts as numbers. Keeping the
-- six-decimal scaled integer below 10^15 leaves sufficient IEEE-754 precision
-- to recover every permitted micro-unit without a decimal dependency.
alter table public.items
  drop constraint items_quantity_range,
  add constraint items_quantity_range check (
    quantity >= 0
    and quantity < 1000000000
    and quantity = round(quantity, 6)
  ),
  drop constraint items_threshold_range,
  add constraint items_threshold_range check (
    low_stock_threshold is null
    or (
      low_stock_threshold >= 0
      and low_stock_threshold < 1000000000
      and low_stock_threshold = round(low_stock_threshold, 6)
    )
  );
