import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 忽略 TypeScript 错误
    typescript: {
      ignoreBuildErrors: true,
    },
  },
  server: {
    port: 3000,
    open: true,
    // 代理配置 - 解决 CORS 跨域问题
    proxy: {
      '/api/hongniaoai': {
        target: 'https://open.hongniaoai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hongniaoai/, '/api'),
        secure: false,
        timeout: 30000,
      },
    },
  },
});
