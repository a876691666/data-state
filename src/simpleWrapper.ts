import { DataSystemFactory } from './index';
import { SSEAdapter, WebSocketAdapter, RestAdapter, MockAdapter } from './adapters';
import type { DataItem } from './types';

/**
 * 简化的数据系统包装器
 * 提供更直观的API，隐藏复杂的内部实现
 */
export class SimpleDataSystem {
  private system: ReturnType<typeof DataSystemFactory.create>;
  private isInitialized = false;

  constructor() {
    this.system = DataSystemFactory.create();
  }

  /**
   * 快速连接到数据源
   * @param url 数据源URL
   * @param type 连接类型，默认自动检测
   */
  async connect(url: string, type?: 'sse' | 'websocket' | 'rest' | 'mock'): Promise<void> {
    // 自动检测连接类型
    if (!type) {
      if (url.includes('ws://') || url.includes('wss://')) {
        type = 'websocket';
      } else if (url.includes('/events') || url.includes('stream')) {
        type = 'sse';
      } else {
        type = 'rest';
      }
    }

    // 创建对应的适配器实例
    let adapter;
    const adapterName = `auto-${type}`;
    
    switch (type) {
      case 'sse':
        adapter = new SSEAdapter(adapterName, url, {});
        break;
      case 'websocket':
        adapter = new WebSocketAdapter(adapterName, url, {});
        break;
      case 'rest':
        adapter = new RestAdapter(adapterName, url, {});
        break;
      case 'mock':
        adapter = new MockAdapter(adapterName, { interval: 1000 });
        break;
      default:
        throw new Error(`Unsupported adapter type: ${type}`);
    }

    this.system.dataAdapterLayer.addAdapter(adapter);
    await this.system.dataAdapterLayer.connectAdapter(adapterName);
    this.isInitialized = true;
  }

  /**
   * 监听数据变化
   * @param callback 数据变化回调
   * @returns 取消监听的函数
   */
  onData(callback: (data: any) => void): () => void {
    return this.system.listener.onDataReceived((item: DataItem) => {
      callback(item.data);
    });
  }

  /**
   * 监听特定键的状态变化
   * @param key 状态键
   * @param callback 变化回调
   * @returns 取消监听的函数
   */
  onStateChange(key: string, callback: (value: any) => void): () => void {
    return this.system.dataState.subscribe(key, callback);
  }

  /**
   * 获取状态值
   * @param key 状态键
   * @returns 状态值
   */
  get<T = any>(key: string): T | undefined {
    return this.system.dataState.get<T>(key);
  }

  /**
   * 设置状态值
   * @param key 状态键
   * @param value 状态值
   */
  set<T = any>(key: string, value: T): void {
    this.system.dataState.set(key, value);
  }

  /**
   * 获取所有状态键
   * @returns 状态键数组
   */
  getKeys(): string[] {
    return this.system.dataState.keys();
  }

  /**
   * 清空所有状态
   */
  clear(): void {
    this.system.dataState.clear();
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    await this.system.dataAdapterLayer.disconnectAll();
    this.isInitialized = false;
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.isInitialized;
  }
}

/**
 * 创建简单数据系统实例的工厂函数
 * @returns SimpleDataSystem实例
 */
export function createSimpleDataSystem(): SimpleDataSystem {
  return new SimpleDataSystem();
}

/**
 * 快速创建并连接数据系统
 * @param url 数据源URL
 * @param type 连接类型（可选，自动检测）
 * @returns 已连接的SimpleDataSystem实例
 */
export async function quickConnect(
  url: string, 
  type?: 'sse' | 'websocket' | 'rest' | 'mock'
): Promise<SimpleDataSystem> {
  const system = new SimpleDataSystem();
  await system.connect(url, type);
  return system;
} 