import type { Metadata } from 'next';

import ShortenForm from '@/components/forms/ShortenForm';
import Hero from '@/components/layouts/Hero';
import PrivacyNote from '@/components/layouts/PrivacyNote';
import { metadataConfig } from '@/configs/seo/metadata.config';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * Landing page — the hero, the shorten form and the privacy promise.
 **/
export default function HomePage() {
  return (
    <section className='flex flex-col gap-10 py-16 sm:py-24'>
      <Hero subtitle={metadataConfig.subtitle} />
      <ShortenForm />
      <PrivacyNote />
    </section>
  );
}
