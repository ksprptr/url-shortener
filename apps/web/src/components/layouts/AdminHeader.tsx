'use client';

import Link from 'next/link';

import { logout } from '@/actions/auth/auth.actions';
import Icon from '@/components/common/Icon';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';
import { appConfig } from '@/configs/app/app.config';

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
}

/**
 * Sticky admin header: the wordmark, a refresh button, the theme picker and sign-out.
 **/
export default function AdminHeader({ onRefresh, refreshing }: Props) {
  return (
    <header className='sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80'>
      <div className='mx-auto flex h-16 w-full max-w-6xl items-center gap-x-3 px-4'>
        <Link href='/' className='flex items-center gap-x-2.5' title='Back to the public page'>
          <Logo className='h-8 w-8 rounded-lg' label={appConfig.name} />
          <span className='text-base font-semibold'>{appConfig.name}</span>
        </Link>
        <span className='rounded-full bg-cyan-600/10 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-300'>
          Admin
        </span>

        <div className='ml-auto flex items-center gap-x-1'>
          <button
            type='button'
            onClick={onRefresh}
            disabled={refreshing}
            aria-label='Refresh data'
            title='Refresh data'
            className='inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'>
            <Icon icon='RefreshCw' className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <ThemeToggle />

          <form action={logout} className='flex'>
            <button
              type='submit'
              aria-label='Sign out'
              title='Sign out'
              className='inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-red-500/10 hover:text-red-500 dark:text-zinc-400'>
              <Icon icon='LogOut' className='h-4 w-4' />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
