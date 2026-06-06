// app/page.js
// Server component: runs at build time + once per day after that.
// Calls the scraper module directly - no HTTP roundtrip needed, so it works
// reliably during Vercel's build.

import KioskApp from './KioskApp';
import { scrapeAll } from './lib/scraper';

export const revalidate = 86400;

export default async function Page() {
  const data = await scrapeAll();
  return <KioskApp initialData={data} />;
}
