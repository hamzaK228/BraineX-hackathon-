import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './frontend',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/pages/main.html'),
        fields: path.resolve(__dirname, 'frontend/pages/fields.html'),
        scholarships: path.resolve(__dirname, 'frontend/pages/scholarships.html'),
        projects: path.resolve(__dirname, 'frontend/pages/projects.html'),
        mentors: path.resolve(__dirname, 'frontend/pages/mentors.html'),
        roadmaps: path.resolve(__dirname, 'frontend/pages/roadmaps.html'),
        events: path.resolve(__dirname, 'frontend/pages/events.html'),
        about: path.resolve(__dirname, 'frontend/pages/about.html'),
        admin: path.resolve(__dirname, 'frontend/pages/admin.html'),
        notion: path.resolve(__dirname, 'frontend/pages/notion.html'),
      },
      output: {},
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssMinify: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [],
  },
});
