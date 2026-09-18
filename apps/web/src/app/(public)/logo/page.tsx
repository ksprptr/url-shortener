import type { Metadata } from 'next';

import { metadataConfig } from '@/configs/seo/metadata.config';

import LogoCard from './components/LogoCard';
import LogoHero from './components/LogoHero';
import LogoNote from './components/LogoNote';

const title = 'Logo';
const description = `Download the ${metadataConfig.title} logo as a vector SVG.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/logo' },
  openGraph: { title: `${metadataConfig.title} · ${title}`, description, url: '/logo' },
};

/**
 * Logo page — the mark at a few sizes, and the SVG to download.
 **/
export default function LogoPage() {
  return (
    <section className='mx-auto flex max-w-lg flex-col gap-8 py-16 sm:py-24'>
      <LogoHero description={description} />
      <LogoCard />
      <LogoNote />
    </section>
  );
}
