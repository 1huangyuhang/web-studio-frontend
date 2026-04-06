import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { getQueryClient } from '@/lib/queryClient';
import { antdManagementTheme } from '../../src/config/antdThemeManagement';
import '@/styles/admin-shell.less';
import AdminLayout from '@/layouts/AdminLayout';
import RequireManagementAuth from '@/components/RequireManagementAuth';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/Product';
import ActivityManagement from './pages/Activity';
import NewsManagement from './pages/News';
import SiteAssetManagement from './pages/SiteAsset';
import CourseManagement from './pages/Course';
import PricingPlanManagement from './pages/PricingPlan';
import ContactMessages from './pages/ContactMessages';
import SupportTickets from './pages/SupportTickets';
import ManagementLogin from './pages/ManagementLogin';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

const queryClient = getQueryClient();

// 过滤掉Prisma查询引擎的Go指针日志和其他不必要的日志
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleDebug = console.debug;
const originalConsoleInfo = console.info;
const originalConsoleTrace = console.trace;
const originalConsoleAssert = console.assert;
const originalConsoleDir = console.dir;
const originalConsoleDirxml = console.dirxml;
const originalConsoleGroup = console.group;
const originalConsoleGroupCollapsed = console.groupCollapsed;
const originalConsoleGroupEnd = console.groupEnd;

const filterPrismaLogs = (args: any[]) => {
  // 处理不同类型的日志参数
  for (const arg of args) {
    let argStr = '';

    // 更安全的参数转换
    try {
      argStr = typeof arg === 'string' ? arg : JSON.stringify(arg);
    } catch (e) {
      argStr = String(arg);
    }

    // 匹配包含Go指针的日志
    if (/\[0xc[0-9a-f]+(\s+0xc[0-9a-f]+)*\]/.test(argStr)) {
      return false;
    }

    // 匹配其他可能的Prisma查询引擎日志
    if (
      /Prisma Query Engine|Query Engine|prisma:query|prisma:info|prisma:warn|prisma:error/.test(
        argStr
      )
    ) {
      return false;
    }
  }
  return true;
};

// 重写所有console方法，应用日志过滤
const createFilteredConsoleMethod = (
  originalMethod: (...args: any[]) => void
) => {
  return (...args: any[]) => {
    if (filterPrismaLogs(args)) {
      originalMethod.apply(console, args);
    }
  };
};

console.log = createFilteredConsoleMethod(originalConsoleLog);
console.error = createFilteredConsoleMethod(originalConsoleError);
console.warn = createFilteredConsoleMethod(originalConsoleWarn);
console.debug = createFilteredConsoleMethod(originalConsoleDebug);
console.info = createFilteredConsoleMethod(originalConsoleInfo);
console.trace = createFilteredConsoleMethod(originalConsoleTrace);
console.assert = createFilteredConsoleMethod(originalConsoleAssert);
console.dir = createFilteredConsoleMethod(originalConsoleDir);
console.dirxml = createFilteredConsoleMethod(originalConsoleDirxml);
console.group = createFilteredConsoleMethod(originalConsoleGroup);
console.groupCollapsed = createFilteredConsoleMethod(
  originalConsoleGroupCollapsed
);
console.groupEnd = createFilteredConsoleMethod(originalConsoleGroupEnd);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={antdManagementTheme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/*
            业务页使用静态 import，避免 lazy + 外层 Suspense 在切换菜单时出现整页骨架闪动。
            代价为首包体积增大（管理端内网工具可接受）。
          */}
          <Routes>
            <Route path="/login" element={<ManagementLogin />} />
            <Route element={<RequireManagementAuth />}>
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="activities" element={<ActivityManagement />} />
                <Route path="news" element={<NewsManagement />} />
                <Route path="site-assets" element={<SiteAssetManagement />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route
                  path="pricing-plans"
                  element={<PricingPlanManagement />}
                />
                <Route path="contact-messages" element={<ContactMessages />} />
                <Route path="support-tickets" element={<SupportTickets />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>
);
