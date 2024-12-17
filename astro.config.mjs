// @ts-check
import { defineConfig } from 'astro/config';
// import image from '@astrojs/image';

// https://astro.build/config
export default defineConfig({
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
