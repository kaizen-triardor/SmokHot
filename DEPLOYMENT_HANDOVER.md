# SmokHot - Deployment Handover Document

## What We Need From the Client

Before we can put the website live, we need the following from the client (Smokin' Hot brand owner).

---

### 1. DOMAIN (Required)

- [ ] **Domain name** — Does the client already own a domain? (e.g., smokhot.rs, smokinhot.rs)
- [ ] If not, which domain do they want? We'll register it for them
- [ ] **Domain registrar access** — Login credentials to where the domain is managed (e.g., Loopia, EUnet, or wherever .rs domains are registered)

> We need this to point the domain to our hosting server.

---

### 2. EMAIL (Required for orders to work)

The website sends emails when:
- A customer places an order (notification to the owner)
- Someone fills out the contact form

**Option A: Gmail (Easiest)**
- [ ] A Gmail account for the business (e.g., info@gmail.com or their existing one)
- [ ] Generate a Gmail "App Password" (not regular password):
  1. Go to https://myaccount.google.com/security
  2. Enable 2-Factor Authentication
  3. Go to App Passwords → Generate one for "Mail"
  4. Give us the 16-character app password

**Option B: Business Email (Professional)**
- [ ] If client has business email (info@smokhot.rs), we need SMTP details:
  - SMTP server address
  - SMTP port
  - Email username
  - Email password

**Option C: We set up SendGrid (Best for reliability)**
- [ ] We create a free SendGrid account (100 emails/day free)
- [ ] Client just needs to verify their domain

---

### 3. PRODUCT IMAGES (Required)

Currently the website uses placeholder graphics. We need:

- [ ] **Product photos for each sauce** (6 sauces):
  1. Gecko Mild
  2. Fireant Hot
  3. Firefly Extra Hot
  4. Jackal Smokin' Hot
  5. Smoke & Mirrors BBQ
  6. Green Fury
- [ ] For each sauce: **1 main photo** (bottle on dark background, high res)
- [ ] Optional: 2-3 gallery photos per sauce (bottle with food, ingredients, etc.)
- [ ] **Format:** PNG or JPG, minimum 800x800px, ideally on dark/transparent background
- [ ] **Logo:** We already have SmokHotLogo.png — confirm this is the final version

---

### 4. BUSINESS INFORMATION (Required — verify/update)

Currently the website shows placeholder info. Confirm or update:

- [ ] **Business name** (legal): _______________
- [ ] **Phone number**: +381 ___ ___ ____
- [ ] **Email for orders**: _______________
- [ ] **Email for contact form**: _______________
- [ ] **Physical address** (shown on contact page): _______________
- [ ] **Working hours**: _______________
- [ ] **Social media links**:
  - [ ] Instagram: @_______________
  - [ ] Facebook: _______________
  - [ ] TikTok: @_______________

---

### 5. PRODUCT DETAILS (Verify)

For each sauce, confirm these are correct:

| Sauce | Price (RSD) | Volume | Scoville | In Stock? |
|-------|------------|--------|----------|-----------|
| Gecko Mild | 590 | 150ml | 1,500 | Yes |
| Fireant Hot | 640 (was 690) | 150ml | 5,500 | Yes |
| Firefly Extra Hot | 720 | 150ml | 15,000 | Yes |
| Jackal Smokin' Hot | 850 | 150ml | 45,000 | Yes |
| Smoke & Mirrors BBQ | 650 | 200ml | 50 | Yes |
| Green Fury | 620 | 150ml | 4,500 | Yes |

- [ ] Are all prices correct?
- [ ] Are all products currently in stock?
- [ ] Any products to add or remove?

---

### 6. SHIPPING DETAILS (Verify)

- [ ] **Delivery cost**: 300 RSD (currently set)
- [ ] **Free delivery threshold**: 3,000 RSD (currently set)
- [ ] **Delivery timeframe**: 1-3 business days (currently shown)
- [ ] **Delivery provider**: Who delivers? (Posta, BEX, AKS, D-Express?)
- [ ] **Cash on Delivery only?** Or also card payments planned?

---

### 7. ADMIN ACCESS (We Set Up)

The admin dashboard lets the client manage:
- Products (add, edit, delete, pricing, stock)
- Orders (view, update status, track)
- Blog posts (write, publish, draft)
- Gallery (upload photos, categorize)
- Tour events
- Website content (hero text, about page)
- Settings (delivery cost, free shipping threshold)

**We will create admin credentials for the client:**
- Admin URL: https://[domain]/admin
- Default login: admin@smokhot.rs / [we'll set a secure password]

---

### 8. LEGAL (Nice to have)

- [ ] **Privacy Policy** — Does the client have one? (Required by Serbian law for e-commerce)
- [ ] **Terms & Conditions** — Return policy, delivery terms
- [ ] **Business registration number** (PIB/Maticni broj) — for footer/legal page

---

## Deployment Steps (For Developer)

Once we have everything above, here's what we do:

### Step 1: Set Up Database (PostgreSQL)

The website currently uses SQLite (local file). For production we need PostgreSQL.

**Option A: Supabase (Free tier)**
1. Create project at https://supabase.com
2. Get the connection string from Settings → Database
3. Update `DATABASE_URL` in environment variables

**Option B: Neon (Free tier)**
1. Create database at https://neon.tech
2. Get connection string
3. Update `DATABASE_URL`

**After getting the URL:**
```bash
# Update prisma schema provider from sqlite to postgresql
# In prisma/schema.prisma, change:
#   provider = "sqlite"  →  provider = "postgresql"

# Push schema to new database
npx prisma db push

# Create admin user
npx prisma db seed
```

### Step 2: Deploy to Vercel

1. Push code to GitHub (already at github.com/kaizen-triardor/SmokHot)
2. Go to https://vercel.com → Import Project → Select SmokHot repo
3. Set environment variables in Vercel dashboard:

```
DATABASE_URL=postgresql://...  (from Step 1)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://smokhot.rs
DEFAULT_ADMIN_EMAIL=admin@smokhot.rs
DEFAULT_ADMIN_PASSWORD=<secure password>
ORDER_EMAIL=<client's email>
NEXT_PUBLIC_ORDER_EMAIL=<client's email>
GMAIL_USER=<client's gmail>
GMAIL_APP_PASSWORD=<app password>
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5000000
DELIVERY_COST=300
FREE_DELIVERY_THRESHOLD=3000
```

4. Deploy

### Step 3: Connect Domain

1. In Vercel → Project Settings → Domains → Add `smokhot.rs`
2. Vercel will show DNS records to add
3. Go to domain registrar → DNS settings → Add the records
4. Wait for propagation (5 min to 48 hours)

### Step 4: Enable Email

1. Uncomment the Nodemailer code in `src/app/api/send-email/route.ts`
2. Set Gmail credentials in Vercel environment variables
3. Redeploy

### Step 5: Migrate from SQLite to PostgreSQL

In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then:
```bash
npx prisma generate
npx prisma db push
```

### Step 6: Seed Initial Data

Create a seed script or manually add via admin dashboard:
- All 6 products with correct data
- Admin user account
- Initial blog posts (if any)

### Step 7: Final Checklist

- [ ] All product images uploaded
- [ ] Admin can log in
- [ ] Test order flow (place order → email received → shows in admin)
- [ ] Contact form sends email
- [ ] Blog posts display correctly
- [ ] Gallery works
- [ ] Mobile responsive check
- [ ] SSL certificate active (Vercel handles automatically)
- [ ] Social media links correct
- [ ] Business info correct on all pages

---

## Monthly Costs Estimate

| Service | Cost | Notes |
|---------|------|-------|
| Vercel (hosting) | Free | Hobby plan, unlimited deploys |
| Supabase (database) | Free | 500MB, 50K requests/month |
| Domain (.rs) | ~2,000 RSD/year | Annual renewal |
| Gmail (email) | Free | Uses client's existing Gmail |
| **Total** | **~2,000 RSD/year** | Just the domain cost |

If the site grows beyond free tiers:
- Vercel Pro: $20/month
- Supabase Pro: $25/month

---

## Support & Maintenance

After deployment, the client can:
- Manage all content through `/admin` dashboard
- Add/edit products, prices, stock
- Write blog posts
- Upload gallery photos
- View and process orders
- Update tour events

For technical changes (new features, design updates), contact the developer.
