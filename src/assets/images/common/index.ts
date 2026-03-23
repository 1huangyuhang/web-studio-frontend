// 统一管理通用图片

// 先导入logo图片作为本地变量
import logo from './logo.jpg';

// 然后导出logo图片作为命名导出
export { logo };

// 导出所有通用图片
export const commonImages = {
  logo,
};

export default commonImages;
