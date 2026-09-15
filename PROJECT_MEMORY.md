# AUREON - E-commerce Project Memory & Roadmap

---

## CRITICAL RULES FOR AI AGENT (READ FIRST!)

1. **ALWAYS read this file at the start of every new conversation** before taking any action.
2. **ALL DEPLOYMENTS** to the live server must be done **automatically by the AI Agent** using `Aureon.key`.
   - Build → `npm run build`
   - Compress → `Compress-Archive -Path dist\* -DestinationPath dist.zip -Force`
   - Upload frontend → `scp -i Aureon.key ...dist.zip ubuntu@152.67.0.141:/home/ubuntu/`
   - Deploy frontend → `sudo rm -rf /var/www/aureon/* && sudo unzip -o /home/ubuntu/dist.zip -d /var/www/aureon/ && sudo chown -R www-data:www-data /var/www/aureon/`
   - Upload backend → `scp -i Aureon.key server/server.js ubuntu@152.67.0.141:/home/ubuntu/server/server.js`
   - Restart backend → `pm2 restart aureon-backend`
3. The user will **NEVER** manually copy files. The AI must do it all.

---

## Core Concept
- **Inspiration:** Fabrilife.com
- **Brand Name:** AUREON
- **Domain:** aureonbd.com
- **Live Server IP:** 152.67.0.141 (Oracle VM, Ubuntu)
- **SSH Key:** `Aureon.key` (in workspace root `C:\A DEV\NABILS FRIEND\`)
- **Design Style:** Minimalist, premium, monochromatic (Black/White) with clean sans-serif typography.
- **Payment:** Cash On Delivery (COD) ONLY.
- **No Google Play / App Store** buttons anywhere.

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite (SPA) |
| Styling | Vanilla CSS (`index.css`) |
| Backend | Node.js + Express |
| Database | MySQL (`aureon_db`) |
| Auth | Firebase (Google Sign-In) + JWT |
| File Upload | Multer (stores to `/uploads/`) |
| Process Manager | PM2 (`aureon-backend`) |
| Web Server | Nginx (serves `/var/www/aureon/`) |

---

## Project File Structure (Key Files)
```
C:\A DEV\NABILS FRIEND\
├── server/
│   └── server.js                  ← Node.js Express backend (ALL API routes)
├── src/
│   ├── App.jsx                    ← Router + global providers
│   ├── index.css                  ← Entire design system
│   ├── context/
│   │   ├── CartContext.jsx
│   │   ├── UserContext.jsx
│   │   ├── ToastContext.jsx
│   │   └── WishlistContext.jsx    ← NEW: Wishlist (localStorage)
│   ├── components/
│   │   ├── Header.jsx             ← Stores, Profile dropdown, Wishlist, Bag icons
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx        ← Wishlist toggle, hover gallery, add to cart animation
│   │   ├── WhatsAppWidget.jsx     ← Floating WhatsApp bubble
│   │   ├── CartDrawer.jsx
│   │   └── AnnouncementBanner.jsx
│   ├── pages/
│   │   ├── Home.jsx               ← Bento grid for new_arrivals
│   │   ├── Shop.jsx
│   │   ├── ProductDetails.jsx     ← Gallery thumbnails, specs, size chart
│   │   ├── Checkout.jsx
│   │   ├── Wishlist.jsx           ← NEW: Wishlist page
│   │   ├── PolicyPage.jsx         ← /privacy-policy, /refund-policy, /terms-of-service
│   │   └── admin/
│   │       ├── AdminLogin.jsx     ← Only allows mdtowhid5577@gmail.com
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProducts.jsx  ← Full CRUD + gallery upload + specs + size chart builder
│   │       ├── AdminCategories.jsx
│   │       ├── AdminOrders.jsx
│   │       ├── AdminSettings.jsx  ← Hotline, WhatsApp, Email, Favicon, Social Links
│   │       ├── AdminPolicies.jsx  ← Edit Privacy/Refund/Terms pages
│   │       └── AdminUsers.jsx     ← Manage admin email whitelist
└── Aureon.key                     ← SSH private key for Oracle VM
```

---

## Database Schema (MySQL - `aureon_db`)

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK | |
| title | VARCHAR(255) | |
| price | DECIMAL | |
| oldPrice | DECIMAL | |
| isSale | BOOLEAN | Shows SALE badge |
| imageUrl | VARCHAR | Primary image (uploaded via multer) |
| category | VARCHAR | slug |
| subcategory | VARCHAR | slug |
| sizes | JSON | Array of size strings e.g. `["M","L","XL"]` |
| stock | INT | |
| description | TEXT | |
| gallery | JSON | Array of image URLs/paths for additional images |
| specifications | JSON | Array of bullet point strings |
| size_chart | JSON | `{ headers: [...], rows: [[...]] }` |
| created_at | TIMESTAMP | |

### Other tables
- `categories` (id, name, slug)
- `subcategories` (id, category_id, name, slug)
- `orders` (id, customer_name, phone, email, city, postal_code, address, total_amount, items_json, status)
- `users` (id, firebase_uid, name, email, photo_url, role)
- `features` (id, title, description, icon, is_active, display_order)
- `announcements` (id, type, message, link_url, is_active)
- `hero_sliders` (id, image_url, link_url, is_active)
- `settings` (setting_key, setting_value) ← key-value store
- `policies` (policy_key, title, content)
- `homepage_sections` (id, section_key, title, is_active, display_order)
- `visits` (id, ip_address, visited_at)

---

## Settings System
Settings are stored in the `settings` table and served via `/api/public-settings`.
They are cached in `sessionStorage` as `publicSettings` for component access.

| Setting Key | Purpose |
|-------------|---------|
| `hotline` | Phone number in announcement bar |
| `whatsapp_number` | WhatsApp number for widget & bar |
| `contact_email` | Email in announcement bar |
| `favicon_url` | Browser favicon |
| `logo_url` | Optional custom logo |
| `facebook_url` | Social link |
| `instagram_url` | Social link |

---

## Admin Access Control
- **Admin Login:** Only `mdtowhid5577@gmail.com` can log in (hardcoded check in `AdminLogin.jsx`).
- **Additional admin emails** can be added from `Admin Panel → Users`.
- Auth uses Firebase Google Sign-In → Firebase UID verified server-side → JWT issued.

---

## Features Implemented (As of Last Session)

### ✅ Header
- Stores, Profile (with dropdown: Sign in/up, Track Order, Corporate Sales, About Us), Wishlist (with badge count), Bag (cart) icons
- Announcement bar showing Hotline, WhatsApp, Email from settings

### ✅ Product Cards
- 1:1 aspect ratio enforced
- Hover animation: fades to 2nd gallery image
- Wishlist heart toggle (red fill when saved)
- Add to Cart animation: button turns green + toast notification with product image

### ✅ Wishlist
- Context: `WishlistContext.jsx` (persisted to `localStorage`)
- Page: `/wishlist` shows all saved products
- Heart icon in header shows badge count

### ✅ Home Page
- Bento Grid layout for "New Arrivals" section (first product spans 2×2)
- Floating WhatsApp widget (bottom-right)

### ✅ Product Details Page
- Clickable gallery thumbnails (switch main image)
- "--- Select Size ---" styled selector with pill buttons
- **Detailed Specifications** section (bullet points from DB)
- **Size Chart** table (red border, dynamic columns from DB)

### ✅ Admin Products Page
- Full CRUD with image upload
- Gallery section: **Upload up to 10 files** OR paste URLs
- Preview saved gallery images with individual delete
- **Specifications Builder**: add/remove bullet points interactively
- **Size Chart Builder**: dynamic columns + rows with inline editing

### ✅ Admin Settings
- Manage Hotline, WhatsApp, Email, Favicon, Social Links

### ✅ Admin Policies
- Edit Privacy Policy, Refund Policy, Terms of Service (rendered on public pages)

### ✅ Policy Pages
- `/privacy-policy`, `/refund-policy`, `/terms-of-service` — all dynamic from Admin

---

## Known Issues / Watchouts
- When editing `Header.jsx`, always ensure `useEffect` is imported from React (was missing once, caused white screen)
- `Checkout.jsx` also needs `useEffect` imported
- Backend runs on port 5000, Nginx proxies `/api/` to it
- Multer stores uploads in `/home/ubuntu/server/uploads/` on the live server
- The `unzip` command gives exit code 1 with the backslash warning — this is harmless, files still extract correctly

---

## Deployment Commands (Copy-Paste Ready)

```powershell
# Full deploy (from C:\A DEV\NABILS FRIEND)
npm run build
Compress-Archive -Path dist\* -DestinationPath dist.zip -Force
scp -i Aureon.key -o StrictHostKeyChecking=no dist.zip ubuntu@152.67.0.141:/home/ubuntu/
scp -i Aureon.key -o StrictHostKeyChecking=no server/server.js ubuntu@152.67.0.141:/home/ubuntu/server/server.js
ssh -i Aureon.key -o StrictHostKeyChecking=no ubuntu@152.67.0.141 "sudo rm -rf /var/www/aureon/* && sudo unzip -o /home/ubuntu/dist.zip -d /var/www/aureon/ && sudo chown -R www-data:www-data /var/www/aureon/ && pm2 restart aureon-backend"
```

---

*Last updated: 2026-08-20 by AI Agent after implementing: Gallery file upload, Size Chart builder, Specifications builder, Wishlist feature, Header redesign (Stores/Profile/Wishlist/Bag layout), and full mobile responsiveness.*
