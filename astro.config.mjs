import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'http://localhost:4321', // Development URL, change this in production
  output: 'hybrid',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      cssMinify: true,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'chat': ['./src/components/ChatBox.astro']
          }
        }
      }
    }
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.openai.com;"
    }
  }
});