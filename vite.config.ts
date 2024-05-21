import { sveltekit } from '@sveltejs/kit/vite';
import type { ResolvedConfig, UserConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import fs from 'fs';

let _config: ResolvedConfig;

const config: UserConfig = {
  plugins: [
    sveltekit(),
    wasm(),
    topLevelAwait(),
    {
      // For whatever reason vite places worker assets in a different folder than it
      // tries to import them from, so we help it along (✿◠‿◠).
      name: "ILOVEWORKERSILOVEWORKERSILOVEWORKERS",
      configResolved: (cfg) => {
        _config = cfg;
      },

      writeBundle: async () => {
        let outDir = _config.build.outDir;
        if (outDir.endsWith('server')) return;
        fs.cpSync(
          `${outDir}/_app/immutable/workers/assets/`,
          `${outDir}/assets/assets`,
          {recursive: true},
        )
      }
    }
  ],
  worker: {
    plugins: () => [wasm(), topLevelAwait()],
  },
};

export default config;
