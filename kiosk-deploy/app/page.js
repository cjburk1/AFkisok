// app/page.js
// Server component: pre-fetches the latest scraped data at build/refresh time,
// passes it as a prop to the client-side kiosk component.

import KioskApp from './KioskApp';

// Revalidate the page once per day (matches scraper cadence)
export const revalidate = 86400;

async function getData() {
  // In production, this calls our own /api/listings endpoint.
  // We use a relative URL via absolute construction so it works on Vercel.
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/listings`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error('Failed to fetch listings');
    return await res.json();
  } catch (err) {
    console.error('Page fetch failed:', err.message);
    // Return null; KioskApp will fall back to its built-in defaults
    return null;
  }
}

export default async function Page() {
  const data = await getData();
  return <KioskApp initialData={data} />;
}
