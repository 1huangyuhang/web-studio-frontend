import { useEffect, useRef, useState } from 'react';

// 共享IntersectionObserver实例管理器
class IntersectionObserverManager {
  private observer: IntersectionObserver | null = null;
  private elements: Map<Element, (isIntersecting: boolean) => void> = new Map();
  private options: IntersectionObserverInit;

  constructor(options: IntersectionObserverInit = {}) {
    this.options = options;
  }

  // 初始化Observer实例
  private initObserver() {
    if (!this.observer) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const callback = this.elements.get(entry.target);
          if (callback) {
            callback(entry.isIntersecting);
          }
        });
      }, this.options);
    }
  }

  // 添加元素到监听列表
  addElement(element: Element, callback: (isIntersecting: boolean) => void) {
    this.elements.set(element, callback);
    this.initObserver();
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  // 从监听列表移除元素
  removeElement(element: Element) {
    if (this.elements.has(element)) {
      this.elements.delete(element);
      if (this.observer) {
        this.observer.unobserve(element);
      }
      // 如果没有元素需要监听，销毁Observer实例
      if (this.elements.size === 0 && this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }
}

// 全局共享Observer实例
const globalObserverManager = new IntersectionObserverManager();

/**
 * 共享IntersectionObserver钩子
 * 用于监听元素是否进入视口，支持共享Observer实例
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] => {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const currentElement = ref.current;
    if (!currentElement) return;

    // 创建局部Observer管理器，使用自定义选项
    const localObserverManager =
      options.threshold !== undefined || options.rootMargin !== undefined
        ? new IntersectionObserverManager(options)
        : globalObserverManager;

    // 添加元素到监听列表
    localObserverManager.addElement(currentElement, (intersecting) => {
      setIsIntersecting(intersecting);
    });

    // 清理函数
    return () => {
      if (currentElement) {
        localObserverManager.removeElement(currentElement);
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isIntersecting];
};

export default useIntersectionObserver;
