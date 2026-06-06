'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Home, MapPin, Image as ImageIcon, Calculator, Info, Phone, ChevronLeft, ChevronRight, Bed, Bath, Maximize, Building2, Trees, Waves, School, Send, Check, X, Sparkles, Gamepad2, Compass, LayoutGrid } from 'lucide-react';

const IMG = {
  exterior_front:     '/images/exterior_front.jpg',
  exterior_back_pool: '/images/exterior_back_pool.jpg',
  exterior_street:    '/images/exterior_street.jpg',
  entrance_sign:      '/images/entrance_sign.png',
  amenity_pool:       '/images/amenity_pool.jpg',
  amenity_pickleball: '/images/amenity_pickleball.jpg',
  amenity_playground: '/images/amenity_playground.jpg',
  amenity_bocce:      '/images/amenity_bocce.jpg',
};

const BRAND = {
  ink: '#1a1a1a',
  cream: '#f5f1ea',
  paper: '#faf7f2',
  warm: '#8b6f47',
  warmDark: '#6b5435',
  sage: '#7a8471',
  rust: '#a85a2b',
  charcoal: '#3a3a3a',
  stone: '#d4cdc0',
};

const FALLBACK_HOMES = [
  { lot: 3,  plan: 'Hattie B', price: 499737, beds: 4, baths: 3.5, sqft: 2397 },
  { lot: 4,  plan: 'Harlow A', price: 499900, beds: 4, baths: 2.5, sqft: 2178 },
  { lot: 5,  plan: 'Holly B',  price: 610083, beds: 5, baths: 3.5, sqft: 3216 },
];
// HOMES is provided by the parent server component via initialData prop.
// We use a module-level let so child components can read it without prop drilling.
let HOMES = FALLBACK_HOMES;
let INCENTIVE = { eyebrow: 'Limited-Time Offer', headline: 'Ask About Current Incentives', sub: 'Contact our team for the latest savings.' };
let MAP_IMAGE = null;

const GALLERY = [
  { src: IMG.exterior_front,     label: 'Front Elevation' },
  { src: IMG.exterior_street,    label: 'Street View' },
  { src: IMG.exterior_back_pool, label: 'Back Yard & Pool' },
  { src: IMG.entrance_sign,      label: 'Community Entrance' },
  { src: IMG.amenity_pool,       label: 'Resort Style Pool' },
  { src: IMG.amenity_pickleball, label: 'Pickleball Courts' },
  { src: IMG.amenity_playground, label: 'Playground' },
  { src: IMG.amenity_bocce,      label: 'Bocce Ball' },
];

const ATTRACT_SLIDES = [
  { img: IMG.exterior_street,    headline: 'Welcome to Auburn Farms', sub: "Auburn's newest neighborhood" },
  { img: IMG.exterior_front,     headline: 'Now Pre-Selling', sub: 'Estates & Terraces available' },
  { img: IMG.amenity_pool,       headline: 'Resort-Style Living', sub: 'Amenities for every season' },
  { img: IMG.exterior_back_pool, headline: 'Tour the Model Home', sub: 'Tuesday – Saturday  •  12pm – 5pm' },
  { img: IMG.entrance_sign,      headline: 'Spring Savings', sub: 'Up to $10,000 off through May 31' },
];

const IDLE_TIMEOUT_MS = 90000;

export default function KioskApp({ initialData }) {
  if (initialData) {
    if (initialData.homes && initialData.homes.length > 0) HOMES = initialData.homes;
    if (initialData.incentive) INCENTIVE = initialData.incentive;
    if (initialData.mapImage) MAP_IMAGE = initialData.mapImage;
  }

  const [screen, setScreen] = useState('attract');
  const idleTimer = useRef(null);

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (screen !== 'attract') {
      idleTimer.current = setTimeout(() => setScreen('attract'), IDLE_TIMEOUT_MS);
    }
  }, [screen]);

  useEffect(() => {
    resetIdle();
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [screen, resetIdle]);

  const go = (s) => { setScreen(s); resetIdle(); };

  return (
    <div
      onPointerDown={resetIdle}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: BRAND.paper, color: BRAND.ink,
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        .sans { font-family: 'Inter', system-ui, sans-serif; }
        .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: ${BRAND.cream}; }
        ::-webkit-scrollbar-thumb { background: ${BRAND.warm}; border-radius: 6px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        .fade-in { animation: fadeIn 0.5s ease-out both; }
      `}</style>

      {screen === 'attract' && <AttractLoop onEnter={() => go('home')} />}
      {screen !== 'attract' && (
        <>
          <Header onHome={() => go('home')} onBack={screen === 'home' ? null : () => go('home')} />
          <main style={{ position: 'absolute', top: 110, bottom: 0, left: 0, right: 0, overflow: 'auto' }}>
            {screen === 'home' && <HomeScreen go={go} />}
            {screen === 'homes' && <HomesScreen />}
            {screen === 'community' && <CommunityScreen />}
            {screen === 'gallery' && <GalleryScreen />}
            {screen === 'map' && <MapScreen />}
            {screen === 'calc' && <CalculatorScreen />}
            {screen === 'about' && <AboutScreen />}
            {screen === 'journey' && <JourneyScreen onExit={() => go('home')} />}
            {screen === 'contact' && <ContactScreen />}
          </main>
        </>
      )}
    </div>
  );
}

function AttractLoop({ onEnter }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % ATTRACT_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const slide = ATTRACT_SLIDES[i];

  return (
    <div onClick={onEnter} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
      {ATTRACT_SLIDES.map((s, idx) => (
        <div key={idx} style={{
          position: 'absolute', inset: 0,
          opacity: idx === i ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
          backgroundImage: `url(${s.img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          animation: idx === i ? 'slowZoom 8s ease-out forwards' : 'none',
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.78) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        alignItems: 'center', textAlign: 'center', color: 'white',
        padding: '0 60px 120px',
      }}>
        <div key={i} className="fade-in" style={{ maxWidth: 1100 }}>
          <div className="sans" style={{
            fontSize: 18, letterSpacing: '0.4em', textTransform: 'uppercase',
            opacity: 0.85, marginBottom: 24, fontWeight: 500,
          }}>
            Holland Homes  •  Auburn, Alabama
          </div>
          <h1 className="serif" style={{
            fontSize: 96, fontWeight: 500, margin: 0, lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}>
            {slide.headline}
          </h1>
          <div className="serif" style={{
            fontSize: 34, marginTop: 24, opacity: 0.95, fontStyle: 'italic',
          }}>
            {slide.sub}
          </div>
        </div>
        <div className="sans" style={{
          position: 'absolute', bottom: 50,
          fontSize: 20, letterSpacing: '0.3em', textTransform: 'uppercase',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          Touch to begin
        </div>
      </div>
      <div style={{ position: 'absolute', top: 40, right: 40, display: 'flex', gap: 10 }}>
        {ATTRACT_SLIDES.map((_, idx) => (
          <div key={idx} style={{
            width: idx === i ? 32 : 12, height: 4,
            background: idx === i ? 'white' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.4s', borderRadius: 2,
          }} />
        ))}
      </div>
    </div>
  );
}

function Header({ onHome, onBack }) {
  return (
    <header style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 110,
      background: BRAND.paper, borderBottom: `1px solid ${BRAND.stone}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 200 }}>
        {onBack && (
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '14px 24px', background: BRAND.ink, color: 'white',
            borderRadius: 999, fontSize: 18,
          }} className="sans">
            <ChevronLeft size={22} /> Back
          </button>
        )}
      </div>
      <button onClick={onHome} style={{ textAlign: 'center' }}>
        <div className="serif" style={{
          fontSize: 38, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1,
        }}>
          Auburn Farms
        </div>
        <div className="sans" style={{
          fontSize: 12, letterSpacing: '0.4em', textTransform: 'uppercase',
          color: BRAND.warm, marginTop: 4, fontWeight: 600,
        }}>
          A Holland Homes Community
        </div>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 200, justifyContent: 'flex-end' }}>
        <div className="sans" style={{ textAlign: 'right', fontSize: 14 }}>
          <div style={{ color: BRAND.charcoal, opacity: 0.7 }}>Schedule a Tour</div>
          <div style={{ fontWeight: 600, fontSize: 18, color: BRAND.ink }}>334.355.6573</div>
        </div>
      </div>
    </header>
  );
}

function HomeScreen({ go }) {
  const tiles = [
    { id: 'homes',     label: 'Available Homes',     sub: '40 homes pre-selling',  icon: Home,       img: IMG.exterior_front,     primary: true },
    { id: 'journey',   label: 'Your Journey',        sub: 'How we build your home', icon: Compass,    img: IMG.exterior_back_pool, feature: true },
    { id: 'community', label: 'The Community',       sub: 'Amenities & lifestyle', icon: Trees,      img: IMG.amenity_pool },
    { id: 'gallery',   label: 'Photo Gallery',       sub: 'Model home photos',     icon: ImageIcon,  img: IMG.exterior_street },
    { id: 'map',       label: 'Community Map',       sub: 'Lots & location',       icon: MapPin,     img: IMG.amenity_playground },
    { id: 'calc',      label: 'Mortgage Calculator', sub: 'Estimate payments',     icon: Calculator, img: IMG.amenity_pickleball },
    { id: 'about',     label: 'About Holland Homes', sub: 'Our story',             icon: Info,       img: IMG.amenity_bocce },
    { id: 'contact',   label: 'Get More Info',       sub: 'Connect with our team', icon: Send,       img: IMG.entrance_sign, accent: true },
  ];

  return (
    <div style={{ padding: '40px 40px 60px' }}>
      <div style={{
        background: BRAND.ink, color: 'white', padding: '32px 40px',
        borderRadius: 4, marginBottom: 32, display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div className="sans" style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>
            {INCENTIVE.eyebrow}
          </div>
          <div className="serif" style={{ fontSize: 32, fontWeight: 500 }}>
            {INCENTIVE.headline}
          </div>
          <div className="serif" style={{ fontSize: 20, opacity: 0.85, marginTop: 4, fontStyle: 'italic' }}>
            {INCENTIVE.sub}
          </div>
        </div>
        <Sparkles size={56} style={{ color: BRAND.warm, opacity: 0.8, flexShrink: 0 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {tiles.map((t, idx) => {
          const Icon = t.icon;
          const isBig = t.primary;
          const isFeature = t.feature;
          let overlay = `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)`;
          if (t.accent) overlay = `linear-gradient(180deg, rgba(139,111,71,0.55) 0%, rgba(107,84,53,0.92) 100%)`;
          if (isFeature) overlay = `linear-gradient(135deg, rgba(26,26,26,0.55) 0%, rgba(26,26,26,0.85) 100%)`;
          return (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              style={{
                gridColumn: isBig ? 'span 2' : 'span 1',
                gridRow: isBig ? 'span 2' : 'span 1',
                minHeight: isBig ? 380 : 180,
                background: `${overlay}, url(${t.img}) center/cover`,
                color: 'white',
                borderRadius: 4, padding: 28, textAlign: 'left',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                position: 'relative', transition: 'transform 0.2s',
                animationDelay: `${idx * 60}ms`,
                border: isFeature ? `1px solid rgba(139,111,71,0.4)` : 'none',
              }}
              className="fade-in"
              onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onPointerLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isFeature && (
                <div className="sans" style={{
                  position: 'absolute', top: 24, left: 24,
                  fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
                  color: '#d4a574', fontWeight: 600,
                  background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 999,
                }}>
                  Agent Presentation
                </div>
              )}
              <Icon size={isBig ? 44 : 32} style={{ position: 'absolute', top: 24, right: 24, opacity: 0.9 }} />
              <div className="serif" style={{ fontSize: isBig ? 48 : 28, fontWeight: 500, lineHeight: 1.1 }}>
                {t.label}
              </div>
              <div className="sans" style={{ fontSize: 14, opacity: 0.9, marginTop: 6, letterSpacing: '0.05em' }}>
                {t.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HomesScreen() {
  const [bedFilter, setBedFilter] = useState('any');
  const [priceFilter, setPriceFilter] = useState('any');
  const [sort, setSort] = useState('price-asc');

  let filtered = HOMES.filter(h => {
    if (bedFilter !== 'any' && h.beds < parseInt(bedFilter)) return false;
    if (priceFilter === 'under400' && h.price >= 400000) return false;
    if (priceFilter === '400-500' && (h.price < 400000 || h.price >= 500000)) return false;
    if (priceFilter === '500-600' && (h.price < 500000 || h.price >= 600000)) return false;
    if (priceFilter === '600plus' && h.price < 600000) return false;
    return true;
  });
  if (sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
  if (sort === 'sqft-desc') filtered.sort((a,b) => b.sqft - a.sqft);

  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <ScreenTitle title="Available Homes" sub={`${filtered.length} of ${HOMES.length} homes`} />

      <div style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
        <FilterGroup label="Bedrooms">
          {['any', '3', '4', '5'].map(v => (
            <Chip key={v} active={bedFilter === v} onClick={() => setBedFilter(v)}>
              {v === 'any' ? 'Any' : `${v}+`}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Price">
          {[
            ['any', 'Any'],
            ['under400', 'Under $400k'],
            ['400-500', '$400 – $500k'],
            ['500-600', '$500 – $600k'],
            ['600plus', '$600k+'],
          ].map(([v, l]) => (
            <Chip key={v} active={priceFilter === v} onClick={() => setPriceFilter(v)}>{l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Sort">
          {[
            ['price-asc', 'Price ↑'],
            ['price-desc', 'Price ↓'],
            ['sqft-desc', 'Largest'],
          ].map(([v, l]) => (
            <Chip key={v} active={sort === v} onClick={() => setSort(v)}>{l}</Chip>
          ))}
        </FilterGroup>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {filtered.map(h => (
          <div key={h.lot} className="fade-in" style={{
            background: 'white', border: `1px solid ${BRAND.stone}`, borderRadius: 4,
            padding: 24, display: 'flex', flexDirection: 'column',
          }}>
            <div className="sans" style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: BRAND.warm, fontWeight: 600 }}>
              Lot {h.lot}
            </div>
            <div className="serif" style={{ fontSize: 32, fontWeight: 500, marginTop: 4, lineHeight: 1.1 }}>
              The {h.plan}
            </div>
            <div className="serif" style={{ fontSize: 36, fontWeight: 600, marginTop: 16, color: BRAND.ink }}>
              ${h.price.toLocaleString()}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BRAND.stone}` }} className="sans">
              <Spec icon={Bed} value={h.beds} label="Beds" />
              <Spec icon={Bath} value={h.baths} label="Baths" />
              <Spec icon={Maximize} value={h.sqft.toLocaleString()} label="Sq Ft" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, color: BRAND.charcoal }}>
          <div className="serif" style={{ fontSize: 32, fontStyle: 'italic' }}>No homes match these filters</div>
          <div className="sans" style={{ marginTop: 12, opacity: 0.7 }}>Try adjusting your selections above.</div>
        </div>
      )}
    </div>
  );
}

function Spec({ icon: Icon, value, label }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <Icon size={20} style={{ color: BRAND.warm, marginBottom: 4 }} />
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>{label}</div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <div className="sans" style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: BRAND.charcoal, opacity: 0.7, marginBottom: 8, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="sans" style={{
      padding: '12px 20px', borderRadius: 999, fontSize: 15, fontWeight: 500,
      background: active ? BRAND.ink : 'white',
      color: active ? 'white' : BRAND.ink,
      border: `1px solid ${active ? BRAND.ink : BRAND.stone}`,
      transition: 'all 0.15s',
    }}>{children}</button>
  );
}

function CommunityScreen() {
  const amenities = [
    { img: IMG.amenity_pool,       name: 'Resort Style Pool' },
    { img: IMG.amenity_pickleball, name: 'Pickleball Court' },
    { img: IMG.amenity_playground, name: 'Playground' },
    { img: IMG.amenity_bocce,      name: 'Bocce Ball' },
  ];

  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <ScreenTitle title="The Community" sub="A place to settle. A legacy to build." />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, marginBottom: 40 }}>
        <div style={{
          backgroundImage: `url(${IMG.exterior_street})`, backgroundSize: 'cover',
          backgroundPosition: 'center', minHeight: 360, borderRadius: 4,
        }} />
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.6, color: BRAND.charcoal }}>
          <p style={{ marginTop: 0 }}>
            Auburn Farms is a beautifully designed neighborhood where families can slow down, settle in, and truly feel at home.
          </p>
          <p>
            With large single-family homes in <em>The Estates</em> and thoughtfully designed townhomes in <em>The Terraces</em>, you'll find quality-built homes for real life — where families grow, neighbors connect, and memories are made.
          </p>
        </div>
      </div>

      <div style={{ background: BRAND.cream, padding: 40, borderRadius: 4, marginBottom: 32 }}>
        <div className="sans" style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: BRAND.warm, fontWeight: 600, marginBottom: 8 }}>
          Future Community Amenities
        </div>
        <h2 className="serif" style={{ fontSize: 40, margin: '0 0 28px', fontWeight: 500 }}>
          Relax, recreate, connect.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {amenities.map((a) => (
            <div key={a.name} style={{
              background: 'white', borderRadius: 4, overflow: 'hidden',
              border: `1px solid ${BRAND.stone}`,
            }}>
              <div style={{
                aspectRatio: '1/1',
                backgroundImage: `url(${a.img})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              <div style={{ padding: '16px 20px', textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{a.name}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="serif" style={{ marginTop: 24, fontSize: 17, fontStyle: 'italic', color: BRAND.charcoal, textAlign: 'center' }}>
          Plus: Pavilion · Firepit · Dog Park
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <InfoCard icon={School} title="School Zones">
          <div className="sans" style={{ fontSize: 17, lineHeight: 1.7 }}>
            <div><strong>Woodland Pines Elementary</strong> — Grades K–2</div>
            <div><strong>Yarbrough Elementary</strong> — Grades 3–5</div>
            <div style={{ marginTop: 10, color: BRAND.warm, fontStyle: 'italic' }} className="serif">Next door to brand-new Plains High School</div>
          </div>
        </InfoCard>
        <InfoCard icon={Building2} title="HOA Information">
          <div className="sans" style={{ fontSize: 16, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 600 }}>The Terraces</div>
            <div>$1,380 annual · $115 monthly · $500 initiation</div>
            <div style={{ fontWeight: 600, marginTop: 10 }}>The Estates</div>
            <div>$495 annual · $500 initiation</div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div style={{ background: 'white', padding: 28, borderRadius: 4, border: `1px solid ${BRAND.stone}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Icon size={28} style={{ color: BRAND.warm }} />
        <div className="serif" style={{ fontSize: 28, fontWeight: 500 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function GalleryScreen() {
  const [active, setActive] = useState(null);
  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <ScreenTitle title="Photo Gallery" sub="The Auburn Farms model home & community" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {GALLERY.map((g, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            aspectRatio: '4/3', backgroundImage: `url(${g.src})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            borderRadius: 4, overflow: 'hidden', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7))',
              display: 'flex', alignItems: 'flex-end', padding: 16,
            }}>
              <div className="serif" style={{ color: 'white', fontSize: 22, fontWeight: 500 }}>{g.label}</div>
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div onClick={() => setActive(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src={GALLERY[active].src} style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
          <button onClick={() => setActive(null)} style={{
            position: 'absolute', top: 30, right: 30,
            background: 'white', borderRadius: 999, padding: 16,
          }}><X size={28} /></button>
          <button onClick={(e) => { e.stopPropagation(); setActive((active - 1 + GALLERY.length) % GALLERY.length); }}
            style={{ position: 'absolute', left: 30, top: '50%', background: 'white', borderRadius: 999, padding: 16 }}>
            <ChevronLeft size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setActive((active + 1) % GALLERY.length); }}
            style={{ position: 'absolute', right: 30, top: '50%', background: 'white', borderRadius: 999, padding: 16, transform: 'scaleX(-1)' }}>
            <ChevronLeft size={28} />
          </button>
        </div>
      )}
    </div>
  );
}

function MapScreen() {
  const hasMap = !!MAP_IMAGE;
  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <ScreenTitle title="Community Map" sub="1244 Sarah Lane, Auburn, Alabama 36830" />
      <div style={{
        borderRadius: 4, overflow: 'hidden', border: `1px solid ${BRAND.stone}`,
        minHeight: 600, background: BRAND.cream, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {hasMap ? (
          <img
            src={MAP_IMAGE}
            alt="Auburn Farms Community Map"
            style={{
              maxWidth: '100%', maxHeight: 700, display: 'block',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div style={{
            backgroundImage: `url(${IMG.entrance_sign})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            position: 'absolute', inset: 0,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.4))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center', color: 'white', background: 'rgba(0,0,0,0.4)', padding: 32, borderRadius: 4, backdropFilter: 'blur(8px)' }}>
                <MapPin size={48} style={{ marginBottom: 12 }} />
                <div className="serif" style={{ fontSize: 36, fontWeight: 500 }}>Auburn Farms</div>
                <div className="serif" style={{ fontSize: 22, marginTop: 8, fontStyle: 'italic' }}>
                  1244 Sarah Lane · Auburn, AL 36830
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <InfoCard icon={MapPin} title="Address">
          <div className="sans" style={{ fontSize: 18, lineHeight: 1.6 }}>
            1244 Sarah Lane<br />Auburn, Alabama 36830
          </div>
        </InfoCard>
        <InfoCard icon={Phone} title="Model Home Hours">
          <div className="sans" style={{ fontSize: 17, lineHeight: 1.6 }}>
            Tuesday – Saturday<br />12:00 pm – 5:00 pm<br />
            <strong style={{ color: BRAND.warm }}>Call: 334.355.6573</strong>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

function CalculatorScreen() {
  const [price, setPrice] = useState(499000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const loan = price * (1 - down / 100);
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <ScreenTitle title="Mortgage Calculator" sub="Estimate your monthly payment" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <Slider label="Home Price" value={price} setValue={setPrice} min={300000} max={700000} step={1000} format={(v) => `$${v.toLocaleString()}`} />
          <Slider label="Down Payment" value={down} setValue={setDown} min={0} max={50} step={1} format={(v) => `${v}%  ·  $${Math.round(price*v/100).toLocaleString()}`} />
          <Slider label="Interest Rate" value={rate} setValue={setRate} min={3} max={10} step={0.125} format={(v) => `${v.toFixed(3)}%`} />
          <Slider label="Loan Term" value={years} setValue={setYears} min={10} max={30} step={5} format={(v) => `${v} years`} />
        </div>
        <div style={{
          background: BRAND.ink, color: 'white', padding: 48,
          borderRadius: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div className="sans" style={{ fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7, fontWeight: 600 }}>
            Estimated Monthly Payment
          </div>
          <div className="serif" style={{ fontSize: 84, fontWeight: 500, marginTop: 12, lineHeight: 1 }}>
            ${Math.round(monthly).toLocaleString()}
          </div>
          <div className="sans" style={{ fontSize: 14, opacity: 0.7, marginTop: 8 }}>per month (principal & interest)</div>
          <div style={{ borderTop: `1px solid rgba(255,255,255,0.2)`, marginTop: 32, paddingTop: 24, fontSize: 16 }} className="sans">
            <Row label="Loan Amount" value={`$${Math.round(loan).toLocaleString()}`} />
            <Row label="Down Payment" value={`$${Math.round(price*down/100).toLocaleString()}`} />
            <Row label="Total Interest" value={`$${Math.round(monthly * n - loan).toLocaleString()}`} />
          </div>
          <div className="sans" style={{ fontSize: 11, opacity: 0.5, marginTop: 24, fontStyle: 'italic' }}>
            Estimate only. Does not include taxes, insurance, or HOA. Contact a preferred lender for an accurate quote.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Slider({ label, value, setValue, min, max, step, format }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div className="sans" style={{ fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: BRAND.charcoal }}>
          {label}
        </div>
        <div className="serif" style={{ fontSize: 24, fontWeight: 600 }}>{format(value)}</div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: BRAND.warm, height: 8 }}
      />
    </div>
  );
}

// ============================================================
// YOUR JOURNEY - Agent-led sales presentation
// ============================================================
// 12-slide deck. Pitch (4) + Financing (1) + Journey steps (6) + Close (1).
// Agent taps right/left edges to advance, or uses the thumbnail strip.
// NOTE: Placeholder stats marked with [EDIT] -- swap with real Holland Homes numbers.
// ============================================================

const JOURNEY_SLIDES = [
  // ---------- PITCH SECTION (cinematic) ----------
  {
    type: 'cinematic',
    section: 'Welcome',
    img: IMG.exterior_front,
    eyebrow: 'Holland Homes  •  Auburn, Alabama',
    headline: 'Built for the way you live.',
    body: "For over [EDIT: 20] years, Holland Homes has built quality homes for Alabama families. We're not a national builder — we're your neighbors, and we build like it.",
  },
  {
    type: 'cinematic',
    section: 'Why Auburn Farms',
    img: IMG.exterior_street,
    eyebrow: 'The Right Place',
    headline: "Auburn's newest neighborhood.",
    body: "Next door to brand-new Plains High School and top-rated elementary schools. Minutes from downtown Auburn. A community designed for real life, with amenities for every age.",
  },
  {
    type: 'cinematic',
    section: 'Quality',
    img: IMG.exterior_back_pool,
    eyebrow: 'Built to Last',
    headline: 'Craftsmanship in every detail.',
    body: "From foundation to finish, every Holland Home is built with care, by craftsmen who've been with us for years. Quality materials. Thoughtful design. No shortcuts.",
  },
  {
    type: 'cinematic',
    section: 'Floor Plans',
    img: IMG.exterior_front,
    eyebrow: 'Designed Around You',
    headline: 'Floor plans that fit real life.',
    body: "From [EDIT: 1,771] to [EDIT: 3,612] square feet — single-family Estates and low-maintenance Terraces. First-floor primary suites, flexible bonus rooms, and the option to customize finishes to make it yours.",
  },
  {
    type: 'cinematic',
    section: 'Financing',
    img: IMG.entrance_sign,
    eyebrow: 'Make It Yours',
    headline: 'Financing made simple.',
    body: "Work with our preferred lenders for the smoothest path to closing. Ask about current incentives — including Spring Savings up to $10,000 off Estates through May 31, 2026.",
  },

  // ---------- JOURNEY SECTION (split layout, numbered) ----------
  {
    type: 'journey',
    section: 'Your Journey',
    img: IMG.amenity_pool,
    step: '01',
    title: 'Your Wish List',
    body: "We start with a conversation. What does your ideal home look like? How do you live? What matters most? We listen first — then we help you find or design the home that fits.",
  },
  {
    type: 'journey',
    section: 'Your Journey',
    img: IMG.exterior_front,
    step: '02',
    title: 'Showings & Selections',
    body: "Tour available homes and floor plans. Visit our Design Center to choose finishes, fixtures, and the details that make your home yours. We'll guide you through every choice.",
  },
  {
    type: 'journey',
    section: 'Your Journey',
    img: IMG.exterior_street,
    step: '03',
    title: 'Contract & Design',
    body: "Once you've chosen your home, we sign the contract and — for pre-sales — hold your Design Meeting to finalize every selection. Clear pricing. No surprises.",
  },
  {
    type: 'journey',
    section: 'Your Journey',
    img: IMG.exterior_back_pool,
    step: '04',
    title: 'Build Time',
    body: "Construction begins. You'll receive weekly updates with photos and progress notes, so you always know exactly where things stand. Our team is reachable the entire build.",
  },
  {
    type: 'journey',
    section: 'Your Journey',
    img: IMG.amenity_playground,
    step: '05',
    title: 'Blue Tape & Orientation',
    body: "Before closing, we walk the home with you and mark anything that needs attention with blue tape — we fix it before you move in. Then a full orientation: every system, every appliance, every detail.",
  },
  {
    type: 'journey',
    section: 'Your Journey',
    img: IMG.amenity_pickleball,
    step: '06',
    title: 'Closing & Beyond',
    body: "Closing day, keys in hand. But our relationship doesn't end there — your home is backed by our post-closing warranty, and our team is here whenever you need us.",
  },

  // ---------- CLOSING CTA ----------
  {
    type: 'closing',
    section: "Let's Begin",
    img: IMG.exterior_back_pool,
    headline: "Ready to start your journey?",
    sub: "Let's talk about your wish list.",
  },
];

function JourneyScreen({ onExit }) {
  const [i, setI] = useState(0);
  const [showStrip, setShowStrip] = useState(false);
  const total = JOURNEY_SLIDES.length;
  const slide = JOURNEY_SLIDES[i];

  const next = () => setI((p) => Math.min(p + 1, total - 1));
  const prev = () => setI((p) => Math.max(p - 1, 0));
  const jump = (n) => { setI(n); setShowStrip(false); };

  // Keyboard support (so the agent can use a presenter remote/keyboard)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i]);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BRAND.ink, color: 'white',
      overflow: 'hidden',
    }}>
      {/* Slide content */}
      <div key={i} className="fade-in" style={{ position: 'absolute', inset: 0 }}>
        {slide.type === 'cinematic' && <CinematicSlide slide={slide} />}
        {slide.type === 'journey' && <JourneySlide slide={slide} />}
        {slide.type === 'closing' && <ClosingSlide slide={slide} onExit={onExit} />}
      </div>

      {/* Left tap zone (prev) */}
      {i > 0 && (
        <button onClick={prev} style={{
          position: 'absolute', left: 0, top: 0, bottom: showStrip ? 160 : 80,
          width: 120, background: 'transparent', zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 20,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: 16, opacity: 0.85,
          }}>
            <ChevronLeft size={28} color="white" />
          </div>
        </button>
      )}

      {/* Right tap zone (next) */}
      {i < total - 1 && (
        <button onClick={next} style={{
          position: 'absolute', right: 0, top: 0, bottom: showStrip ? 160 : 80,
          width: 120, background: 'transparent', zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 20,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: 16, opacity: 0.85,
          }}>
            <ChevronRight size={28} color="white" />
          </div>
        </button>
      )}

      {/* Bottom bar: progress + controls */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))',
        padding: '40px 40px 24px', zIndex: 10,
      }}>
        {/* Thumbnail strip (toggleable) */}
        {showStrip && (
          <div className="fade-in" style={{
            display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto',
            paddingBottom: 8,
          }}>
            {JOURNEY_SLIDES.map((s, idx) => (
              <button key={idx} onClick={() => jump(idx)} style={{
                flexShrink: 0, width: 120, height: 80, borderRadius: 4,
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${s.img})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: idx === i ? `2px solid ${BRAND.warm}` : '2px solid transparent',
                color: 'white', position: 'relative',
                opacity: idx === i ? 1 : 0.6,
              }}>
                <div className="sans" style={{
                  position: 'absolute', bottom: 4, left: 6,
                  fontSize: 10, fontWeight: 600,
                }}>
                  {idx + 1}. {s.step || s.section}
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {JOURNEY_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => jump(idx)} style={{
                width: idx === i ? 32 : 8, height: 8, borderRadius: 999,
                background: idx === i ? BRAND.warm : 'rgba(255,255,255,0.35)',
                transition: 'all 0.3s', padding: 0,
              }} />
            ))}
            <div className="sans" style={{
              marginLeft: 16, fontSize: 13, letterSpacing: '0.2em', opacity: 0.7, fontWeight: 600,
            }}>
              {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>
          </div>

          {/* Right-side controls */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowStrip(!showStrip)} className="sans" style={{
              padding: '12px 20px', borderRadius: 999,
              background: showStrip ? BRAND.warm : 'rgba(255,255,255,0.15)',
              color: 'white', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 8,
              backdropFilter: 'blur(8px)',
            }}>
              <LayoutGrid size={16} /> {showStrip ? 'Hide' : 'All Slides'}
            </button>
            <button onClick={onExit} className="sans" style={{
              padding: '12px 20px', borderRadius: 999,
              background: 'rgba(255,255,255,0.15)', color: 'white',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
            }}>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CinematicSlide({ slide }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${slide.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        animation: 'slowZoom 12s ease-out forwards',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.88) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '0 100px 200px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        color: 'white',
      }}>
        <div className="sans" style={{
          fontSize: 14, letterSpacing: '0.4em', textTransform: 'uppercase',
          color: '#d4a574', marginBottom: 24, fontWeight: 600,
        }}>
          {slide.eyebrow}
        </div>
        <h1 className="serif" style={{
          fontSize: 88, fontWeight: 500, margin: 0, lineHeight: 1.05,
          letterSpacing: '-0.02em', maxWidth: 1400,
        }}>
          {slide.headline}
        </h1>
        <p className="serif" style={{
          fontSize: 28, fontStyle: 'italic', maxWidth: 1100,
          marginTop: 32, lineHeight: 1.4, opacity: 0.95, fontWeight: 300,
        }}>
          {slide.body}
        </p>
      </div>
    </div>
  );
}

function JourneySlide({ slide }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {/* Photo half */}
      <div style={{
        flex: 1.1, position: 'relative',
        backgroundImage: `url(${slide.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.1), rgba(26,26,26,0.4))',
        }} />
      </div>
      {/* Content half */}
      <div style={{
        flex: 1, background: BRAND.ink, color: 'white',
        padding: '120px 80px 120px 100px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Big step number watermark */}
        <div className="serif" style={{
          position: 'absolute', top: 80, right: 80,
          fontSize: 240, fontWeight: 300, color: BRAND.warm,
          opacity: 0.15, lineHeight: 0.8, letterSpacing: '-0.05em',
        }}>
          {slide.step}
        </div>

        <div className="sans" style={{
          fontSize: 13, letterSpacing: '0.4em', textTransform: 'uppercase',
          color: '#d4a574', fontWeight: 600,
        }}>
          {slide.section}  ·  Step {slide.step}
        </div>
        <h1 className="serif" style={{
          fontSize: 72, fontWeight: 500, margin: '20px 0 32px',
          lineHeight: 1.05, letterSpacing: '-0.01em',
          position: 'relative', zIndex: 2,
        }}>
          {slide.title}
        </h1>
        <div style={{ width: 80, height: 3, background: BRAND.warm, marginBottom: 32 }} />
        <p className="serif" style={{
          fontSize: 26, lineHeight: 1.5, opacity: 0.9, fontWeight: 300,
          position: 'relative', zIndex: 2,
        }}>
          {slide.body}
        </p>
      </div>
    </div>
  );
}

function ClosingSlide({ slide, onExit }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${slide.img})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        animation: 'slowZoom 12s ease-out forwards',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(26,26,26,0.4) 0%, rgba(26,26,26,0.85) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', color: 'white', padding: '0 60px 120px',
      }}>
        <div className="sans" style={{
          fontSize: 14, letterSpacing: '0.4em', textTransform: 'uppercase',
          color: '#d4a574', marginBottom: 32, fontWeight: 600,
        }}>
          {slide.section}
        </div>
        <h1 className="serif" style={{
          fontSize: 104, fontWeight: 500, margin: 0, lineHeight: 1.05,
          letterSpacing: '-0.02em', maxWidth: 1400,
        }}>
          {slide.headline}
        </h1>
        <p className="serif" style={{
          fontSize: 36, fontStyle: 'italic', marginTop: 24, opacity: 0.95, fontWeight: 300,
        }}>
          {slide.sub}
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 56 }}>
          <button onClick={onExit} className="sans" style={{
            padding: '20px 40px', background: BRAND.warm, color: 'white',
            borderRadius: 4, fontSize: 18, fontWeight: 600,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Send size={20} /> Get More Info
          </button>
          <button onClick={onExit} className="sans" style={{
            padding: '20px 40px', background: 'rgba(255,255,255,0.15)',
            color: 'white', borderRadius: 4, fontSize: 18, fontWeight: 600,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(8px)',
          }}>
            Back to Home
          </button>
        </div>
        <div className="sans" style={{
          marginTop: 56, fontSize: 16, letterSpacing: '0.2em', opacity: 0.7,
        }}>
          Or call <strong style={{ color: '#d4a574' }}>334.355.6573</strong>  ·  Model Hours Tue–Sat 12–5pm
        </div>
      </div>
    </div>
  );
}

function AboutScreen() {
  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <ScreenTitle title="About Holland Homes" sub="Quality built. Family-focused." />
      <div className="serif" style={{ fontSize: 26, lineHeight: 1.6, color: BRAND.charcoal, maxWidth: 1000 }}>
        <p style={{ marginTop: 0 }}>
          At Holland Homes, our customers' satisfaction is the core of why we do what we do. We believe in developing a quality product that also functions as a personalized home for you and your family.
        </p>
      </div>

      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {[
          { quote: "They did a wonderful job with our new home. Very pleased with the results. They take pride in their work and make sure you understand every part of the process.", name: 'Treca A.' },
          { quote: "Very professional, understanding, listened to our ideas and always prompt in response time! The Holland Homes team made our experience very enjoyable!", name: 'Becky Loveless' },
          { quote: "Excellent work, very professional, completed work in time with what they projected — we highly recommend Holland Homes!", name: 'Tabitha Geiger' },
        ].map((t, i) => (
          <div key={i} style={{ background: BRAND.cream, padding: 32, borderRadius: 4 }}>
            <div className="serif" style={{ fontSize: 56, color: BRAND.warm, lineHeight: 0.5, marginBottom: 16 }}>"</div>
            <div className="serif" style={{ fontSize: 19, lineHeight: 1.5, fontStyle: 'italic', color: BRAND.charcoal }}>
              {t.quote}
            </div>
            <div className="sans" style={{ marginTop: 16, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, color: BRAND.warm }}>
              — {t.name}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, padding: 32, background: BRAND.ink, color: 'white', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="serif" style={{ fontSize: 32, fontWeight: 500 }}>Building across Alabama</div>
          <div className="sans" style={{ opacity: 0.7, marginTop: 8, fontSize: 16 }}>
            Auburn · Opelika · Birmingham · Valley · Pike Road · Coastal
          </div>
        </div>
        <div className="sans" style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Call us today</div>
          <div className="serif" style={{ fontSize: 36, fontWeight: 600 }}>334.332.7157</div>
        </div>
      </div>
    </div>
  );
}

function ContactScreen() {
  const [data, setData] = useState({ name: '', email: '', phone: '', interest: '' });
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!data.name || !data.email) return;
    console.log('LEAD CAPTURED:', data);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setData({ name: '', email: '', phone: '', interest: '' }); }, 5000);
  };

  if (submitted) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: 999, background: BRAND.warm, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={64} color="white" strokeWidth={3} />
        </div>
        <h2 className="serif" style={{ fontSize: 64, fontWeight: 500, marginTop: 32 }}>Thank you!</h2>
        <p className="serif" style={{ fontSize: 26, color: BRAND.charcoal, fontStyle: 'italic', marginTop: 8 }}>
          Someone from our team will reach out shortly.
        </p>
      </div>
    );
  }

  const interests = ['Available Homes', 'Floor Plans', 'Schedule a Tour', 'General Info'];

  return (
    <div style={{ padding: '32px 40px 60px' }}>
      <ScreenTitle title="Get More Info" sub="Connect with our team — we'll be in touch" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 1200 }}>
        <div>
          <Field label="Full Name *" value={data.name} onChange={(v) => setData({...data, name: v})} placeholder="Jane Smith" />
          <Field label="Email *" value={data.email} onChange={(v) => setData({...data, email: v})} placeholder="jane@example.com" type="email" />
          <Field label="Phone" value={data.phone} onChange={(v) => setData({...data, phone: v})} placeholder="(334) 555-0123" type="tel" />

          <div className="sans" style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: BRAND.charcoal, fontWeight: 600, marginBottom: 10, marginTop: 20 }}>
            I'm interested in
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {interests.map(i => (
              <Chip key={i} active={data.interest === i} onClick={() => setData({...data, interest: i})}>{i}</Chip>
            ))}
          </div>

          <button onClick={submit} disabled={!data.name || !data.email} style={{
            marginTop: 32, width: '100%', padding: '24px', borderRadius: 4,
            background: !data.name || !data.email ? BRAND.stone : BRAND.ink, color: 'white',
            fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            transition: 'background 0.2s',
          }} className="sans">
            <Send size={22} /> Submit
          </button>
        </div>

        <div style={{ background: BRAND.cream, padding: 40, borderRadius: 4 }}>
          <div className="serif" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1.2 }}>
            Prefer to talk?
          </div>
          <div className="serif" style={{ fontSize: 20, color: BRAND.charcoal, fontStyle: 'italic', marginTop: 8 }}>
            We'd love to hear from you.
          </div>
          <div style={{ marginTop: 28, paddingTop: 28, borderTop: `1px solid ${BRAND.stone}` }}>
            <div className="sans" style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: BRAND.warm, fontWeight: 600 }}>
              Call Us
            </div>
            <div className="serif" style={{ fontSize: 44, fontWeight: 500, marginTop: 4 }}>334.355.6573</div>
          </div>
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${BRAND.stone}` }}>
            <div className="sans" style={{ fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: BRAND.warm, fontWeight: 600 }}>
              Model Home
            </div>
            <div className="serif" style={{ fontSize: 22, marginTop: 4, lineHeight: 1.4 }}>
              1244 Sarah Lane<br />Auburn, Alabama 36830
            </div>
            <div className="sans" style={{ fontSize: 15, marginTop: 8, color: BRAND.charcoal }}>
              Tuesday – Saturday  ·  12pm – 5pm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="sans" style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: BRAND.charcoal, fontWeight: 600, marginBottom: 8 }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="sans"
        style={{
          width: '100%', padding: '18px 20px', fontSize: 20,
          background: 'white', border: `1px solid ${BRAND.stone}`,
          borderRadius: 4, outline: 'none',
          fontFamily: 'Inter, sans-serif',
        }}
        onFocus={(e) => e.target.style.borderColor = BRAND.warm}
        onBlur={(e) => e.target.style.borderColor = BRAND.stone}
      />
    </div>
  );
}

function ScreenTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 className="serif" style={{ fontSize: 56, fontWeight: 500, margin: 0, letterSpacing: '-0.01em', lineHeight: 1 }}>
        {title}
      </h1>
      {sub && (
        <div className="serif" style={{ fontSize: 22, fontStyle: 'italic', color: BRAND.charcoal, marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
