import type { LinkStatus } from '@url-shortener/types';

import Icon, { type IconName } from '@/components/common/Icon';

interface Props {
  status: LinkStatus;
}

const STYLES: Record<LinkStatus, { label: string; icon: IconName; className: string }> = {
  ACTIVE: {
    label: 'Active',
    icon: 'CheckCircle',
    className:
      'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-300',
  },
  EXPIRED: {
    label: 'Expired',
    icon: 'Hourglass',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
  DISABLED: {
    label: 'Disabled',
    icon: 'Ban',
    className:
      'border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
  },
};

/**
 * Pill showing a link's derived status.
 **/
export default function StatusBadge({ status }: Props) {
  const style = STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-x-1 rounded-full border px-2 py-0.5 text-xs font-medium ${style.className}`}>
      <Icon icon={style.icon} className='h-3 w-3' />
      {style.label}
    </span>
  );
}
