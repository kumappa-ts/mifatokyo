// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
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
    worker: {
      format: 'es'  // ← これを追加
    },
    css: {
      // transformer: 'lightningcss',
      postcss: './postcss.config.mjs',

      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "/src/styles/_variables.scss" as *;
            @use "/src/styles/_mixins.scss" as *;`
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
    },
    optimizeDeps: {
      exclude: ['@jsquash/avif']
    },
    server: {
      fs: {
        allow: ['..']
      }
    }
  },
  integrations: [
    react(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
      config: {
        // Lightning CSSを使わない
        vite: {
          css: {
            transformer: undefined  // TailwindはPostCSSで処理
          }
        }
      }
    })
  ],
  server: {
    host: true,
    port: 4321
  },
});