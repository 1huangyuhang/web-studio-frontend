import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance';
import wsService from '../services/websocket';
import './index.less';

// 数据统计类型定义
interface StatsData {
  productCount: number;
  activityCount: number;
  newsCount: number;
}

const Dashboard: React.FC = () => {
  // 状态管理
  const [stats, setStats] = useState<StatsData>({
    productCount: 0,
    activityCount: 0,
    newsCount: 0,
  });

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      // 获取产品数量
      const productsResponse = await axiosInstance.get('/products', {
        params: {
          page: 1,
          pageSize: 1, // 只需要获取总数，不需要完整数据
        },
      });

      // 延迟500ms，避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 获取活动数量
      const activitiesResponse = await axiosInstance.get('/activities', {
        params: {
          page: 1,
          pageSize: 1, // 只需要获取总数，不需要完整数据
        },
      });

      // 延迟500ms，避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 获取新闻数量
      const newsResponse = await axiosInstance.get('/news', {
        params: {
          page: 1,
          pageSize: 1, // 只需要获取总数，不需要完整数据
        },
      });

      // 解析响应数据，处理分页格式
      const parseResponse = (response: any): number => {
        if (Array.isArray(response)) {
          // 直接返回数组长度
          return response.length;
        } else if (response?.data && Array.isArray(response.data)) {
          // 如果返回的是分页格式 { data: [...], pagination: {...} }，返回data数组长度
          return response.data.length;
        } else {
          // 如果响应格式不符合预期，返回0
          return 0;
        }
      };

      // 更新统计数据
      const newStats = {
        productCount: parseResponse(productsResponse),
        activityCount: parseResponse(activitiesResponse),
        newsCount: parseResponse(newsResponse),
      };

      setStats(newStats);

      console.log('数据加载成功:', newStats);

      // 验证数据准确性，与实际获取的完整数据进行对比
      validateStats(newStats);
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  }, []);

  // 数据验证函数，确保显示数值与实际数量完全匹配
  const validateStats = async (currentStats: StatsData) => {
    try {
      // 获取完整数据进行验证
      const fullProductsResponse = await axiosInstance.get('/products');
      const fullActivitiesResponse = await axiosInstance.get('/activities');
      const fullNewsResponse = await axiosInstance.get('/news');

      // 计算实际数量
      const actualProductCount = Array.isArray(fullProductsResponse)
        ? fullProductsResponse.length
        : fullProductsResponse?.data && Array.isArray(fullProductsResponse.data)
          ? fullProductsResponse.data.length
          : 0;

      const actualActivityCount = Array.isArray(fullActivitiesResponse)
        ? fullActivitiesResponse.length
        : fullActivitiesResponse?.data &&
            Array.isArray(fullActivitiesResponse.data)
          ? fullActivitiesResponse.data.length
          : 0;

      const actualNewsCount = Array.isArray(fullNewsResponse)
        ? fullNewsResponse.length
        : fullNewsResponse?.data && Array.isArray(fullNewsResponse.data)
          ? fullNewsResponse.data.length
          : 0;

      // 验证数据是否匹配
      const isProductCountMatch =
        currentStats.productCount === actualProductCount;
      const isActivityCountMatch =
        currentStats.activityCount === actualActivityCount;
      const isNewsCountMatch = currentStats.newsCount === actualNewsCount;

      console.log('数据验证结果:', {
        isProductCountMatch,
        isActivityCountMatch,
        isNewsCountMatch,
        actualProductCount,
        actualActivityCount,
        actualNewsCount,
      });

      // 如果数据不匹配，更新统计数据
      if (!isProductCountMatch || !isActivityCountMatch || !isNewsCountMatch) {
        console.log('数据不匹配，更新统计数据');
        setStats({
          productCount: actualProductCount,
          activityCount: actualActivityCount,
          newsCount: actualNewsCount,
        });
      }
    } catch (error) {
      console.error('数据验证失败:', error);
    }
  };

  // WebSocket事件处理
  useEffect(() => {
    // 产品数据变化事件
    const handleProductChange = () => {
      console.log('收到产品数据变化通知，更新统计数据');
      fetchStats();
    };

    // 活动数据变化事件
    const handleActivityChange = () => {
      console.log('收到活动数据变化通知，更新统计数据');
      fetchStats();
    };

    // 新闻数据变化事件
    const handleNewsChange = () => {
      console.log('收到新闻数据变化通知，更新统计数据');
      fetchStats();
    };

    // 注册WebSocket事件监听器
    wsService.on('product:created', handleProductChange);
    wsService.on('product:updated', handleProductChange);
    wsService.on('product:deleted', handleProductChange);

    wsService.on('activity:created', handleActivityChange);
    wsService.on('activity:updated', handleActivityChange);
    wsService.on('activity:deleted', handleActivityChange);

    wsService.on('news:created', handleNewsChange);
    wsService.on('news:updated', handleNewsChange);
    wsService.on('news:deleted', handleNewsChange);

    // 组件卸载时移除事件监听器
    return () => {
      wsService.off('product:created', handleProductChange);
      wsService.off('product:updated', handleProductChange);
      wsService.off('product:deleted', handleProductChange);

      wsService.off('activity:created', handleActivityChange);
      wsService.off('activity:updated', handleActivityChange);
      wsService.off('activity:deleted', handleActivityChange);

      wsService.off('news:created', handleNewsChange);
      wsService.off('news:updated', handleNewsChange);
      wsService.off('news:deleted', handleNewsChange);
    };
  }, [fetchStats]);

  // 初始化加载数据
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>欢迎使用企业管理系统</h2>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>产品数量</h3>
          <p>{stats.productCount}</p>
        </div>
        <div className="stat-card">
          <h3>活动数量</h3>
          <p>{stats.activityCount}</p>
        </div>
        <div className="stat-card">
          <h3>新闻数量</h3>
          <p>{stats.newsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
