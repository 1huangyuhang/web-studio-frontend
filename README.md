# Redwood Frontend Project

企业网站前端项目，包含活动、产品、新闻等功能。

## 项目截图

以下为仓库根目录 [`assets/`](./assets/) 中的界面示意（官网与管理端）。

### 官网

| 首屏                               | 全页长图                       |
| ---------------------------------- | ------------------------------ |
| ![官网首页首屏](./assets/首页.jpg) | ![官网全页](./assets/全局.jpg) |

### 企业运营后台（管理端）

| 登录                                     | 工作台                                 |
| ---------------------------------------- | -------------------------------------- |
| ![管理端登录](./assets/管理系统后端.jpg) | ![管理端工作台](./assets/后端页面.jpg) |

## 项目结构

```
├── src/              # 前端源码
│   ├── animations/   # 动画相关组件和工具
│   ├── assets/       # 静态资源
│   ├── components/   # 通用组件
│   ├── hooks/        # 自定义钩子
│   ├── pages/        # 页面组件
│   ├── redux/        # Redux状态管理
│   ├── services/     # API服务
│   ├── types/        # TypeScript类型定义
│   └── utils/        # 工具函数
├── backend/          # 后端API服务
│   ├── src/          # 后端源码
│   └── prisma/       # Prisma ORM配置
├── management/       # 管理后台
├── public/           # 公共静态资源
└── dist/             # 构建输出目录
```

## 功能特性

- **响应式设计**：适配桌面和移动设备
- **视频滚动动画**：基于滚动位置的视频播放控制
- **活动管理**：查看和管理企业活动
- **产品展示**：展示企业产品信息
- **新闻中心**：企业新闻和动态
- **管理后台**：内容管理系统

## 技术栈

- **前端**：React, TypeScript, Less, Vite
- **后端**：Node.js, Express, TypeScript, Prisma, PostgreSQL
- **状态管理**：Redux Toolkit
- **API调用**：Axios
- **动画**：自定义动画组件

## 快速开始

### 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行数据库迁移
npx prisma migrate dev

# 生成Prisma客户端
npx prisma generate
```

## 环境配置

### 前端环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_KEY=default-api-key
```

### 后端环境变量

创建 `backend/.env` 文件：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/redwood_shop?schema=public"
PORT=3000
NODE_ENV=development
PRISMA_LOG_LEVEL=error
```

## 数据库设置

1. 安装 PostgreSQL
2. 创建数据库：`CREATE DATABASE redwood_shop;
3. 运行迁移：`npx prisma migrate dev`

## 部署

### 前端部署

1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到静态文件服务器

### 后端部署

1. 构建生产版本：`npm run build`
2. 部署到服务器并启动：`npm start`

## 许可证

MIT
