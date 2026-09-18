import type { ExtendedProps } from '@/common/types/global.types';
import { logoIconNodes } from '@/common/utils/logo.functions';
import { logoConfig, logoGeometry } from '@/configs/logo.config';

const { size, radius, background, foreground, icon } = logoConfig;
const { scale, offset } = logoGeometry;

interface Props extends ExtendedProps {
  /** Accessible name; the mark is decorative wherever the wordmark is next to it. */
  label?: string;
}

/**
 * The app mark — the same geometry the manifest icon and the OG image use.
 **/
export default function Logo({ className, label }: Props) {
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <rect width={size} height={size} rx={radius} fill={background} />
      <g
        transform={`translate(${offset} ${offset}) scale(${scale})`}
        fill='none'
        stroke={foreground}
        strokeWidth={icon.strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'>
        {logoIconNodes()}
      </g>
    </svg>
  );
}
