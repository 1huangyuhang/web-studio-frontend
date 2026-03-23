import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import store from './redux/store';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#8B0000', // 深红色 - 主要颜色
          colorSuccess: '#2C1810', // 深棕色 - 成功颜色
          colorWarning: '#F5F5DC', // 米色 - 警告颜色
          colorError: '#8B0000', // 深红色 - 错误颜色
          colorText: '#2C1810', // 深棕色 - 主要文本颜色
          colorTextSecondary: '#665248', // 深棕色 - 次要文本颜色
          colorBorder: '#E8E8E8', // 浅灰色 - 边框颜色
          colorBgContainer: '#FFFFFF', // 白色 - 容器背景颜色
        },
      }}
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
    </ConfigProvider>
  );
}

export default App;
