alter table players add column if not exists notes text;

drop index if exists players_sheet_index_key;
alter table players drop column if exists sheet_index;

create unique index if not exists players_name_key on players (name);