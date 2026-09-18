import { logoConfig, logoGeometry, type LogoIconNode } from '@/configs/logo.config';

/**
 * Serializes a single logo stroke as SVG markup.
 **/
const renderNode = (node: LogoIconNode): string =>
  node.tag === 'path'
    ? `<path d="${node.d}" />`
    : `<line x1="${node.x1}" y1="${node.y1}" x2="${node.x2}" y2="${node.y2}" />`;

/**
 * Builds the standalone logo SVG file contents.
 **/
export const buildLogoSvg = (appName: string): string => {
  const { size, radius, background, foreground, icon } = logoConfig;
  const { scale, offset } = logoGeometry;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none">`,
    `  <title>${appName}</title>`,
    `  <rect width="${size}" height="${size}" rx="${radius}" fill="${background}" />`,
    `  <g transform="translate(${offset} ${offset}) scale(${scale})" fill="none" stroke="${foreground}" stroke-width="${icon.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">`,
    ...icon.nodes.map((node) => `    ${renderNode(node)}`),
    `  </g>`,
    `</svg>`,
    '',
  ].join('\n');
};
