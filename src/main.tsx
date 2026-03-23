import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/zh-cn';
import 'antd/dist/reset.css';
import './assets/styles/global.less';
import './animations/styles/keyframes.less';

// 配置 dayjs 插件和语言
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('zh-cn');

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
    <App />
  </React.StrictMode>
);
