import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { router } from '@/app/router';
import '@/app/styles/global.scss';

dayjs.locale('zh-cn');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      componentSize="small"
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2f88db',
          borderRadius: 14,
          controlHeight: 36,
          controlHeightSM: 32,
        },
        components: {
          Card: {
            borderRadiusLG: 24,
          },
          Modal: {
            borderRadiusLG: 24,
          },
          Table: {
            borderColor: 'rgba(20, 33, 61, 0.08)',
          },
        },
      }}
    >
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>,
);
