# Redwood Frontend Project

企业官网（`src/`）+ 管理后台（`management/`）+ 后端 API（`backend/`）。

## 常用命令

```bash
npm install
npm run dev                    # 仅官网前端（默认 http://localhost:5173），不会自动启动后端
npm run dev:management         # 仅管理端，默认 http://localhost:3001（/api 代理到后端 3000）
npm run build                  # 官网生产构建
npm run build:management       # 管理端构建
npm run check:management-api   # 检查后端 /health 与 Vite 代理配置（联调前可跑）
npm run start:all              # 后端 + 双前端 + Prisma Studio（需本机 PostgreSQL 与 backend/.env）
```

**联调说明**：`npm run dev` 只启动官网 Vite；首页等页面从 `GET /api/site-assets?page=home` 拉取素材（**全量**，含外链或 Base64 图），需另开终端运行 `npm run dev --prefix backend`（或使用 `npm run start:all`）。**管理端「站点素材」列表**使用 `GET /api/site-assets?omitImage=1`，不在列表响应中序列化 BYTEA，避免大图多时 JSON 过大导致 500。更新 `siteAsset` 种子后请在 `backend` 目录执行 `npm run seed`（或项目约定的 seed 命令）再刷新页面。

管理端接口连不上时，见 [docs/management-api-troubleshooting.md](docs/management-api-troubleshooting.md)。

```bash
cd backend && npm install && npm run dev
```

环境变量参考：`backend/.env.example`、根目录 `.env.example`、`management/.env.example`。

## 后端健康检查（部署探针）

- **`GET /health`**：仅表示 Node 进程在跑，负载均衡可用来做最轻量存活检查。
- **`GET /health/ready`**：对数据库执行 `SELECT 1`；**数据库不可连时返回 HTTP 503**，适合作为 Kubernetes `readinessProbe` 或 Docker `HEALTHCHECK`，由编排器在失败时重启实例或摘流。全局速率限制已跳过上述路径。

Docker 示例：

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health/ready || exit 1
```

Kubernetes 示例：`readinessProbe.httpGet.path` 设为 `/health/ready`，`port` 与容器内后端监听端口一致（默认与 `PORT` 环境变量相同，常见为 3000）。

## API Key（`API_KEY` / `VITE_API_KEY`）

- **必须一致**：后端环境变量 `API_KEY` 与官网、管理端构建时的 `VITE_API_KEY` 须相同，否则带 `x-api-key` 的请求会返回 401。本地默认均为 `default-api-key`（见各目录 `.env.example`）。
- **浏览器可见**：官网与管理端会在请求头中发送 `x-api-key`。该值会进入前端打包产物，用户也可在开发者工具的网络面板中看到。因此它**不是**机密，不能用来保护「只能内网知道」的数据。
- **实际语义**：凡走 [管理类中间件](backend/src/middleware/managementAuthMiddleware.ts)、且仅用 API Key（无 JWT）即可访问的读接口（例如 `GET /api/site-assets`、分页列表等），在密钥泄露意义下等同于**对持有站点的人可读**。若业务需要真正的私密数据，应改为登录态（JWT）+ 角色控制，或把敏感接口放到不暴露给浏览器的 BFF/内网服务。
- **生产建议**：为防脚本滥用可换成足够长的随机密钥，并在部署流水线中**同时**更新后端 `API_KEY` 与前端构建参数 `VITE_API_KEY`；不要将真实生产密钥提交到仓库。

更细的 JSON 响应形态说明见 [docs/api-response-conventions.md](docs/api-response-conventions.md)。

## 目录

- `src/` — 官网
- `management/` — 管理端
- `backend/` — Express + Prisma
- `shared/` — 前后端共用 TS 模块（如错误溯源）
- `src/types/dto/` — 官网接口 DTO（与后端 JSON 对齐）+ `parse*Dto` / `mediaDisplaySrc`

**架构总览**（模块划分、数据流、接口分层、Mermaid 图）：[docs/project-overview.md](docs/project-overview.md)。

## 许可证

MIT
