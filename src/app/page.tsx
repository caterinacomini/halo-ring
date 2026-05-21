'use client';

import dynamic from 'next/dynamic';

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

export default function Home() {
  return (
    <main>
      <section style={{ height: '200vh' }}>
        <HeroScene />
      </section>
    </main>
  );
}
