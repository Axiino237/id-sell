-- ============================================
-- MISSING TABLES CREATION SCRIPT
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Categories Table (Optional - for future use)
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    created_at timestamptz default now()
);

-- 2. Promotion Requests Table
create table if not exists public.promotion_requests (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete cascade,
    seller_id uuid references public.users(id) on delete cascade,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Admin WhatsApp Groups Table
create table if not exists public.admin_whatsapp_groups (
    id uuid primary key default gen_random_uuid(),
    group_name text not null,
    group_url text not null,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
alter table public.categories enable row level security;
alter table public.promotion_requests enable row level security;
alter table public.admin_whatsapp_groups enable row level security;

-- Categories: Public read access (drop first if exists)
drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories"
on public.categories for select
using (true);

-- Categories: Admin only write access
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories for all
using (
    exists (
        select 1 from public.users
        where id = auth.uid() and role = 'admin'
    )
);

-- Promotion Requests: Sellers can create their own
drop policy if exists "Sellers can create promotion requests" on public.promotion_requests;
create policy "Sellers can create promotion requests"
on public.promotion_requests for insert
with check (auth.uid() = seller_id);

-- Promotion Requests: Sellers can view their own
drop policy if exists "Sellers can view own promotion requests" on public.promotion_requests;
create policy "Sellers can view own promotion requests"
on public.promotion_requests for select
using (auth.uid() = seller_id);

-- Promotion Requests: Admins can view and update all
drop policy if exists "Admins can manage promotion requests" on public.promotion_requests;
create policy "Admins can manage promotion requests"
on public.promotion_requests for all
using (
    exists (
        select 1 from public.users
        where id = auth.uid() and role = 'admin'
    )
);

-- Admin WhatsApp Groups: Admins only
drop policy if exists "Admins can manage WhatsApp groups" on public.admin_whatsapp_groups;
create policy "Admins can manage WhatsApp groups"
on public.admin_whatsapp_groups for all
using (
    exists (
        select 1 from public.users
        where id = auth.uid() and role = 'admin'
    )
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index if not exists idx_promotion_requests_product on public.promotion_requests(product_id);
create index if not exists idx_promotion_requests_seller on public.promotion_requests(seller_id);
create index if not exists idx_promotion_requests_status on public.promotion_requests(status);
