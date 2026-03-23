import { io, Socket } from 'socket.io-client';

// WebSocket事件类型定义
export type WebSocketEvent = {
  'product:created': any;
  'product:updated': any;
  'product:deleted': number;
  'activity:created': any;
  'activity:updated': any;
  'activity:deleted': number;
  'news:created': any;
  'news:updated': any;
  'news:deleted': number;
};

class WebSocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<keyof WebSocketEvent, ((data: any) => void)[]> =
    new Map();

  constructor() {
    this.init();
  }

  // 初始化WebSocket连接
  private init() {
    // 根据当前环境获取WebSocket服务器地址
    let wsUrl =
      import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws') ||
      'ws://localhost:3000';

    // 移除URL中的/api路径，Socket.IO服务器运行在根路径
    wsUrl = wsUrl.replace('/api', '');

    this.socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket连接成功');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket连接断开');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error);
    });

    // 监听所有可能的数据变更事件
    this.setupEventListeners();
  }

  // 设置事件监听器
  private setupEventListeners() {
    if (!this.socket) return;

    // 产品相关事件
    this.socket.on('product:created', (data) => {
      this.notifyHandlers('product:created', data);
    });

    this.socket.on('product:updated', (data) => {
      this.notifyHandlers('product:updated', data);
    });

    this.socket.on('product:deleted', (id) => {
      this.notifyHandlers('product:deleted', id);
    });

    // 活动相关事件
    this.socket.on('activity:created', (data) => {
      this.notifyHandlers('activity:created', data);
    });

    this.socket.on('activity:updated', (data) => {
      this.notifyHandlers('activity:updated', data);
    });

    this.socket.on('activity:deleted', (id) => {
      this.notifyHandlers('activity:deleted', id);
    });

    // 新闻相关事件
    this.socket.on('news:created', (data) => {
      this.notifyHandlers('news:created', data);
    });

    this.socket.on('news:updated', (data) => {
      this.notifyHandlers('news:updated', data);
    });

    this.socket.on('news:deleted', (id) => {
      this.notifyHandlers('news:deleted', id);
    });
  }

  // 注册事件处理器
  on<K extends keyof WebSocketEvent>(
    event: K,
    handler: (data: WebSocketEvent[K]) => void
  ) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  // 移除事件处理器
  off<K extends keyof WebSocketEvent>(
    event: K,
    handler: (data: WebSocketEvent[K]) => void
  ) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers
        .get(event)
        ?.filter((h) => h !== handler);
      if (handlers?.length) {
        this.eventHandlers.set(event, handlers);
      } else {
        this.eventHandlers.delete(event);
      }
    }
  }

  // 通知所有事件处理器
  private notifyHandlers<K extends keyof WebSocketEvent>(
    event: K,
    data: WebSocketEvent[K]
  ) {
    this.eventHandlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`处理WebSocket事件${event}时出错:`, error);
      }
    });
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventHandlers.clear();
    }
  }

  // 重新连接
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.init();
    }
  }
}

// 导出单例实例
const wsService = new WebSocketService();
export default wsService;
