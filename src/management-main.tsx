import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './assets/styles/index.css';
import ManagementLayout from '../management/src/pages/Layout/index';
import ProductManagement from '../management/src/pages/Product';
import ActivityManagement from '../management/src/pages/Activity';
import NewsManagement from '../management/src/pages/News';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagementLayout />}>
          <Route
            index
            element={
              <div className="dashboard">
                <h2>欢迎使用企业管理系统</h2>
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>产品数量</h3>
                    <p>0</p>
                  </div>
                  <div className="stat-card">
                    <h3>活动数量</h3>
                    <p>0</p>
                  </div>
                  <div className="stat-card">
                    <h3>新闻数量</h3>
                    <p>0</p>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="products" element={<ProductManagement />} />
          <Route path="activities" element={<ActivityManagement />} />
          <Route path="news" element={<NewsManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
