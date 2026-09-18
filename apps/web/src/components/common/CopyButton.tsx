'use client';

import { useCopyToClipboard } from '@/common/hooks/useCopyToClipboard';
import Icon from '@/components/common/Icon';
import { useToast } from '@/components/providers/ToastProvider';

interface Props {
  value: string;
  /** Shown in the success toast, e.g. "Short link copied". */
  label?: string;
  className?: string;
}

/**
 * Icon button that copies a value and flips to a tick for a moment.
 **/
export default function CopyButton({ value, label = 'Copied to clipboard.', className }: Props) {
  const { copied, copy } = useCopyToClipboard();
  const toast = useToast();

  const handleClick = async () => {
    const ok = await copy(value);

    if (ok) {
      toast.success(label);
      return;
    }

    toast.error('Could not reach the clipboard — copy it manually.');
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      aria-label='Copy short link'
      title='Copy short link'
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-cyan-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-cyan-400 ${className ?? ''}`}>
      <Icon icon={copied ? 'Check' : 'Copy'} className='h-4 w-4' />
    </button>
  );
}
