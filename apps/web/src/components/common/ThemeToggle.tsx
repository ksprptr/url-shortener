'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import Icon, { type IconName } from '@/components/common/Icon';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const OPTIONS: { value: string; label: string; icon: IconName }[] = [
  { value: 'system', label: 'System', icon: 'Monitor' },
  { value: 'light', label: 'Light', icon: 'Sun' },
  { value: 'dark', label: 'Dark', icon: 'Moon' },
];

/**
 * Theme picker: a button that opens a menu to choose System, Light or Dark.
 **/
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointer);
    window.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // Reserve the space before mount so the header doesn't shift once the theme is known.
  if (!mounted) {
    return <div className='h-9 w-9' />;
  }

  const active = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[0];

  return (
    <div ref={ref} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((value) => !value)}
        className='inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
        aria-label='Change theme'
        aria-haspopup='menu'
        aria-expanded={open}>
        <Icon icon={active.icon} className='h-4 w-4' />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role='menu'
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className='absolute top-full right-0 z-50 mt-2 w-36 origin-top-right overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900'>
            {OPTIONS.map((option) => {
              const selected = option.value === active.value;

              return (
                <button
                  key={option.value}
                  type='button'
                  role='menuitem'
                  onClick={() => {
                    setTheme(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-x-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    selected
                      ? 'bg-cyan-600/10 text-cyan-700 dark:text-cyan-300'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}>
                  <Icon icon={option.icon} className='h-4 w-4' />
                  <span className='flex-1 text-left'>{option.label}</span>
                  {selected && <Icon icon='Check' className='h-3.5 w-3.5' />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
