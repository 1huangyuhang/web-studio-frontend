import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { devPorts } from './vite-env-ports';

const ports = devPorts(__dirname);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 构建分析插件
    visualizer({
      open: false, // 关闭自动打开，避免每次构建都创建新窗口
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/build-analysis.html', // 明确指定输出路径，确保文件生成在dist目录中
      template: 'treemap', // 使用树形图模板，更直观
      sourcemap: false, // 关闭sourcemap，提高生成速度
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  // 构建优化配置
  build: {
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用Rollup的Tree Shaking
    treeshake: true,
    // 生成源映射文件
    sourcemap: false,
    // 优化资源
    optimizeDeps: {
      // 预构建依赖
      include: ['react', 'react-dom', 'antd'],
      // 禁用依赖预构建
      exclude: [],
    },
    // 输出配置
    rollupOptions: {
      output: {
        // 代码分割配置
        manualChunks: {
          // 将React相关库打包成一个chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将Ant Design相关库打包成一个chunk
          'antd-vendor': ['antd'],
          // 将工具库打包成一个chunk
          utils: [
            'axios',
            '@reduxjs/toolkit',
            'react-redux',
            '@tanstack/react-query',
          ],
        },
        // 压缩选项
        compact: true,
        // 生成的chunk文件名格式
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // 资产目录
    assetsDir: 'assets',
    // 清除输出目录
    emptyOutDir: true,
    //  chunk大小警告限制（kb）
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: ports.site,
    // 配置API代理，避免跨域问题（端口见 scripts/dev-ports.env）
    proxy: {
      '/api': {
        target: `http://localhost:${ports.api}`,
        changeOrigin: true,
      },
    },
  },
});
