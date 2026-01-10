// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/tools/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',  // 特定のページだけ
    './src/components/tools/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
    './src/components/ImageConverter.jsx'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}