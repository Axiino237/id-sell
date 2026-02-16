-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade not null primary key,
  name text,
  role text check (role in ('admin', 'seller')) default 'seller',
  whatsapp_number text,
  status text check (status in ('active', 'inactive', 'soft_deleted')) default 'active',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- PRODUCTS TABLE
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null,
  images text[] default array[]::text[],
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean default true,
  is_promoted boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- PROMOTION REQUESTS TABLE
create table if not exists public.promotion_requests (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  seller_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.promotion_requests enable row level security;

-- ADMIN WHATSAPP GROUPS TABLE
create table if not exists public.admin_whatsapp_groups (
  id uuid default uuid_generate_v4() primary key,
  group_name text not null,
  group_url text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.admin_whatsapp_groups enable row level security;

-- ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.announcements enable row level security;

-- CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- RLS POLICIES

-- USERS
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Admins can view all users" on public.users;
create policy "Admins can view all users"
  on public.users for select
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update all users" on public.users;
create policy "Admins can update all users"
  on public.users for update
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete users" on public.users;
create policy "Admins can delete users"
  on public.users for delete
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- PRODUCTS
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
  on public.products for select
  using (is_active = true);

drop policy if exists "Sellers can insert products" on public.products;
create policy "Sellers can insert products"
  on public.products for insert
  with check (auth.uid() = seller_id);

drop policy if exists "Sellers can update own products" on public.products;
create policy "Sellers can update own products"
  on public.products for update
  using (auth.uid() = seller_id);

drop policy if exists "Admins can update any product" on public.products;
create policy "Admins can update any product"
  on public.products for update
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete any product" on public.products;
create policy "Admins can delete any product"
  on public.products for delete
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

drop policy if exists "Sellers can delete own products" on public.products;
create policy "Sellers can delete own products"
  on public.products for delete
  using (auth.uid() = seller_id);

-- PROMOTION REQUESTS
drop policy if exists "Sellers can view own promotion requests" on public.promotion_requests;
create policy "Sellers can view own promotion requests"
  on public.promotion_requests for select
  using (auth.uid() = seller_id);

drop policy if exists "Sellers can create promotion requests" on public.promotion_requests;
create policy "Sellers can create promotion requests"
  on public.promotion_requests for insert
  with check (auth.uid() = seller_id);

drop policy if exists "Admins can view all promotion requests" on public.promotion_requests;
create policy "Admins can view all promotion requests"
  on public.promotion_requests for select
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update promotion requests" on public.promotion_requests;
create policy "Admins can update promotion requests"
  on public.promotion_requests for update
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ANNOUNCEMENTS
drop policy if exists "Public can view announcements" on public.announcements;
create policy "Public can view announcements"
  on public.announcements for select
  using (is_active = true);

drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements"
  on public.announcements for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- CATEGORIES
drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories"
  on public.categories for select
  using (true);

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- WHATSAPP GROUPS
drop policy if exists "Public can view active whatsapp groups" on public.admin_whatsapp_groups;
create policy "Public can view active whatsapp groups"
  on public.admin_whatsapp_groups for select
  using (is_active = true);

drop policy if exists "Admins can manage whatsapp groups" on public.admin_whatsapp_groups;
create policy "Admins can manage whatsapp groups"
  on public.admin_whatsapp_groups for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- TRIGGERS

-- Function to handle promotion approval
create or replace function public.handle_promotion_approval()
returns trigger as $$
begin
  if new.status = 'approved' and old.status != 'approved' then
    update public.products
    set is_promoted = true
    where id = new.product_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for promotion approval
drop trigger if exists on_promotion_approved on public.promotion_requests;
create trigger on_promotion_approved
  after update on public.promotion_requests
  for each row
  execute function public.handle_promotion_approval();

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, role)
  values (new.id, new.raw_user_meta_data->>'name', 'seller');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- STORAGE POLICIES
drop policy if exists "Sellers can upload product images" on storage.objects;
create policy "Sellers can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'products' AND
    auth.role() = 'authenticated'
  );

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "Sellers can delete own product images" on storage.objects;
create policy "Sellers can delete own product images"
  on storage.objects for delete
  using (
    bucket_id = 'products' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

