// 统一管理红木图片，简化导入

// 先导入所有图片
import redwood1 from './红木.jpg';
import redwoodDetail1 from './红木材料细节.jpg';
import redwoodDetail2 from './红木材料细节2.jpg';
import redwoodDetail3 from './红木材料细节3.jpg';
import redwoodDetail4 from './红木材料细节4.jpg';
import redwoodDetail5 from './红木材料细节5.jpg';
import redwoodScenery from './红木风景.jpg';
import redwoodFactory from './红木工厂.jpg';
import redwoodRaw1 from './红木原材料.jpg';
import redwoodRaw2 from './红木原材料2.jpg';
import redwoodRaw3 from './红木原材料3.jpg';
import redwoodRaw4 from './红木原材料4.jpg';

// 再导出单个图片
export {
  redwood1,
  redwoodDetail1,
  redwoodDetail2,
  redwoodDetail3,
  redwoodDetail4,
  redwoodDetail5,
  redwoodScenery,
  redwoodFactory,
  redwoodRaw1,
  redwoodRaw2,
  redwoodRaw3,
  redwoodRaw4,
};

// 导出所有图片的对象，方便直接使用
export const redwoodImages = {
  redwood1,
  redwoodDetail1,
  redwoodDetail2,
  redwoodDetail3,
  redwoodDetail4,
  redwoodDetail5,
  redwoodScenery,
  redwoodFactory,
  redwoodRaw1,
  redwoodRaw2,
  redwoodRaw3,
  redwoodRaw4,
};

// 导出所有图片的数组，方便动态使用
export const allRedwoodImages = [
  { id: 1, title: '红木', src: redwood1 },
  { id: 2, title: '红木材料细节', src: redwoodDetail1 },
  { id: 3, title: '红木材料细节2', src: redwoodDetail2 },
  { id: 4, title: '红木材料细节3', src: redwoodDetail3 },
  { id: 5, title: '红木材料细节4', src: redwoodDetail4 },
  { id: 6, title: '红木材料细节5', src: redwoodDetail5 },
  { id: 7, title: '红木风景', src: redwoodScenery },
  { id: 8, title: '红木工厂', src: redwoodFactory },
  { id: 9, title: '红木原材料', src: redwoodRaw1 },
  { id: 10, title: '红木原材料2', src: redwoodRaw2 },
  { id: 11, title: '红木原材料3', src: redwoodRaw3 },
  { id: 12, title: '红木原材料4', src: redwoodRaw4 },
];

// 导出随机获取图片的函数
export const getRandomRedwoodImage = () => {
  const randomIndex = Math.floor(Math.random() * allRedwoodImages.length);
  return allRedwoodImages[randomIndex];
};

// 导出按类型分组的图片
export const redwoodImagesByType = {
  rawMaterials: [redwoodRaw1, redwoodRaw2, redwoodRaw3, redwoodRaw4],
  details: [
    redwoodDetail1,
    redwoodDetail2,
    redwoodDetail3,
    redwoodDetail4,
    redwoodDetail5,
  ],
  factory: [redwoodFactory],
  scenery: [redwoodScenery],
  finished: [redwood1],
};

// 导出便捷的图片组件类型
export type ImageItem = (typeof allRedwoodImages)[0];

// 导出默认的图片导入，最便捷的使用方式
export default {
  ...redwoodImages,
  allRedwoodImages,
  getRandomRedwoodImage,
  redwoodImagesByType,
};
