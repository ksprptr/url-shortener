'use client';

import type { CreatedLink } from '@url-shortener/types';
import { motion } from 'motion/react';

import { useCopyToClipboard } from '@/common/hooks/useCopyToClipboard';
import {
  formatDateTime,
  formatRelative,
  formatUrlForDisplay,
} from '@/common/utils/format.functions';
import Button from '@/components/common/Button';
import Icon from '@/components/common/Icon';
import { useToast } from '@/components/providers/ToastProvider';

interface Props {
  link: CreatedLink;
  onReset: () => void;
}

/**
 * The card shown after a successful shorten: the short URL, its expiry and a copy button.
 **/
export default function ShortenResult({ link, onReset }: Props) {
  const { copied, copy } = useCopyToClipboard();
  const toast = useToast();

  const handleCopy = async () => {
    const ok = await copy(link.shortUrl);

    if (ok) {
      toast.success('Short link copied.');
      return;
    }

    toast.error('Could not reach the clipboard — copy it manually.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className='rounded-2xl border border-cyan-200 bg-white p-6 shadow-sm sm:p-8 dark:border-cyan-900/60 dark:bg-zinc-900'>
      <div className='flex items-center gap-x-2 text-cyan-600 dark:text-cyan-400'>
        <Icon icon='CheckCircle' className='h-5 w-5' />
        <span className='text-sm font-semibold'>Your link is ready</span>
      </div>

      <div className='mt-4 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-950'>
        <a
          href={link.shortUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='min-w-0 flex-1 truncate font-medium text-cyan-700 hover:underline dark:text-cyan-400'>
          {link.shortUrl.replace(/^https?:\/\//, '')}
        </a>
        <Button variant='primary' size='sm' onClick={handleCopy} className='shrink-0'>
          <Icon icon={copied ? 'Check' : 'Copy'} className='h-3.5 w-3.5' />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <dl className='mt-4 grid gap-3 text-sm sm:grid-cols-2'>
        <div className='flex items-start gap-x-2'>
          <Icon icon='ArrowRight' className='mt-0.5 h-4 w-4 shrink-0 text-zinc-400' />
          <div className='min-w-0'>
            <dt className='text-xs text-zinc-400 dark:text-zinc-500'>Points to</dt>
            <dd className='truncate text-zinc-700 dark:text-zinc-300' title={link.targetUrl}>
              {formatUrlForDisplay(link.targetUrl)}
            </dd>
          </div>
        </div>

        <div className='flex items-start gap-x-2'>
          <Icon
            icon={link.expiresAt ? 'Clock' : 'Infinity'}
            className='mt-0.5 h-4 w-4 shrink-0 text-zinc-400'
          />
          <div className='min-w-0'>
            <dt className='text-xs text-zinc-400 dark:text-zinc-500'>Expires</dt>
            <dd
              className='truncate text-zinc-700 dark:text-zinc-300'
              title={link.expiresAt ? `${formatDateTime(link.expiresAt)} UTC` : undefined}>
              {link.expiresAt ? formatRelative(link.expiresAt) : 'Never'}
            </dd>
          </div>
        </div>
      </dl>

      <div className='mt-6 flex justify-end'>
        <Button variant='transparent' size='sm' onClick={onReset}>
          <Icon icon='Plus' className='h-3.5 w-3.5' />
          Shorten another
        </Button>
      </div>
    </motion.div>
  );
}
