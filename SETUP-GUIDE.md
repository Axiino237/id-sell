# 🚀 Quick Setup Guide - Database Tables

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
- Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Select your project
- Click on **SQL Editor** in the left sidebar

### 2. Create Missing Tables
1. Click **"New Query"** button
2. Open the file `create-missing-tables.sql` from your project
3. **Copy ALL the SQL content** from that file
4. **Paste it into the Supabase SQL Editor**
5. Click **"Run"** (or press Ctrl+Enter)

### 3. Verify Tables Created
After running the SQL, verify the tables exist:
- Click on **"Table Editor"** in the left sidebar
- You should now see these tables:
  - ✅ `announcements`
  - ✅ `categories`
  - ✅ `promotion_requests`
  - ✅ `admin_whatsapp_groups`
  - ✅ `users` (already existed)
  - ✅ `products` (already existed)

### 4. Test Your Dashboard
Once tables are created, test these pages:

**Admin Dashboard:**
- http://localhost:3001/admin/announcements
- http://localhost:3001/admin/promotions
- http://localhost:3001/admin/settings
- http://localhost:3001/admin/users

**Seller Dashboard:**
- http://localhost:3001/seller/products
- http://localhost:3001/seller/settings

All pages should now load without errors! 🎉

---

## Troubleshooting

**If you see "permission denied" errors:**
- Make sure you're logged in with an admin account
- The RLS policies were created automatically by the SQL script

**If tables don't appear:**
- Refresh the Table Editor page
- Try running the SQL again (it's safe to run multiple times)

**Need help?**
Let me know which step you're stuck on and I'll assist!
