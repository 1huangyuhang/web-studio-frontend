# 官网 / 管理端与后端联调说明

## 端口与代理

- 端口定义见仓库根目录 [`scripts/dev-ports.env`](../scripts/dev-ports.env)（如 `REDWOOD_PORT_SITE=5173`、`REDWOOD_PORT_API=3000`）。
- 官网 Vite 将 `/api` 代理到本机 API 端口（见根目录 `vite.config.ts`）；**须先启动后端**，否则列表页会报网络错误。

## API Key（写入类接口仍需要）

- 后端环境变量 `API_KEY`（见 [`backend/.env.example`](../backend/.env.example)）须与官网、管理端的 `VITE_API_KEY` 一致（见根目录 [`.env.example`](../.env.example)、[`management/.env.example`](../management/.env.example)）。
- **商品、活动、新闻、课程、价格方案、站点素材、分类** 的 **GET 列表/详情** 已改为**匿名可读**（无需 Key）；**POST/PUT/DELETE** 以及 **`/api/stats/summary`** 仍须有效 `x-api-key` 或管理 JWT。

## 数据初始化

- 执行 Prisma 迁移与种子（见后端 `package.json` 脚本），保证 `products`、`site-assets` 等有数据；否则前端会显示空态而非报错。

## 残留登录态

- 官网 axios 对「匿名可读」的 GET（如 `/products`、`/site-assets` 等）在 **401** 时**不会**整页跳转登录，仅清除无效 `token`，避免坏令牌拖死商店/首页等页面。

## 手工烟测矩阵（官网）

| 场景                                           | 预期                                     |
| ---------------------------------------------- | ---------------------------------------- |
| 未登录访问 `/shop`、`/prices`、`/company/case` | 能加载列表（或空态/错误重试），不跳登录  |
| 登录后访问 `/dashboard`                        | 显示 `GET /api/stats/summary` 各计数卡片 |
| 未登录访问 `/dashboard`                        | 提示登录，不白屏                         |
| 联系页、帮助页提交表单                         | 201/成功提示（公开 POST）                |

更完整的管理端 CRUD 联动见 [mgmt-crud-verification.md](./mgmt-crud-verification.md)。
