'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import Icon, { type IconName } from '@/components/common/Icon';
import PikachuEasterEgg from '@/components/layouts/PikachuEasterEgg';

interface Point {
  icon: IconName;
  title: string;
  body: string;
  /** Turns this card's icon into the button that summons the easter egg. */
  summons?: boolean;
}

const POINTS: Point[] = [
  {
    icon: 'ShieldCheck',
    title: 'Nothing about you is stored',
    body: 'No accounts, no cookies to follow you, no address or browser recorded when a link is opened.',
  },
  {
    icon: 'Hourglass',
    title: 'Links expire on your terms',
    body: 'Pick an hour, a week or never. Once the time is up the link stops resolving for everyone.',
  },
  {
    icon: 'Zap',
    title: 'Straight to the target',
    body: 'A short link resolves server-side and hands the browser the destination — no interstitial, no ads.',
    summons: true,
  },
];

/** Lifts the summoning cell above its siblings so the mascot, rising into the card above on a phone, is not hidden by that card's own z-10. */
const SUMMONING_CELL_CLASS = 'relative z-20';

const BADGE_CLASS =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400';

/**
 * The three-point promise under the form, and the way to the logo assets.
 **/
export default function PrivacyNote() {
  const [summons, setSummons] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.22 }}
      className='flex flex-col gap-4'>
      <ul className='grid gap-4 sm:grid-cols-3'>
        {POINTS.map((point) => (
          <li key={point.title} className={point.summons ? SUMMONING_CELL_CLASS : 'relative'}>
            {point.summons && <PikachuEasterEgg trigger={summons} />}

            {/* The card paints over the mascot, so he is only ever seen once he clears its edge. */}
            {/* `h-full`: the grid stretches the <li>, but this inner box would otherwise shrink to its own text. */}
            <div className='relative z-10 h-full rounded-2xl border border-zinc-200/70 bg-white/85 p-4 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/85'>
              {point.summons ? (
                <button
                  type='button'
                  onClick={() => setSummons((count) => count + 1)}
                  title='Pika pika!'
                  aria-label='Pika pika!'
                  className={`${BADGE_CLASS} transition hover:bg-cyan-600/20 active:scale-95`}>
                  <Icon icon={point.icon} className='h-4 w-4' />
                </button>
              ) : (
                <span className={BADGE_CLASS}>
                  <Icon icon={point.icon} className='h-4 w-4' />
                </span>
              )}

              <h2 className='mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
                {point.title}
              </h2>
              <p className='mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400'>
                {point.body}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Link
        href='/logo'
        className='self-center text-xs text-zinc-400 underline decoration-dotted underline-offset-2 transition-colors duration-150 ease-out hover:text-cyan-600 dark:text-zinc-500 dark:hover:text-cyan-400'>
        Logo assets
      </Link>
    </motion.div>
  );
}
