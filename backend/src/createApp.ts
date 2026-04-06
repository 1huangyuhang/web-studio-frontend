import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import activityRoutes from './routes/activityRoutes';
import newsRoutes from './routes/newsRoutes';
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
import courseRoutes from './routes/courseRoutes';
import pricingPlanRoutes from './routes/pricingPlanRoutes';
import siteAssetRoutes from './routes/siteAssetRoutes';
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
  app.use('/api/categories', ...managementStack, categoryRoutes);
  app.use('/api/products', ...managementStack, productRoutes);
  app.use('/api/activities', ...managementStack, activityRoutes);
  app.use('/api/news', ...managementStack, newsRoutes);
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
  app.use('/api/courses', ...managementStack, courseRoutes);
  app.use('/api/pricing-plans', ...managementStack, pricingPlanRoutes);
  app.use('/api/site-assets', ...managementStack, siteAssetRoutes);

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
