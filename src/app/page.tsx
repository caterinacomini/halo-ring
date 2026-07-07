'use client';

import dynamic from 'next/dynamic';
import SiteLoader from '@/components/SiteLoader';
import SiteNav from '@/components/SiteNav';
import ThreatScene from '@/components/ThreatScene';
import FeaturesScene from '@/components/FeaturesScene';
import SpecsScene from '@/components/SpecsScene';
import OrderScene from '@/components/OrderScene';
import ProductGallery from '@/components/ProductGallery';

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

      {/* S2 — PRODUCT GALLERY */}
      <ProductGallery />

      {/* S3+4 — SIGNAL (threat → anticipation in one scene) */}
      <ThreatScene />

      {/* S5 — FEATURES */}
      <FeaturesScene />

      {/* S6 — SPECS */}
      <SpecsScene />

      {/* S7 — ORDER */}
      <OrderScene />
    </main>
  );
}
