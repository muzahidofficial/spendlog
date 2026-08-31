# SpendLog — Database + Admin + PWA

This version is designed for **GitHub → Vercel** deployment and persistent **Supabase** storage.

## 1. Create the database
Create a Supabase project, open **SQL Editor**, and run the full contents of `database.sql`.

## 2. Add Vercel Environment Variables
In Vercel → Project → Settings → Environment Variables add:

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase service-role key (keep secret; never put it in index.html)
- `ADMIN_PASSWORD` = the password used for `admin.html`

Apply them to Production, Preview, and Development if desired, then redeploy.

## 3. Deploy
Push every file/folder in this package to the root of your GitHub repository and connect the repo to Vercel. No build command is required.

## Data storage behavior
- Expenses are stored in the Supabase `expenses` table.
- Finished/out-of-stock item requests are stored in `item_requests`.
- Admin status changes are stored back to the database.
- The main PWA keeps a local cache for display/offline safety, but successful writes use the database.
- `SUPABASE_SERVICE_ROLE_KEY` is only read by `/api/*` serverless code and is not sent to the browser.

## Admin panel
Open `/admin.html`, enter the `ADMIN_PASSWORD`, then manage item request statuses and delete records.

## Request workflow
Pending → Approved → Purchased / Restocked → Completed. Rejected is also available.
