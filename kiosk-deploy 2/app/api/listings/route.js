// app/api/listings/route.js
// Thin wrapper that exposes the scraper as a JSON endpoint.
// Useful for verifying the scrape worked: visit /api/listings to see what's coming back.

import { NextResponse } from 'next/server';
import { scrapeAll } from '../../lib/scraper';

export const revalidate = 86400;
export const dynamic = 'force-static';

export async function GET() {
  const data = await scrapeAll();
  return NextResponse.json(data);
}
