# Auburn Farms Kiosk — Deployment Guide

## What this is

A working Next.js project for the Auburn Farms touchscreen kiosk. Same UI as the HTML demo, but with one major upgrade: **it auto-pulls live data from hollandhomesllc.com once a day overnight**. Listings, prices, and the promo banner stay current without anyone touching it.

---

## What auto-updates

The kiosk fetches `https://hollandhomesllc.com/community/auburn-farms/` once every 24 hours and pulls out:

- **Available homes** (lot, plan, price, beds, baths, sqft) — every listing currently on the page
- **Current incentive banner** (the "This Summer, Come Home for Less" type promotion that changes seasonally)

If the scrape ever fails (site down, page restructured, network glitch), the kiosk shows the last known good data. It never goes blank.

You can see what's currently scraped by visiting `/api/listings` on the live site after deployment.

---

## Deploying to Vercel (~15 minutes)

You don't need to write any code. Vercel is a free hosting service made for projects like this.

### Step 1 — Create accounts

1. Go to https://github.com and create a free account if you don't have one
2. Go to https://vercel.com and click "Sign up with GitHub"

### Step 2 — Get the code onto GitHub

The simplest way (no command line needed):

1. Go to https://github.com/new
2. Repository name: `auburn-farms-kiosk`
3. Keep it private (or public, doesn't matter)
4. Don't initialize with a README, .gitignore, or license
5. Click "Create repository"
6. On the next screen, click **"uploading an existing file"** (it's a link in the middle of the page)
7. Drag the entire `auburn-farms-kiosk` folder (this whole project) into the upload zone
8. Scroll down, type "initial commit" as the message, click "Commit changes"

### Step 3 — Deploy to Vercel

1. Go to https://vercel.com/new
2. Click **"Import"** next to your `auburn-farms-kiosk` repo (you may need to grant Vercel access to it first)
3. Don't change any settings — Vercel auto-detects everything
4. Click **"Deploy"**
5. Wait about 90 seconds. When it's done, you'll see a confetti animation and a URL like `auburn-farms-kiosk-xyz.vercel.app`

That's it. Open the URL in any browser — the kiosk is live. Open it in Chrome on the mini-PC, press F11 for full-screen, and you have your kiosk.

### Step 4 — Test that it's pulling live data

Open `https://your-url.vercel.app/api/listings` in a browser. You should see JSON like:

```json
{
  "homes": [ ... 40 listings ... ],
  "incentive": { ... current promo ... },
  "scrapedAt": "2026-06-06T12:00:00.000Z",
  "source": "live"
}
```

If `"source": "live"`, you're in business. If `"source": "fallback-..."`, the scraper hit a snag — see Troubleshooting below.

---

## Pointing your own domain at it (optional)

You can give this a real URL like `kiosk.hollandhomesllc.com` if you want. It's free.

1. In your Vercel dashboard, open the kiosk project
2. Click **Settings → Domains**
3. Type `kiosk.hollandhomesllc.com` and click "Add"
4. Vercel will give you a DNS record (something like CNAME → cname.vercel-dns.com)
5. Send that record to whoever manages DNS for hollandhomesllc.com — they add it, and within an hour, the subdomain works

If you don't have access to DNS, ping me when you want to do this and I can help you write the email to your web host.

---

## How to update the kiosk later

If you want to change anything (swap a photo, edit the journey content, change the welcome message), you have two paths:

**Easy path** — Tell me what you want changed, I produce a new file, you re-upload it to GitHub via the same drag-and-drop. Vercel automatically rebuilds and redeploys within 60 seconds.

**Advanced path** — Edit files directly in GitHub's web editor (yes, you can edit code in your browser).

The listings and incentive banner update **on their own** every 24 hours, so you never need to touch the code for that. The auto-update happens at midnight UTC, which is 7pm Central time. By the time anyone visits the kiosk the next morning, fresh data is loaded.

---

## What to do next (after you're live)

These are nice-to-haves we discussed earlier. None are blockers.

1. **Lead capture destination** — Right now the contact form just logs to the browser console. We need to wire it up to send leads somewhere: an email, a Google Sheet, your CRM. Tell me what you want and I'll add it.
2. **Map screen** — Currently shows a styled placeholder. We can wire up a real Google Maps embed (free, no API key needed for simple embeds).
3. **Mini-PC setup guide** — Once you have the hardware behind the TV, I'll write you a one-pager: which mini-PC to buy, Chrome kiosk-mode config, auto-launch on boot, screensaver settings, remote management.
4. **HubSpot integration** — When you're ready, we can pipe leads from the kiosk straight into HubSpot as Contacts with a "Source: Auburn Farms Kiosk" tag.

---

## Troubleshooting

**The kiosk loads but shows old data**

This is normal for the first 24 hours after deploy if the scraper hasn't run yet. Visit `/api/listings` once and it should populate. After that, Vercel handles the daily refresh automatically.

**The scraper returns `"source": "fallback-zero-homes"`**

The page structure on hollandhomesllc.com changed and our parser couldn't find listings. Send me a note and I'll update the parser. Takes ~5 minutes.

**The kiosk shows the wrong incentive**

Either the scraper missed the new promo on the page, or the page hasn't been updated yet by your web team. If you want to override what shows on the kiosk, that's an easy code change.

**A photo isn't loading**

All photos live in `/public/images/`. You can swap any of them by uploading a new file with the same name in GitHub. Vercel redeploys automatically.

---

## File map

```
auburn-farms-kiosk/
├── app/
│   ├── api/listings/route.js    ← The scraper that runs every 24h
│   ├── layout.js                ← HTML wrapper + fonts
│   ├── page.js                  ← Server entry, fetches live data
│   └── KioskApp.jsx             ← The actual kiosk UI (all screens)
├── public/images/               ← Model home + amenity photos
├── package.json                 ← Dependencies (Vercel reads this)
├── next.config.js               ← Next.js config
└── README.md                    ← You are here
```

---

Questions? Send them my way.
