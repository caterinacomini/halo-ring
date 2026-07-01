'use client';

import dynamic from 'next/dynamic';
import SiteLoader from '@/components/SiteLoader';
import SiteNav from '@/components/SiteNav';
import ThreatScene from '@/components/ThreatScene';
import MuseumScene from '@/components/MuseumScene';
import FeaturesScene from '@/components/FeaturesScene';
import SpecsScene from '@/components/SpecsScene';
import OrderScene from '@/components/OrderScene';

const ScrollRingExperience = dynamic(
  () => import('@/components/ScrollRingExperience'),
  { ssr: false }
);

export default function Home() {
  return (
    <main id="top">
      {/* Intro loader — min ~1.2s with entrance animation */}
      <SiteLoader />

      {/* Persistent nav — CTA always visible */}
      <SiteNav />

      {/* S1 — HERO + scroll-scrubbed ring chapters */}
      <ScrollRingExperience />

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
