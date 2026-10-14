// @ts-check
import { defineConfig } from 'astro/config';

// Static-first build for Cloudflare Pages. No adapter: every page is prerendered.
export default defineConfig({
  site: 'https://line12-tracker.pages.dev',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  // `astro dev` only: bundle the lazily loaded libraries up front. Otherwise Vite finds them when the map or the
  // 3D scene first loads, bundles them again, and the open page gets "504 Outdated Optimize Dep": no map, no train.
  vite: { optimizeDeps: { include: ['maplibre-gl', 'three', 'gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'] } },
});
