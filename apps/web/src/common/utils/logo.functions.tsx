import type { ReactElement } from 'react';

import { logoConfig } from '@/configs/logo.config';

/**
 * The mark's strokes as React elements.
 **/
// An array, NOT a fragment: Satori leaves fragments inside `<svg>`, rendering an empty OG tile.
export const logoIconNodes = (): ReactElement[] =>
  logoConfig.icon.nodes.map((node, index) =>
    node.tag === 'path' ? (
      <path key={index} d={node.d} />
    ) : (
      <line key={index} x1={node.x1} y1={node.y1} x2={node.x2} y2={node.y2} />
    ),
  );
