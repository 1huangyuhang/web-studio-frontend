import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import productRoutes from './routes/productRoutes';
import activityRoutes from './routes/activityRoutes';
import newsRoutes from './routes/newsRoutes';
import errorHandler from './middleware/errorHandler';
import { apiKeyMiddleware } from './middleware/authMiddleware';
import { globalRateLimitMiddleware } from './middleware/rateLimitMiddleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';

// 加载环境变量
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env['PORT'] || 3001;

// 配置Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 应用全局速率限制中间件
app.use(globalRateLimitMiddleware);

// 暂时注释掉API速率限制中间件，以便测试
// app.use(apiRateLimitMiddleware);

// 注册路由
// 为API路由添加API密钥认证
app.use('/api/products', apiKeyMiddleware, productRoutes);
app.use('/api/activities', apiKeyMiddleware, activityRoutes);
app.use('/api/news', apiKeyMiddleware, newsRoutes);

// 健康检查路由
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Swagger UI路由
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  })
);

// Socket.IO事件处理
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // 监听客户端断开连接
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 注册全局错误处理中间件
app.use(errorHandler);

// 导出Socket.IO实例，供控制器使用
export { io };

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
