import request from 'supertest';
import app from '../src/app';

// 测试产品API
describe('Product API', () => {
  let createdProductId: number;
  const apiKey = 'default-api-key';

  // 测试获取所有产品
  test('GET /api/products should return all products', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('x-api-key', apiKey);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBeTruthy();
  });

  // 测试创建产品
  test('POST /api/products should create a new product', async () => {
    const productData = {
      name: 'Test Product',
      price: 99.99,
      category: 'Test Category',
      image: 'https://example.com/test.jpg',
      isNew: true,
    };

    const response = await request(app)
      .post('/api/products')
      .set('x-api-key', apiKey)
      .send(productData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(productData.name);
    expect(response.body.price).toBe(productData.price);
    expect(response.body.category).toBe(productData.category);

    // 保存创建的产品ID，用于后续测试
    createdProductId = response.body.id;
  });

  // 测试获取单个产品
  test('GET /api/products/:id should return a single product', async () => {
    const response = await request(app)
      .get(`/api/products/${createdProductId}`)
      .set('x-api-key', apiKey);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdProductId);
  });

  // 测试更新产品
  test('PUT /api/products/:id should update a product', async () => {
    const updateData = {
      name: 'Updated Test Product',
      price: 149.99,
    };

    const response = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('x-api-key', apiKey)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updateData.name);
    expect(response.body.price).toBe(updateData.price);
  });

  // 测试删除产品
  test('DELETE /api/products/:id should delete a product', async () => {
    const response = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('x-api-key', apiKey);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'Product deleted successfully'
    );

    // 验证产品已被删除
    const getResponse = await request(app)
      .get(`/api/products/${createdProductId}`)
      .set('x-api-key', apiKey);

    expect(getResponse.status).toBe(404);
  });

  // 测试无效的API密钥
  test('GET /api/products with invalid api key should return 401', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('x-api-key', 'invalid-api-key');

    expect(response.status).toBe(401);
  });

  // 测试验证错误
  test('POST /api/products with invalid data should return validation error', async () => {
    const invalidData = {
      name: '', // 产品名称不能为空
      price: -10, // 价格必须大于0
      category: '', // 分类不能为空
    };

    const response = await request(app)
      .post('/api/products')
      .set('x-api-key', apiKey)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Validation Error');
    expect(response.body).toHaveProperty('errors');
  });
});
