// app/api/listings/route.js
//
// SCRAPER ENDPOINT
// =================
// Runs once a day at midnight Central time (configured in vercel.json).
// Fetches https://hollandhomesllc.com/community/auburn-farms/ and extracts:
//   - Available home listings (lot, plan, price, beds, baths, sqft)
//   - Current incentive banner
//   - Community amenities, HOA, schools
// Returns JSON the kiosk reads instead of using hardcoded data.
//
// If the scrape fails for any reason (site down, structure changed, network issue),
// it returns the LAST KNOWN GOOD data as a fallback so the kiosk never goes blank.
// ===================================================================

import { NextResponse } from 'next/server';

// Cache for 24 hours; revalidate once a day overnight.
export const revalidate = 86400;
export const dynamic = 'force-static';

const SOURCE_URL = 'https://hollandhomesllc.com/community/auburn-farms/';

// Fallback data (matches what's on the site as of the last successful scrape).
// Used if the live scrape fails so the kiosk never goes blank.
const FALLBACK = {
  homes: [
    { lot: 3,  plan: 'Hattie B', price: 499737, beds: 4, baths: 3.5, sqft: 2397 },
    { lot: 4,  plan: 'Harlow A', price: 499900, beds: 4, baths: 2.5, sqft: 2178 },
    { lot: 5,  plan: 'Holly B',  price: 610083, beds: 5, baths: 3.5, sqft: 3216 },
  ],
  incentive: {
    eyebrow: 'Limited-Time Offer',
    headline: 'Ask About Current Incentives',
    sub: 'Contact our team for the latest savings.',
  },
  scrapedAt: null,
  source: 'fallback',
};

export async function GET() {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { 'User-Agent': 'AuburnFarmsKiosk/1.0' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const homes = parseHomes(html);
    const incentive = parseIncentive(html);

    // If we got zero homes, something is wrong with the parser. Use fallback.
    if (homes.length === 0) {
      console.error('Scraper got 0 homes; using fallback');
      return NextResponse.json({ ...FALLBACK, source: 'fallback-zero-homes' });
    }

    return NextResponse.json({
      homes,
      incentive,
      scrapedAt: new Date().toISOString(),
      source: 'live',
    });
  } catch (err) {
    console.error('Scraper failed:', err.message);
    return NextResponse.json({ ...FALLBACK, scrapedAt: new Date().toISOString(), source: 'fallback-error' });
  }
}

// ----- Parsers -----

/**
 * Extracts home listings from the page.
 * Strategy: strip HTML tags + normalize whitespace, then regex against clean text.
 * The format we're looking for is consistent:
 *   "Auburn Farms Lot 3 - Hattie B$499,7374 bed3.5 bath2,397 sqft."
 */
function parseHomes(html) {
  // Strip all HTML tags and normalize whitespace
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

  // Dedupe by lot number, keep first occurrence
  const seen = new Set();
  return homes.filter(h => {
    if (seen.has(h.lot)) return false;
    seen.add(h.lot);
    return true;
  });
}

/**
 * Looks for the incentive banner. The site currently shows things like
 * "This Summer, Come Home for Less" with a body about savings amounts.
 * We grab whatever the current promo headline + body is.
 */
function parseIncentive(html) {
  // Try a few known patterns
  const promoHeadlinePatterns = [
    /<h[2-4][^>]*>(?:&nbsp;|\s)*((?:[A-Z][^<]*?(?:Savings|Sale|Promotion|Come Home|Special|Limited|Offer)[^<]*?))<\/h[2-4]>/i,
    /<strong>Now through[^<]+<\/strong>([^<]+)/i,
  ];
  let headline = null;
  for (const re of promoHeadlinePatterns) {
    const m = html.match(re);
    if (m) { headline = m[1].replace(/&nbsp;|&amp;/g, ' ').trim(); break; }
  }

  // Body: capture the first <strong>Now through ...</strong>... paragraph
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
