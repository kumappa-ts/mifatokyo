// @ts-check
import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown';
// import image from '@astrojs/image';

// https://astro.build/config
export default defineConfig({
  integrations: [partytown()],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  viewTransitions: true, // この設定が古くなっている可能性
  // experimental: {
  //   // 他の実験的機能
  // },
});
