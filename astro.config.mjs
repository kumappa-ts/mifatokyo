// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // 静的サイト生成
  output: 'static',

  // ビルド設定
  build: {
    inlineStylesheets: 'auto',  // 小さいCSSはインライン化
    assets: '_assets'
  },

  // 画像最適化
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },

  // Viteの設定をカスタマイズ
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import "/src/styles/_variables.scss";
          @import "/src/styles/_mixins.scss";`
        }
      }
    },
    build: {
      cssMinify: 'lightningcss',  // 高速化
      rollupOptions: {
        output: {
          assetFileNames: '_assets/[name].[hash][extname]'
        }
      }
    }
  },
  integrations: [
    sitemap()
  ],
  server: {
    host: true,
    port: 4321
  },
});