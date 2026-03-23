import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3001, // 使用不同端口
    open: '/', // 打开根路径，不指定具体文件
    fs: {
      strict: false,
    },
    // 配置API代理，避免跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist-management', // 输出到不同目录
    rollupOptions: {
      // 使用管理系统的HTML入口文件
      input: {
        management: path.resolve(__dirname, 'management/index.html'),
      },
    },
  },
  root: './management', // 根目录设置为management目录
  publicDir: '../public', // 公共目录相对于management目录的路径
});
