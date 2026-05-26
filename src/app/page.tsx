'use client';

import dynamic from 'next/dynamic';
import HeroOverlay from '@/components/HeroOverlay';
import ThreatScene from '@/components/ThreatScene';
import MuseumScene from '@/components/MuseumScene';
import FeaturesScene from '@/components/FeaturesScene';
import SpecsScene from '@/components/SpecsScene';
import OrderScene from '@/components/OrderScene';

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

export default function Home() {
  return (
    <main>
      {/* S1 — HERO */}
      <section id="s1" style={{ height: '100vh', position: 'relative' }}>
        <HeroScene />
        <HeroOverlay />
      </section>

      {/* S2+3 — SIGNAL (threat → anticipation in one scene) */}
      <ThreatScene />

      {/* S4 — MUSEUM */}
      <MuseumScene />

      {/* S5 — FEATURES */}
      <FeaturesScene />

      {/* S6 — SPECS */}
      <SpecsScene />

      {/* S7 — ORDER */}
      <OrderScene />
    </main>
  );
}
