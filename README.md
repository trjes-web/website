# Artist Portfolio Website

Personal portfolio website for visual artists with admin panel for managing content.

## Features

- Homepage slideshow with up to 5 images
- Archive (exhibitions) with multiple images per entry
- Projects page with multiple images per entry
- CV popup with HTML formatting
- Contact page with email/Instagram
- Search functionality on archive page
- Anonymous page view analytics
- EU-compliant cookie consent

## Tech Stack

- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Image Storage**: Cloudinary

---

## Deployment Guide (Railway)

### Prerequisites

1. GitHub account
2. Railway account (free tier available)
3. Cloudinary account (free tier: 25GB)

### Step 1: Setup Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From your Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Deploy to Railway

1. Push this code to a GitHub repository
2. Go to [railway.app](https://railway.app) and sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will auto-detect Node.js and start building

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically creates `DATABASE_URL` environment variable

### Step 4: Set Environment Variables

In Railway, go to your service → **Variables** and add:

| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | Your secure admin password |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `NODE_ENV` | `production` |

### Step 5: Initialize Database

After deploy, in Railway terminal run:

```bash
npm run db:push
```

### Step 6: Connect Your Domain

1. In Railway: **Settings** → **Networking** → **Custom Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Railway provides DNS records (A record, CNAME)
4. Add these records at your domain registrar

---

## Domain Transfer from Canva

1. Log into Canva → Go to domain settings
2. Click **"Transfer domain"** or **"Unlock domain"**
3. Get your **EPP/Authorization code**
4. You can either:
   - Transfer to another registrar (Namecheap, Cloudflare)
   - Keep at Canva and point DNS to Railway

### DNS Settings at Canva

1. Go to your domain's DNS settings
2. Delete existing A/CNAME records for the root domain
3. Add Railway's DNS records:
   - **A Record**: `@` → Railway's IP address
   - **CNAME**: `www` → Your Railway domain

DNS changes can take up to 48 hours to propagate.

---

## Using Your Website

### Admin Panel

Access admin at: `yourdomain.com/admin`

Default password: Set in `ADMIN_PASSWORD` environment variable

### What You Can Manage

| Section | URL |
|---------|-----|
| Slideshow, News, Pages | `/admin` |
| Archive entries | `/admin/archive` |
| Projects | `/admin/projects` |
| CV content | `/admin` (scroll down) |
| Contact info | `/admin` |
| Analytics | `/admin` |

### Adding Content

1. **Slideshow Images**: Admin → Upload up to 5 images
2. **Archive Entry**: Admin → Manage Archive → Add title, images, description
3. **Projects**: Admin → Manage Projects → Add title, images, description
4. **News Line**: Admin → Edit news line (shows on homepage)
5. **CV**: Admin → Edit CV content (supports HTML: `<b>`, `<u>`, `<span class="serif">`)

---

## Local Development

```bash
# Install dependencies
npm install

# Start database (requires PostgreSQL)
npm run db:push

# Start dev server
npm run dev
```

Server runs at `http://localhost:5000`

---

## Costs

| Service | Cost |
|---------|------|
| Railway | ~$5-10/month (usage-based) |
| Cloudinary | Free up to 25GB |
| Domain | Your existing cost |
