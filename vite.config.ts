import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import manifest from './manifest.json';

export default defineConfig({
    base: './',  // Use relative paths for Chrome extension compatibility
    plugins: [
        react(),
        crx({ manifest }),
    ],
    resolve: {
        alias: {
            '@lib': resolve(__dirname, 'src/lib'),
            '@components': resolve(__dirname, 'src/popup/components'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/index.html'),
            },
        },
    },
});
