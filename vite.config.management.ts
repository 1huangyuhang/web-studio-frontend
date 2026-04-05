import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { devPorts } from './vite-env-ports';

const ports = devPorts(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './management/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: ports.management,
    open: '/', // 打开根路径，不指定具体文件
    fs: {
      strict: false,
    },
    // 与官网、scripts/dev-ports.env、REDWOOD_PORT_API 一致，避免代理仍指向 3000 而后端在其它端口导致「列表 500」
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${ports.api}`,
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
