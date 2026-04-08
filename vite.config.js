const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('/node_modules/@ant-design/icons/')) {
            return 'icons-vendor';
          }

          if (id.includes('/node_modules/antd/')) {
            return 'antd-vendor';
          }

          if (
            id.includes('/node_modules/@ant-design/') ||
            id.includes('/node_modules/@rc-component/') ||
            id.includes('/node_modules/rc-')
          ) {
            return 'antd-ecosystem';
          }

          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/react-router/') ||
            id.includes('/node_modules/react-router-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }

          if (
            id.includes('/node_modules/axios/') ||
            id.includes('/node_modules/zustand/') ||
            id.includes('/node_modules/dayjs/') ||
            id.includes('/node_modules/moment/')
          ) {
            return 'data-vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 8888,
    host: '0.0.0.0',
  },
});
