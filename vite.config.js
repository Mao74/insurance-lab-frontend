import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Custom plugin to treat public/insurance-lab.ai.html as the source of truth
const staticSiteSync = () => {
  return {
    name: 'static-site-sync',

    // 1. During Dev: Serve the public file content when requesting index.html
    transformIndexHtml(html) {
      const publicHtmlPath = path.resolve(__dirname, 'public/insurance-lab.ai.html');
      try {
        if (fs.existsSync(publicHtmlPath)) {
          return fs.readFileSync(publicHtmlPath, 'utf-8');
        }
      } catch (e) {
        console.error('Error reading public html:', e);
      }
      return html;
    },

    // 2. Watch for changes in the public file to trigger reload
    handleHotUpdate({ file, server }) {
      if (file.endsWith('insurance-lab.ai.html')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },

    // 3. Before Build: overwrite index.html so the bundler uses the static content
    buildStart() {
      const publicHtmlPath = path.resolve(__dirname, 'public/insurance-lab.ai.html');
      const indexHtmlPath = path.resolve(__dirname, 'index.html');
      if (fs.existsSync(publicHtmlPath)) {
        fs.copyFileSync(publicHtmlPath, indexHtmlPath);
        console.log('[static-site-sync] Synced index.html with public/insurance-lab.ai.html');
      }
    }
  };
};

export default defineConfig({
  plugins: [react(), staticSiteSync()],
  server: {
    port: 3000, // Forza la porta 3000
    host: true, // Espone il server (opzionale, utile per docker/network)
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});