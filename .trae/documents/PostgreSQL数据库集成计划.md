# PostgreSQL数据库集成计划

## 1. 后端服务设计

### 1.1 技术栈选择

- **Node.js** + **Express** + **TypeScript**：构建RESTful API
- **PostgreSQL**：关系型数据库
- **Prisma**：ORM工具，简化数据库操作
- **Docker**：容器化部署（可选）

### 1.2 项目结构

```
backend/
├── src/
│   ├── controllers/     # 控制器层，处理请求
│   ├── models/          # Prisma模型定义
│   ├── routes/          # 路由配置
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   └── app.ts           # 应用入口
├── .env                 # 环境变量配置
├── prisma/              # Prisma相关配置
│   └── schema.prisma    # 数据库模型定义
└── package.json         # 项目依赖
```

### 1.3 API接口设计

| 资源 | 方法 | 路径                | 功能描述     |
| ---- | ---- | ------------------- | ------------ |
| 产品 | GET  | /api/products       | 获取产品列表 |
| 产品 | GET  | /api/products/:id   | 获取单个产品 |
| 活动 | GET  | /api/activities     | 获取活动列表 |
| 活动 | GET  | /api/activities/:id | 获取单个活动 |
| 新闻 | GET  | /api/news           | 获取新闻列表 |
| 新闻 | GET  | /api/news/:id       | 获取单个新闻 |

## 2. 数据库设计

### 2.1 表结构设计

#### products表

| 字段名     | 数据类型      | 约束                      | 描述         |
| ---------- | ------------- | ------------------------- | ------------ |
| id         | SERIAL        | PRIMARY KEY               | 产品ID       |
| name       | VARCHAR(255)  | NOT NULL                  | 产品名称     |
| price      | DECIMAL(10,2) | NOT NULL                  | 产品价格     |
| category   | VARCHAR(100)  | NOT NULL                  | 产品分类     |
| image      | VARCHAR(255)  | NOT NULL                  | 产品图片路径 |
| is_new     | BOOLEAN       | DEFAULT false             | 是否新品     |
| created_at | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | 创建时间     |
| updated_at | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP | 更新时间     |

#### activities表

| 字段名      | 数据类型     | 约束                      | 描述         |
| ----------- | ------------ | ------------------------- | ------------ |
| id          | SERIAL       | PRIMARY KEY               | 活动ID       |
| title       | VARCHAR(255) | NOT NULL                  | 活动标题     |
| description | TEXT         | NOT NULL                  | 活动描述     |
| image       | VARCHAR(255) | NOT NULL                  | 活动图片路径 |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | 创建时间     |
| updated_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | 更新时间     |

#### news表

| 字段名     | 数据类型     | 约束                      | 描述         |
| ---------- | ------------ | ------------------------- | ------------ |
| id         | SERIAL       | PRIMARY KEY               | 新闻ID       |
| title      | VARCHAR(255) | NOT NULL                  | 新闻标题     |
| date       | DATE         | NOT NULL                  | 新闻日期     |
| time       | TIME         | NOT NULL                  | 新闻时间     |
| summary    | TEXT         | NOT NULL                  | 新闻摘要     |
| content    | TEXT         | NOT NULL                  | 新闻内容     |
| image      | VARCHAR(255) | NOT NULL                  | 新闻图片路径 |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | 创建时间     |
| updated_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | 更新时间     |

## 3. 前端修改

### 3.1 修改现有页面

- **Shop页面**：从API获取产品列表，替换静态数据
- **Activities页面**：从API获取活动列表，替换静态数据
- **News页面**：从API获取新闻列表，替换静态数据

### 3.2 数据获取逻辑

- 使用现有的axios实例发送请求
- 添加数据加载状态管理
- 实现错误处理机制
- 添加数据缓存策略（可选）

### 3.3 组件状态管理

- 使用React hooks（useState, useEffect）管理数据状态
- 添加加载指示器
- 处理空数据场景

## 4. 实现步骤

### 4.1 后端实现

1. 初始化Express + TypeScript项目
2. 配置Prisma和PostgreSQL连接
3. 定义数据库模型
4. 生成Prisma客户端
5. 实现业务逻辑层
6. 实现控制器和路由
7. 添加CORS配置
8. 测试API接口

### 4.2 数据库初始化

1. 创建PostgreSQL数据库
2. 使用Prisma迁移创建表结构
3. 插入初始数据

### 4.3 前端修改

1. 修改Shop页面，从API获取产品数据
2. 修改Activities页面，从API获取活动数据
3. 修改News页面，从API获取新闻数据
4. 添加加载状态和错误处理
5. 优化用户体验

### 4.4 测试与部署

1. 单元测试API接口
2. 集成测试前后端交互
3. 配置环境变量
4. 部署后端服务
5. 部署前端应用

## 5. 预期效果

- 页面刷新时，从PostgreSQL数据库加载最新数据
- 保持现有页面的所有功能和样式
- 提高页面加载速度和性能
- 支持数据的动态更新和管理
- 为后续功能扩展提供基础

## 6. 技术要点

- **数据库设计**：合理的表结构和索引设计
- **API设计**：RESTful风格，清晰的接口文档
- **前端优化**：异步数据加载，状态管理
- **安全性**：防止SQL注入，添加适当的认证机制
- **可维护性**：模块化设计，代码规范

## 7. 依赖安装

### 后端依赖

```bash
npm install express typescript prisma @prisma/client cors dotenv
npm install -D @types/express @types/node @types/cors ts-node-dev
```

### 前端依赖

```bash
npm install axios
```

## 8. 注意事项

- 确保PostgreSQL数据库服务已启动
- 配置正确的数据库连接字符串
- 考虑数据迁移和版本控制
- 实现适当的错误处理和日志记录
- 考虑生产环境的性能优化和监控

## 9. 后续扩展

- 添加用户认证和授权
- 实现数据分页和过滤
- 添加数据统计和分析功能
- 实现WebSocket实时数据更新
- 集成文件上传功能

这个计划将帮助我们实现从前端静态数据到PostgreSQL数据库动态数据的完整转换，为网站提供更强大的数据管理能力和更好的用户体验。
