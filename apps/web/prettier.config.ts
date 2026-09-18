import type { Config } from 'prettier';

import baseConfig from '../../prettier.config.ts';

// The workspace config plus the Tailwind class-sorting plugin (web-only).
// Keep the plugin in the ROOT package.json too: prettier resolves it from its own cwd, not this file.
const config: Config = {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
