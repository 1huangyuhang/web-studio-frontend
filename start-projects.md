# 项目自动化运行与浏览器打开功能配置

## 1. 项目信息及启动命令

| 项目名称 | 项目目录 | 启动命令 | 默认端口 | 服务说明 |
|---------|---------|---------|---------|---------|
| 前端主应用 | `/前端` | `npm run dev` | 5173 | 主网站应用 |
| 前端管理应用 | `/前端` | `npm run dev:management` | 5174 | 管理后台应用 |
| 后端服务 | `/前端/backend` | `npm run dev` | 3001 | API服务 |
| Prisma Studio | `/前端/backend` | `npx prisma studio` | 5555 | 数据库可视化工具 |

## 2. 启动顺序要求

1. **后端服务**：优先启动，因为前端应用依赖于后端API
2. **前端应用**：在后端服务启动后启动（前端主应用和管理应用可以并行启动）
3. **Prisma Studio**：可以与其他服务并行启动
4. **浏览器打开**：在所有服务启动后打开

## 3. 需要打开的URL地址

| 服务名称 | URL地址 | 说明 |
|---------|---------|------|
| 前端主应用 | `http://localhost:5175/` | 主网站访问地址 |
| 前端管理应用 | `http://localhost:5174/` | 管理后台访问地址 |
| 后端API文档 | `http://localhost:3001/api-docs` | Swagger API文档 |
| Prisma Studio | `http://localhost:5555/` | 数据库可视化管理 |

## 4. 单一指令启动方案

### 4.1 修改现有的`start:all`脚本

我们将修改现有的`start:all`脚本，确保它能够：
1. 正确处理服务启动顺序
2. 在Trae浏览器中打开指定页面
3. 提供良好的启动状态反馈
4. 包含错误处理机制

### 4.2 更新后的启动脚本

```json
"start:all": "concurrently --names 'backend,main,management,prisma' --prefix-colors 'blue,green,yellow,red' --kill-others-on-fail --prefix '[{name}]' --timestamp-format 'HH:mm:ss' 'cd backend && npm run dev' 'npm run dev' 'npm run dev:management' 'cd backend && npx prisma studio' --success-condition 'all'"
```

### 4.3 浏览器自动打开脚本

创建一个独立的浏览器打开脚本，在所有服务启动后执行：

```bash
#!/bin/bash

# 等待服务启动
sleep 3

# 在Trae浏览器中打开指定页面
trae http://localhost:5175/ http://localhost:5174/ http://localhost:3001/api-docs http://localhost:5555/
```

将此脚本保存为`open-browser.sh`，并添加执行权限：

```bash
chmod +x open-browser.sh
```

### 4.4 最终的完整启动脚本

```json
"start:all": "concurrently --names 'backend,main,management,prisma,browser' --prefix-colors 'blue,green,yellow,red,purple' --kill-others-on-fail --prefix '[{name}]' --timestamp-format 'HH:mm:ss' 'cd backend && npm run dev' 'npm run dev' 'npm run dev:management' 'cd backend && npx prisma studio' './open-browser.sh' --success-condition 'all'"
```

## 5. 启动状态反馈和错误处理

### 5.1 状态反馈

- 使用`concurrently`的`--prefix`选项，显示服务名称和时间戳
- 使用`--prefix-colors`选项，为不同服务分配不同颜色，便于区分
- 使用`--names`选项，为每个服务指定一个易于识别的名称

### 5.2 错误处理

- 使用`--kill-others-on-fail`选项，当任何一个服务失败时，终止所有其他服务
- 使用`--success-condition 'all'`选项，只有当所有服务成功启动时，整个脚本才会成功退出
- 后端服务的启动命令中包含了`2>&1 | grep -v '\[0xc'`，用于过滤掉Prisma查询引擎的Go指针日志，使日志更加清晰

## 6. 执行方式

### 6.1 启动所有服务

```bash
npm run start:all
```

### 6.2 单独启动某个服务

```bash
# 启动后端服务
cd backend && npm run dev

# 启动前端主应用
npm run dev

# 启动前端管理应用
npm run dev:management

# 启动Prisma Studio
cd backend && npx prisma studio
```

## 7. 注意事项

1. 确保所有依赖都已安装：
   ```bash
   npm install
   cd backend && npm install
   ```

2. 确保端口没有被占用：
   - 后端服务：3001
   - 前端主应用：5173
   - 前端管理应用：5174
   - Prisma Studio：5555

3. 如果端口被占用，可以修改服务的配置文件来更改端口：
   - 后端服务：修改`backend/.env`文件中的`PORT`变量
   - 前端应用：修改`vite.config.ts`文件中的`server.port`配置
   - Prisma Studio：使用`--port`选项指定端口

4. 浏览器打开脚本需要根据Trae浏览器的实际命令进行调整，确保能够在Trae浏览器中打开页面

5. 可以根据实际需要调整`sleep`命令的等待时间，确保所有服务都已经完全启动

## 8. 监控和日志

- 所有服务的日志都会显示在同一终端中，使用不同的颜色和名称进行区分
- 可以使用`concurrently`的`--output`选项来调整日志输出格式
- 可以将日志重定向到文件，便于后续分析：
  ```bash
  npm run start:all > start.log 2>&1
  ```

通过以上配置，我们可以使用单一指令`npm run start:all`来启动所有项目，并自动在Trae浏览器中打开指定页面，同时提供良好的启动状态反馈和错误处理机制。