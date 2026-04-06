import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/utils/prisma';
import { hashPassword } from '../../src/services/passwordService';

/**
 * 契约向回归：关键读接口形态稳定即可；需 DATABASE_URL 与 API_KEY（默认 default-api-key）。
 */
const apiKey = process.env.API_KEY || 'default-api-key';

const CONTRACT_LOGIN_EMAIL = 'contract-test-user@example.test';
const CONTRACT_LOGIN_USERNAME = 'contract_test_login';
const CONTRACT_LOGIN_PASSWORD = 'Contract_Tst_Login1!';

describe('Regression: HTTP contract', () => {
  beforeAll(async () => {
    const passwordHash = await hashPassword(CONTRACT_LOGIN_PASSWORD);
    await prisma.user.upsert({
      where: { email: CONTRACT_LOGIN_EMAIL },
      create: {
        email: CONTRACT_LOGIN_EMAIL,
        username: CONTRACT_LOGIN_USERNAME,
        passwordHash,
        role: 'USER',
      },
      update: {
        passwordHash,
        username: CONTRACT_LOGIN_USERNAME,
        role: 'USER',
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  test('GET /health/ready returns ok when database is reachable', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      checks: { database: 'ok' },
    });
  });

  test('GET /api/stats/summary returns { data } with counters', async () => {
    const res = await request(app)
      .get('/api/stats/summary')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    const d = res.body.data;
    expect(d).toHaveProperty('productCount');
    expect(d).toHaveProperty('activityCount');
    expect(d).toHaveProperty('newsCount');
    expect(d).toHaveProperty('siteAssetCount');
    expect(d).toHaveProperty('courseCount');
    expect(d).toHaveProperty('pricingPlanCount');
    expect(d).toHaveProperty('contactMessageCount');
    expect(d).toHaveProperty('supportTicketCount');
    expect(d).toHaveProperty('unreadContactMessageCount');
    expect(d).toHaveProperty('pendingSupportTicketCount');
    const isNumOrNull = (v: unknown) => v === null || typeof v === 'number';
    expect(isNumOrNull(d.unreadContactMessageCount)).toBe(true);
    expect(isNumOrNull(d.pendingSupportTicketCount)).toBe(true);
    expect(typeof res.body.meta.degraded).toBe('boolean');
  });

  test('GET /api/products returns paginated list', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ page: 1, pageSize: 5 })
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      pageSize: 5,
    });
    expect(typeof res.body.pagination.total).toBe('number');
  });

  test('GET /api/categories returns { data } list', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const row = res.body.data[0];
      expect(row).toHaveProperty('id');
      expect(row).toHaveProperty('slug');
      expect(row).toHaveProperty('name');
    }
  });

  test('GET /api/products item shape includes categoryId when list non-empty', async () => {
    const res = await request(app)
      .get('/api/products')
      .query({ page: 1, pageSize: 1 })
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    if (res.body.data.length > 0) {
      const p = res.body.data[0];
      expect(p).toHaveProperty('categoryId');
      expect(p).toHaveProperty('category');
      expect(p).toHaveProperty('image');
      expect(p).toHaveProperty('imageUrl');
    }
  });

  test('GET /api/site-assets?page=home returns { data } array (with API key)', async () => {
    const res = await request(app)
      .get('/api/site-assets')
      .query({ page: 'home' })
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const row = res.body.data[0];
      expect(row).toHaveProperty('id');
      expect(row).toHaveProperty('page');
      expect(row).toHaveProperty('groupKey');
    }
  });

  test('GET /api/site-assets?omitImage=1 returns list rows without large base64 blobs', async () => {
    const res = await request(app)
      .get('/api/site-assets')
      .query({ omitImage: '1' })
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    for (const row of res.body.data as { image?: string | null }[]) {
      expect(row.image == null || row.image === '').toBe(true);
    }
  });

  test('GET /api/site-assets without API key returns 401', async () => {
    const res = await request(app)
      .get('/api/site-assets')
      .query({ page: 'home' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      code: 'AUTH_REQUIRED',
    });
  });

  test('POST /api/contact-messages creates row (201 + id + message)', async () => {
    const res = await request(app).post('/api/contact-messages').send({
      name: 'Contract Test',
      phone: '13800138000',
      email: 'contract-msg@example.test',
      message: '契约测试留言',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('number');
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });

  test('POST /api/contact-messages invalid body returns 400', async () => {
    const res = await request(app)
      .post('/api/contact-messages')
      .send({ message: 'only message' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('POST /api/auth/login wrong password returns 401 with message', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: CONTRACT_LOGIN_USERNAME,
      password: 'Definitely_Wrong_Password_9!',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
    expect(typeof res.body.message).toBe('string');
  });

  test('POST /api/auth/login success returns token and user shape', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: CONTRACT_LOGIN_USERNAME,
      password: CONTRACT_LOGIN_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      email: CONTRACT_LOGIN_EMAIL,
      username: CONTRACT_LOGIN_USERNAME,
      role: 'USER',
    });
    expect(res.body.user).toHaveProperty('id');
  });
});
