# 管理端 CRUD 与官网展示联动（手工验收清单）

在 **后端已启动、数据库已 migrate + seed、管理端已登录（JWT）且 `VITE_API_KEY` 与后端 `API_KEY` 一致** 的前提下，逐项确认。

| 管理端页面           | 操作                              | 官网验证                               |
| -------------------- | --------------------------------- | -------------------------------------- |
| 商品 Products        | 新增/编辑/删除一条                | `/shop` 列表与筛选刷新后一致           |
| 活动 Activity        | 新增/编辑/删除一条                | `/activities` 刷新后一致               |
| 新闻 News            | 新增/编辑/删除一条                | `/company/news` 刷新后一致             |
| 课程 Courses         | 新增/编辑/删除一条                | `/courses` 刷新后一致                  |
| 价格方案 Pricing     | 新增/编辑/删除一条                | `/prices` 刷新后一致                   |
| 站点素材 Site assets | 维护 `page=home` / `page=case` 等 | 首页 `/`、`/company/case` 等刷新后一致 |

写入操作若返回 401，检查管理端 `authToken` 与 API Key；若返回 403，检查账号角色与 `MANAGEMENT_USER_READONLY`。
