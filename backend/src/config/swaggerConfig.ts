import swaggerJSDoc from 'swagger-jsdoc';

// Swagger配置选项
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '企业管理系统API',
      description: '企业管理系统的RESTful API文档',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发环境',
      },
    ],
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API密钥认证',
        },
      },
      schemas: {
        // 产品模式
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '产品ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: '产品名称',
              example: '产品名称',
            },
            price: {
              type: 'number',
              description: '产品价格',
              example: 100.0,
            },
            category: {
              type: 'string',
              description: '产品分类',
              example: '家具',
            },
            image: {
              type: 'string',
              description: '产品图片URL',
              example: 'https://example.com/image.jpg',
            },
            isNew: {
              type: 'boolean',
              description: '是否新品',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2024-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2024-01-01T00:00:00Z',
            },
          },
          required: ['name', 'price', 'category'],
        },
        // 活动模式
        Activity: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '活动ID',
              example: 1,
            },
            title: {
              type: 'string',
              description: '活动标题',
              example: '活动标题',
            },
            description: {
              type: 'string',
              description: '活动描述',
              example: '活动描述内容',
            },
            image: {
              type: 'string',
              description: '活动图片URL',
              example: 'https://example.com/image.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2024-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2024-01-01T00:00:00Z',
            },
          },
          required: ['title', 'description'],
        },
        // 新闻模式
        News: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '新闻ID',
              example: 1,
            },
            title: {
              type: 'string',
              description: '新闻标题',
              example: '新闻标题',
            },
            content: {
              type: 'string',
              description: '新闻内容',
              example: '新闻内容',
            },
            summary: {
              type: 'string',
              description: '新闻摘要',
              example: '新闻摘要',
            },
            date: {
              type: 'string',
              format: 'date',
              description: '新闻日期',
              example: '2024-01-01',
            },
            time: {
              type: 'string',
              description: '新闻时间',
              example: '10:00',
            },
            image: {
              type: 'string',
              description: '新闻图片URL',
              example: 'https://example.com/image.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2024-01-01T00:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2024-01-01T00:00:00Z',
            },
          },
          required: ['title', 'content', 'summary', 'date', 'time'],
        },
      },
    },
  },
  // 指定API路由文件的路径
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

// 生成Swagger规范
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
