'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/** The one path to repoint when this easter egg is ported into another app. */
const IMAGE_SRC = '/assets/easter-egg/pikachu.webp';

/** Directions (in px) the sparks fly out to on a click. */
const SPARKS = [
  { x: -22, y: -28 },
  { x: -8, y: -44 },
  { x: 16, y: -46 },
  { x: 36, y: -28 },
  { x: 42, y: 2 },
  { x: -18, y: 14 },
];

/** How long he stays out before ducking back behind the card. */
const BURST_MS = 2600;

const TRANSITION = { type: 'spring', stiffness: 260, damping: 18 } as const;

/** Tucked away: fully behind the card, small and rotated, so he unfolds as he rises. */
// Plain objects, not variant labels: a label can't resolve during SSR (hydration mismatch).
const HIDDEN = { y: 56, scale: 0.55, rotate: -18, opacity: 0 };

/** Popped out: standing on the card's top edge. */
const SHOWN = { y: -52, scale: 1, rotate: 0, opacity: 1 };

interface Props {
  /** Incremented by the host on every activation; 0 means he has never been called out. */
  trigger: number;
}

/**
 * Easter egg: a Pikachu hiding behind the card, who pops up and shouts when the host summons him.
 **/
// Absolutely positioned — the host must be `relative`, and must paint above this to hide him at rest.
export default function PikachuEasterEgg({ trigger }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), BURST_MS);

    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key='pikachu'
          initial={HIDDEN}
          animate={SHOWN}
          exit={HIDDEN}
          transition={TRANSITION}
          className='pointer-events-none absolute -top-2 right-3 z-0 w-20 origin-bottom'>
          {/* Right-anchored, so a long shout grows leftward instead of off the page edge. */}
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.4, rotate: -8 }}
            animate={{ opacity: 1, y: -18, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 16,
              delay: 0.18,
              opacity: { type: 'tween', duration: 0.2, ease: 'easeOut', delay: 0.18 },
            }}
            className='absolute -top-5 right-0 z-10 text-sm font-extrabold text-nowrap text-yellow-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] dark:text-yellow-300'>
            Pikach{'u'.repeat(Math.min(2 + trigger, 12))}!
          </motion.div>

          {SPARKS.map((spark, index) => (
            <motion.span
              key={`${trigger}-${index}`}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], x: spark.x, y: spark.y, scale: 1, rotate: 180 }}
              transition={{ duration: 0.7, delay: 0.2 + index * 0.03 }}
              className='absolute top-6 left-6 z-10 text-sm select-none'>
              ⚡
            </motion.span>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className='absolute inset-x-0 bottom-2 -z-10 mx-auto h-20 w-20 rounded-full bg-yellow-300/50 blur-2xl'
          />

          <motion.div
            animate={{ rotate: [0, -7, 7, -4, 4, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <Image
              src={IMAGE_SRC}
              alt=''
              width={794}
              height={993}
              // Served as-is: there is no sharp in the standalone runtime, so no /_next/image.
              unoptimized
              draggable={false}
              className='h-auto w-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] select-none'
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
