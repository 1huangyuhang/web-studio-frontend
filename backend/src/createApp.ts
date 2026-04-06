import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import {
  productPublicRouter,
  productManagementRouter,
} from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import {
  activityPublicRouter,
  activityManagementRouter,
} from './routes/activityRoutes';
import { newsPublicRouter, newsManagementRouter } from './routes/newsRoutes';
import authRoutes from './routes/authRoutes';
import statsRoutes from './routes/statsRoutes';
import {
  contactMessagePublicRouter,
  contactMessageManagementRouter,
} from './routes/contactMessageRoutes';
import {
  supportTicketPublicRouter,
  supportTicketManagementRouter,
} from './routes/supportTicketRoutes';
import {
  coursePublicRouter,
  courseManagementRouter,
} from './routes/courseRoutes';
import {
  pricingPlanPublicRouter,
  pricingPlanManagementRouter,
} from './routes/pricingPlanRoutes';
import {
  siteAssetPublicRouter,
  siteAssetManagementRouter,
} from './routes/siteAssetRoutes';
import errorHandler from './middleware/errorHandler';
import { requestContextMiddleware } from './middleware/requestContextMiddleware';
import { globalRateLimitMiddleware } from './middleware/rateLimitMiddleware';
import { managementAuthMiddleware } from './middleware/managementAuthMiddleware';
import { adminUserReadOnlyMiddleware } from './middleware/adminUserReadOnlyMiddleware';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';
import { setSocketServer } from './socketInstance';
import prisma from './utils/prisma';

const managementStack: express.RequestHandler[] = [
  managementAuthMiddleware,
  adminUserReadOnlyMiddleware,
];

export function createApp(): {
  app: express.Application;
  httpServer: ReturnType<typeof createServer>;
  io: Server;
} {
  const app = express();
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3100',
        'http://localhost:5173',
        'http://localhost:5180',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3100',
        'http://127.0.0.1:5180',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestContextMiddleware);

  app.use(globalRateLimitMiddleware);

  app.use('/api/auth', authRoutes);
  app.use('/api/stats', ...managementStack, statsRoutes);
  /** 仅 GET 列表，供官网匿名浏览 */
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productPublicRouter);
  app.use('/api/products', ...managementStack, productManagementRouter);
  app.use('/api/activities', activityPublicRouter);
  app.use('/api/activities', ...managementStack, activityManagementRouter);
  app.use('/api/news', newsPublicRouter);
  app.use('/api/news', ...managementStack, newsManagementRouter);
  app.use('/api/contact-messages', contactMessagePublicRouter);
  app.use(
    '/api/contact-messages',
    ...managementStack,
    contactMessageManagementRouter
  );
  app.use('/api/support-tickets', supportTicketPublicRouter);
  app.use(
    '/api/support-tickets',
    ...managementStack,
    supportTicketManagementRouter
  );
  app.use('/api/courses', coursePublicRouter);
  app.use('/api/courses', ...managementStack, courseManagementRouter);
  app.use('/api/pricing-plans', pricingPlanPublicRouter);
  app.use(
    '/api/pricing-plans',
    ...managementStack,
    pricingPlanManagementRouter
  );
  app.use('/api/site-assets', siteAssetPublicRouter);
  app.use('/api/site-assets', ...managementStack, siteAssetManagementRouter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  /** 就绪探针：含数据库连通性，供 Docker/K8s 重启决策（失败返回 503） */
  app.get('/health/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'ok',
        checks: { database: 'ok' as const },
      });
    } catch {
      res.status(503).json({
        status: 'unavailable',
        checks: { database: 'fail' as const },
      });
    }
  });

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

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  app.use(errorHandler);

  setSocketServer(io);

  return { app, httpServer, io };
}
