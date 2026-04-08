const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

function isNodeModule(id, pkg) {
  return id.includes(`/node_modules/${pkg}/`);
}

function matchesAny(id, packages) {
  return packages.some((pkg) => isNodeModule(id, pkg));
}

module.exports = defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (matchesAny(id, ['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'])) {
            return 'react-vendor';
          }

          if (matchesAny(id, ['axios', 'zustand', 'dayjs', 'moment'])) {
            return 'data-vendor';
          }

          if (isNodeModule(id, '@ant-design/icons')) {
            return 'icons-vendor';
          }

          if (
            matchesAny(id, [
              '@ant-design/colors',
              '@ant-design/cssinjs',
              '@ant-design/cssinjs-utils',
              '@ant-design/fast-color',
              '@ant-design/react-slick',
              '@babel/runtime',
              'classnames',
              'copy-to-clipboard',
              'csstype',
              'json2mq',
              'qrcode.react',
              'scroll-into-view-if-needed',
              'string-convert',
              'throttle-debounce',
              'toggle-selection',
            ])
          ) {
            return 'antd-core';
          }

          if (
            id.includes('/node_modules/antd/es/form') ||
            id.includes('/node_modules/antd/es/input') ||
            id.includes('/node_modules/antd/es/input-number') ||
            id.includes('/node_modules/antd/es/checkbox') ||
            id.includes('/node_modules/antd/es/radio') ||
            id.includes('/node_modules/antd/es/switch') ||
            id.includes('/node_modules/antd/es/mentions') ||
            matchesAny(id, ['rc-field-form', 'async-validator'])
          ) {
            return 'antd-form';
          }

          if (
            id.includes('/node_modules/antd/es/select') ||
            id.includes('/node_modules/antd/es/tree-select') ||
            id.includes('/node_modules/antd/es/cascader') ||
            id.includes('/node_modules/antd/es/auto-complete') ||
            matchesAny(id, ['rc-select', 'rc-tree-select', 'rc-cascader'])
          ) {
            return 'antd-select';
          }

          if (
            id.includes('/node_modules/antd/es/date-picker') ||
            id.includes('/node_modules/antd/es/time-picker') ||
            id.includes('/node_modules/antd/es/calendar') ||
            matchesAny(id, ['rc-picker'])
          ) {
            return 'antd-date';
          }

          if (
            id.includes('/node_modules/antd/es/table') ||
            id.includes('/node_modules/antd/es/pagination') ||
            id.includes('/node_modules/antd/es/spin') ||
            matchesAny(id, ['rc-table', 'rc-pagination', 'rc-virtual-list', '@rc-component/context'])
          ) {
            return 'antd-table';
          }

          if (
            id.includes('/node_modules/antd/es/modal') ||
            id.includes('/node_modules/antd/es/message') ||
            id.includes('/node_modules/antd/es/notification') ||
            id.includes('/node_modules/antd/es/popconfirm') ||
            id.includes('/node_modules/antd/es/popover') ||
            id.includes('/node_modules/antd/es/tooltip') ||
            id.includes('/node_modules/antd/es/drawer') ||
            matchesAny(id, ['rc-dialog', 'rc-notification', 'rc-tooltip', 'rc-trigger', 'rc-motion'])
          ) {
            return 'antd-feedback';
          }

          if (
            id.includes('/node_modules/antd/es/upload') ||
            id.includes('/node_modules/antd/es/image') ||
            id.includes('/node_modules/antd/es/progress') ||
            matchesAny(id, ['rc-upload', 'rc-image'])
          ) {
            return 'antd-media';
          }

          if (
            id.includes('/node_modules/antd/es/menu') ||
            id.includes('/node_modules/antd/es/dropdown') ||
            id.includes('/node_modules/antd/es/tabs') ||
            id.includes('/node_modules/antd/es/tree') ||
            id.includes('/node_modules/antd/es/layout') ||
            matchesAny(id, ['rc-menu', 'rc-dropdown', 'rc-tabs', 'rc-tree'])
          ) {
            return 'antd-navigation';
          }

          if (
            id.includes('/node_modules/antd/es/button') ||
            id.includes('/node_modules/antd/es/float-button') ||
            id.includes('/node_modules/antd/es/affix') ||
            id.includes('/node_modules/antd/es/anchor')
          ) {
            return 'antd-actions';
          }

          if (
            id.includes('/node_modules/antd/es/typography') ||
            id.includes('/node_modules/antd/es/card') ||
            id.includes('/node_modules/antd/es/tag') ||
            id.includes('/node_modules/antd/es/descriptions') ||
            id.includes('/node_modules/antd/es/list') ||
            id.includes('/node_modules/antd/es/avatar') ||
            id.includes('/node_modules/antd/es/badge') ||
            id.includes('/node_modules/antd/es/empty') ||
            id.includes('/node_modules/antd/es/result') ||
            id.includes('/node_modules/antd/es/statistic')
          ) {
            return 'antd-display';
          }

          if (
            id.includes('/node_modules/antd/es/app') ||
            id.includes('/node_modules/antd/es/config-provider') ||
            id.includes('/node_modules/antd/es/locale') ||
            id.includes('/node_modules/antd/es/theme') ||
            id.includes('/node_modules/antd/es/style') ||
            id.includes('/node_modules/antd/es/_util') ||
            id.includes('/node_modules/antd/es/watermark') ||
            id.includes('/node_modules/antd/es/version')
          ) {
            return 'antd-runtime';
          }

          if (
            id.includes('/node_modules/antd/es/card') ||
            id.includes('/node_modules/antd/es/space') ||
            id.includes('/node_modules/antd/es/typography') ||
            id.includes('/node_modules/antd/es/tag') ||
            id.includes('/node_modules/antd/es/descriptions') ||
            id.includes('/node_modules/antd/es/divider') ||
            id.includes('/node_modules/antd/es/flex') ||
            id.includes('/node_modules/antd/es/grid') ||
            id.includes('/node_modules/antd/es/skeleton') ||
            isNodeModule(id, 'antd')
          ) {
            return 'antd-base';
          }

          if (
            id.includes('/node_modules/@ant-design/') ||
            id.includes('/node_modules/@rc-component/') ||
            id.includes('/node_modules/rc-')
          ) {
            return 'antd-shared';
          }

          return 'vendor-misc';
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
