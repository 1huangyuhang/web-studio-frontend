# HTTP JSON 响应约定（现状与可选统一方案）

本文档描述当前后端返回体的几种形态，以及若将来要统一信封（envelope）时的推荐做法。**不要求一次性改造**：新接口可逐步对齐，旧接口可在大版本升级时合并。

## 当前形态

### 1. 登录成功（`/api/auth/login`）

- **HTTP**：200
- **Body**：`{ token: string, user: { id, email, username, role } }`
- **说明**：无 `success` 字段；与官网 [AuthSuccessResponse](../src/types/auth.ts) 一致。若改为 `apiSuccess` 包一层，需同步修改前台登录页与所有存 token 的逻辑。

### 2. 注册成功（`/api/auth/register`）

- **HTTP**：201
- **Body**：`{ success: true, message: string, data: { token, user } }`（[apiResponse.ts](../backend/src/types/apiResponse.ts) 的 `apiSuccess`）

### 3. 多数资源 CRUD / 列表

- **Body**：`{ data: T }` 或带 `pagination` 的对象；一般无顶层 `success`。
- **示例**：[siteAssetController](../backend/src/controllers/siteAssetController.ts) `GET /` → `{ data: SiteAsset[] }`。查询参数 `omitImage=1`（或 `true`）时列表不读取/返回 BYTEA 转 Base64，仅含 `imageUrl` 等字段，供管理端列表；详情与前台全量拉取仍用默认 `GET /`。

### 4. 全局错误（经 [errorHandler](../backend/src/middleware/errorHandler.ts)）

- **Body**：`error`, `message`, `statusCode`, `path`, `requestId`, `errorRef`, 可选 `code`、`errors`（校验字段）
- **说明**：便于与 [wrapAxiosError](../shared/errorTracing/wrapAxiosError.ts) 对齐 `message` / `code` / `errorRef`。

### 5. 部分控制器内直接返回的错误（如登录失败）

- **Body**：常含 `error` 与 `message`，**不一定**含 `requestId` / `errorRef`。
- **说明**：前台已通过 `message` 展示；若需全链路对账，可逐步改为抛出 `HttpError` 或统一 helper，让错误仍走 `errorHandler`。

## 可选统一方案（后续迭代）

任选其一即可，需评估破坏性：

1. **成功信封**：约定 2xx 一律 `{ success: true, data: T, message?: string }`；登录改为迁入 `data: { token, user }` 或保留特例并在网关文档中标注。
2. **错误信封**：业务层不直接 `res.status().json()`，统一 `next(new HttpError(...))` 或 `next(zodError)`，由 `errorHandler` 输出完整字段。
3. **仅文档化**：在 OpenAPI / Swagger 中按路由标注实际形状，前端按路径使用窄类型，不强制后端改历史接口。

契约回归可参考 [contract.test.ts](../backend/__tests__/regression/contract.test.ts)，新增接口时建议补充对应断言。
