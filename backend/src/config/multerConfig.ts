import multer from 'multer';

// 配置 multer 用于文件上传
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制文件大小为 5MB
});

// 导出 upload 实例，供路由使用
export { upload };
