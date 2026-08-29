import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// SINGLE=1 : tout est inliné dans un seul index.html, ouvrable par double-clic
// (indispensable pour envoyer le jeu par mail / AirDrop : depuis file://,
//  le navigateur refuse de charger des modules JS externes)
const single = process.env.SINGLE === '1';

export default defineConfig({
  base: single ? './' : '/',
  plugins: single ? [viteSingleFile()] : [],
  build: {
    outDir: single ? 'dist-single' : 'dist',
    assetsInlineLimit: single ? 100000000 : 4096,
  },
});
