// app/lib/scraper.js
//
// Shared scraping logic. Used by both the API route (/api/listings) and the
// page (page.js). Calling it directly from page.js avoids the build-time
// chicken-and-egg problem where the page tried to fetch its own API
// before the API was deployed.
// ===================================================================

const LISTINGS_URL = 'https://hollandhomesllc.com/community/auburn-farms/';
const MAP_URL = 'https://hollandhomesllc.com/maps/auburn-farms/';

const FALLBACK = {
  homes: [],
  incentive: {
    eyebrow: 'Limited-Time Offer',
    headline: 'Ask About Current Incentives',
    sub: 'Contact our team for the latest savings.',
  },
  mapImage: null,
  scrapedAt: null,
  source: 'fallback',
};

export async function scrapeAll() {
  try {
    const [homes, incentive, mapImage] = await Promise.all([
      fetchAndParseHomes(),
      fetchAndParseIncentive(),
      fetchMapImage(),
    ]);

    if (homes.length === 0) {
      console.error('Scraper got 0 homes');
      // Still return what we have - mapImage and incentive may be fine
    }

    return {
      homes,
      incentive,
      mapImage,
      scrapedAt: new Date().toISOString(),
      source: homes.length > 0 ? 'live' : 'partial',
    };
  } catch (err) {
    console.error('Scraper failed completely:', err.message);
    return { ...FALLBACK, scrapedAt: new Date().toISOString(), source: 'fallback-error' };
  }
}

async function fetchAndParseHomes() {
  try {
    const res = await fetch(LISTINGS_URL, {
      headers: { 'User-Agent': 'AuburnFarmsKiosk/1.0' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return parseHomes(html);
  } catch (err) {
    console.error('Homes fetch failed:', err.message);
    return [];
  }
}

async function fetchAndParseIncentive() {
  try {
    const res = await fetch(LISTINGS_URL, {
      headers: { 'User-Agent': 'AuburnFarmsKiosk/1.0' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return parseIncentive(html);
  } catch (err) {
    console.error('Incentive fetch failed:', err.message);
    return FALLBACK.incentive;
  }
}

/**
 * Fetches the community map page and extracts the largest map image URL.
 * The map page typically has a big embedded image of the lot map.
 */
async function fetchMapImage() {
  try {
    const res = await fetch(MAP_URL, {
      headers: { 'User-Agent': 'AuburnFarmsKiosk/1.0' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // Look for image URLs in the page, prioritizing ones that look like a map.
    // Try the most specific patterns first.
    const candidates = [];

    // Pattern 1: og:image meta tag (usually the main page image)
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch) candidates.push({ url: ogMatch[1], priority: 1 });

    // Pattern 2: any <img> tag with "map" in the src or alt
    const mapImgRe = /<img[^>]+(?:src|data-src)=["']([^"']*(?:map|sitemap|plat)[^"']*\.(?:jpg|jpeg|png|webp))["']/gi;
    let m;
    while ((m = mapImgRe.exec(html)) !== null) {
      candidates.push({ url: m[1], priority: 2 });
    }

    // Pattern 3: any large image on the page from the wp-content uploads
    const uploadsRe = /["'](https:\/\/hollandhomesllc\.com\/wp-content\/uploads\/[^"']+\.(?:jpg|jpeg|png|webp))["']/gi;
    while ((m = uploadsRe.exec(html)) !== null) {
      candidates.push({ url: m[1], priority: 3 });
    }

    if (candidates.length === 0) return null;

    // Prefer higher priority (lower number), then de-dupe
    candidates.sort((a, b) => a.priority - b.priority);
    return candidates[0].url;
  } catch (err) {
    console.error('Map image fetch failed:', err.message);
    return null;
  }
}

/**
 * Extracts home listings from HTML.
 * Strategy: strip tags + normalize whitespace, then regex on clean text.
 * Listings look like: "Auburn Farms Lot 3 - Hattie B$499,7374 bed3.5 bath2,397 sqft."
 */
function parseHomes(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const pattern = /Auburn Farms Lot (\d+)\s*(?:[-—–]|&#8212;|&mdash;)\s*([^$]+?)\s*\$([\d,]+)\s*(\d+)\s*bed\s*([\d.]+)\s*bath\s*([\d,]+)\s*sqft/gi;
  const homes = [];
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const [, lot, plan, price, beds, baths, sqft] = m;
    homes.push({
      lot: parseInt(lot, 10),
      plan: plan.trim().replace(/\s+/g, ' '),
      price: parseInt(price.replace(/,/g, ''), 10),
      beds: parseInt(beds, 10),
      baths: parseFloat(baths),
      sqft: parseInt(sqft.replace(/,/g, ''), 10),
    });
  }
  const seen = new Set();
  return homes.filter(h => {
    if (seen.has(h.lot)) return false;
    seen.add(h.lot);
    return true;
  });
}

function parseIncentive(html) {
  const headlinePatterns = [
    /<h[2-4][^>]*>(?:&nbsp;|\s)*((?:[A-Z][^<]*?(?:Savings|Sale|Promotion|Come Home|Special|Limited|Offer)[^<]*?))<\/h[2-4]>/i,
  ];
  let headline = null;
  for (const re of headlinePatterns) {
    const m = html.match(re);
    if (m) { headline = m[1].replace(/&nbsp;|&amp;/g, ' ').trim(); break; }
  }

  const bodyMatch = html.match(/<strong>(Now through[^<]+)<\/strong>\s*([^<]{20,400})/i);
  const sub = bodyMatch ? `${bodyMatch[1]} ${bodyMatch[2]}`.trim().slice(0, 240) : null;

  if (headline || sub) {
    return {
      eyebrow: 'Limited-Time Offer',
      headline: headline || 'Ask About Current Incentives',
      sub: sub || 'Contact our team for the latest savings.',
    };
  }
  return FALLBACK.incentive;
}
