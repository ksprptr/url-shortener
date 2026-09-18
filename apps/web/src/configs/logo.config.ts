/** How much of the tile the icon covers — the rest is the padding around the mark. */
const ICON_RATIO = 0.56;

/** One stroke of the mark, kept as data so the React logo and the SVG file cannot drift apart. */
export type LogoIconNode =
  { tag: 'path'; d: string } | { tag: 'line'; x1: number; y1: number; x2: number; y2: number };

interface LogoConfig {
  /** Canvas edge of the square tile. */
  size: number;
  radius: number;
  background: string;
  foreground: string;
  icon: {
    /** The grid lucide draws its icons on. */
    grid: number;
    strokeWidth: number;
    nodes: LogoIconNode[];
  };
}

/** File name of the downloadable logo. */
export const LOGO_FILE_NAME = 'url-shortener-logo.svg';

/** Where the glyph comes from, credited on the logo page. */
export const LOGO_ICON_SOURCE = {
  name: 'link',
  url: 'https://lucide.dev/icons/link',
};

/** Geometry of the app mark — a cyan `link`-glyph tile (ISC); shared by the React logo, OG image and SVG download. */
export const logoConfig: LogoConfig = {
  size: 512,
  radius: 112,
  background: '#0891b2',
  foreground: '#ffffff',
  icon: {
    grid: 24,
    strokeWidth: 2.25,
    nodes: [
      { tag: 'path', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' },
      { tag: 'path', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
    ],
  },
};

/** Rounded so the generated SVG carries clean numbers instead of float noise. */
const round = (value: number): number => Math.round(value * 1e4) / 1e4;

/** Scale + offset that centre the 24-unit icon grid on the tile. */
export const logoGeometry = {
  scale: round((logoConfig.size * ICON_RATIO) / logoConfig.icon.grid),
  offset: round((logoConfig.size * (1 - ICON_RATIO)) / 2),
};
