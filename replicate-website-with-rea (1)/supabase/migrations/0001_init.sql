-- Loopt store schema for Supabase (run in the SQL Editor, or `supabase db push`).
-- Equivalent to src/db/schema.ts. All prices are in MRU (new ouguiya), stored as integers.

create table if not exists products (
  id serial primary key,
  slug text not null unique,
  name text not null,
  brand text not null,
  category text not null,
  kind text not null,
  price integer not null,
  compare_at_price integer,
  storage text,
  color_name text not null,
  color text not null,
  grade text not null default 'Excellent',
  battery_health integer,
  rating real not null default 4.8,
  review_count integer not null default 0,
  badge text,
  stock integer not null default 10,
  featured boolean not null default false,
  image text not null default '/products/iphone-15.webp',
  description text not null,
  created_at timestamp not null default now()
);
create index if not exists products_category_idx on products (category);

create table if not exists reviews (
  id serial primary key,
  product_id integer not null references products(id) on delete cascade,
  author text not null,
  rating integer not null,
  body text not null,
  created_at timestamp not null default now()
);

create table if not exists orders (
  id serial primary key,
  reference text not null unique,
  customer_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  address text not null,
  payment_method text not null,
  items jsonb not null,
  subtotal integer not null,
  shipping integer not null,
  total integer not null,
  status text not null default 'confirmed',
  created_at timestamp not null default now()
);

create table if not exists subscribers (
  id serial primary key,
  email text not null unique,
  created_at timestamp not null default now()
);

-- Row Level Security --------------------------------------------------------
-- The Next.js server connects with the database owner role (DATABASE_URL), which bypasses RLS.
-- These policies only matter if you also expose the tables through the Supabase REST API / anon key.
alter table products enable row level security;
alter table reviews enable row level security;
alter table orders enable row level security;
alter table subscribers enable row level security;

drop policy if exists "public can read products" on products;
create policy "public can read products" on products for select using (true);

drop policy if exists "public can read reviews" on reviews;
create policy "public can read reviews" on reviews for select using (true);

-- orders & subscribers: no policies = private (only the server / service role can access them).
