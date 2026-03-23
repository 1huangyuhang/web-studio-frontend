import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // 使用相对路径，通过vite proxy代理到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加API密钥认证，默认值与后端一致
    const apiKey = import.meta.env.VITE_API_KEY || 'default-api-key';
    config.headers['x-api-key'] = apiKey;

    // 添加JWT认证
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 处理HTTP错误
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 禁止访问
          console.error('Forbidden:', data.message || '您没有权限访问该资源');
          break;
        case 404:
          // 资源不存在
          console.error('Not Found:', data.message || '请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('Server Error:', data.message || '服务器内部错误');
          break;
        default:
          console.error(
            'Error:',
            data.message || `请求失败，状态码：${status}`
          );
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('Network Error:', '无法连接到服务器，请检查网络');
    } else {
      // 请求配置错误
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
