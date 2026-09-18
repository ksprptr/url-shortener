'use client';

import { motion } from 'motion/react';

import { downloadTextFile } from '@/common/utils/download.functions';
import Icon from '@/components/common/Icon';
import Logo from '@/components/common/Logo';
import { appConfig } from '@/configs/app/app.config';
import { LOGO_FILE_NAME, logoConfig } from '@/configs/logo.config';

import { buildLogoSvg } from '../helpers/logo.helpers';

/** Icon-scale previews shown under the main tile, so the mark can be judged small. */
const PREVIEW_SIZES = ['h-24 w-24', 'h-16 w-16', 'h-10 w-10', 'h-6 w-6'];

/**
 * The downloadable logo card — a large preview, icon-scale previews and the SVG download.
 **/
export default function LogoCard() {
  const downloadSvg = () =>
    downloadTextFile(buildLogoSvg(appConfig.name), LOGO_FILE_NAME, 'image/svg+xml');

  return (
    <motion.section
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.1 }}
      className='flex flex-col gap-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='flex flex-col items-center gap-8'>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.18 }}
          className='flex aspect-square w-full max-w-70 items-center justify-center rounded-2xl bg-zinc-50 p-8 dark:bg-zinc-950'>
          <Logo className='h-full w-full' label={appConfig.name} />
        </motion.div>

        <div className='flex items-end gap-4'>
          {PREVIEW_SIZES.map((size, index) => (
            <motion.div
              key={size}
              initial={{ y: 8, scale: 0.6, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 24,
                delay: 0.26 + index * 0.05,
              }}
              className='shrink-0'>
              <Logo className={size} />
            </motion.div>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-2.5'>
        <button
          type='button'
          onClick={downloadSvg}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-cyan-600/25 transition-colors duration-150 ease-out hover:bg-cyan-700'>
          <Icon icon='Download' className='h-4 w-4' />
          Download SVG
        </button>

        <dl className='grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950'>
          <dt className='text-zinc-500 dark:text-zinc-400'>Format</dt>
          <dd className='text-right font-medium'>SVG (vector)</dd>
          <dt className='text-zinc-500 dark:text-zinc-400'>Canvas</dt>
          <dd className='text-right font-medium'>
            {logoConfig.size} × {logoConfig.size}
          </dd>
          <dt className='text-zinc-500 dark:text-zinc-400'>Background</dt>
          <dd className='text-right font-medium'>{logoConfig.background}</dd>
        </dl>
      </div>
    </motion.section>
  );
}
