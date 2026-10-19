# Connecting Loopt to Supabase

The store talks to Postgres through Drizzle + `pg`, so Supabase works with **one environment variable**.

## 1. Create the database
1. Create a project on https://supabase.com.
2. Open **SQL Editor** → paste `supabase/migrations/0001_init.sql` → **Run**.
   (Or run `DATABASE_URL=... npx drizzle-kit push --config=drizzle.supabase.config.ts`.)

## 2. Point the app at Supabase
Project Settings → Database → **Connection string (URI)**, then set:

```
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

- Use the **Transaction pooler** (port 6543) on serverless hosts such as Vercel.
- SSL is switched on automatically for non-local hosts (`src/db/index.ts`).
- The catalogue (34 products + reviews, prices in MRU) seeds itself on the first page load when the `products` table is empty.

## 3. Optional: Supabase JS client (Auth, Storage, Realtime)
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server only
```
Use `getSupabase()` / `getSupabaseAdmin()` from `src/lib/supabase.ts`.

## 4. Store owner's WhatsApp
```
NEXT_PUBLIC_WHATSAPP_NUMBER=222XXXXXXXX   # country code + number, digits only
```
Every "Order on WhatsApp" button opens `https://wa.me/<number>` with the order pre-written.

## Security notes
- Row Level Security is enabled on every table. `products` and `reviews` are publicly readable; `orders` and `subscribers` have no public policy (only the server can access them).
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` to the browser.
