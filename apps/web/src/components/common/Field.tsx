import type { ReactNode } from 'react';

interface Props {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

/** The control styling every input, select and textarea in the app shares. */
export const controlClassName =
  'w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition outline-none placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500';

/**
 * A labeled form field with an optional hint and error line.
 **/
export default function Field({ label, hint, error, htmlFor, children }: Props) {
  return (
    <div className='flex flex-col text-left'>
      <label
        htmlFor={htmlFor}
        className='mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400'>
        {label}
      </label>
      {children}
      {error ? (
        <span className='mt-1.5 block text-xs text-red-500'>{error}</span>
      ) : (
        hint && (
          <span className='mt-1.5 block text-xs text-zinc-400 dark:text-zinc-500'>{hint}</span>
        )
      )}
    </div>
  );
}
