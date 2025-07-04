/**
 * 极简数据监听器
 * 只提供两个核心API：监听id 和 停止监听id
 */

import { DataSystemFactory } from './index';
import { MockAdapter } from './adapters';
import type { DataItem } from './types';

export class UltraSimpleDataListener {
  private system: ReturnType<typeof DataSystemFactory.create>;
  private listeners: Map<string, () => void> = new Map();
  private isConnected = false;

  constructor() {
    this.system = DataSystemFactory.create();
    this.init();
  }

  private async init() {
    if (!this.isConnected) {
      // 自动连接到模拟数据源
      const adapter = new MockAdapter('auto-mock', { interval: 1000 });
      this.system.dataAdapterLayer.addAdapter(adapter);
      await this.system.dataAdapterLayer.connectAdapter('auto-mock');
      this.isConnected = true;
    }
  }

  /**
   * 监听指定id的数据变化
   * @param id 数据id
   * @param callback 回调函数
   */
  listen(id: string, callback: (data: any) => void): void {
    // 如果已经在监听这个id，先停止之前的监听
    if (this.listeners.has(id)) {
      this.unlisten(id);
    }

    // 创建新的监听
    const unsubscribe = this.system.dataState.subscribe(id, callback);
    this.listeners.set(id, unsubscribe);
  }

  /**
   * 停止监听指定id
   * @param id 数据id
   */
  unlisten(id: string): void {
    const unsubscribe = this.listeners.get(id);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(id);
    }
  }

  /**
   * 停止所有监听
   */
  unlistenAll(): void {
    for (const [id] of this.listeners) {
      this.unlisten(id);
    }
  }

  /**
   * 手动设置数据（用于测试）
   * @param id 数据id
   * @param data 数据内容
   */
  setData(id: string, data: any): void {
    this.system.dataState.set(id, data);
  }
}

/**
 * 创建极简数据监听器实例
 * @returns UltraSimpleDataListener实例
 */
export function createDataListener(): UltraSimpleDataListener {
  return new UltraSimpleDataListener();
}

/**
 * 全局单例实例（可选使用）
 */
let globalInstance: UltraSimpleDataListener | null = null;

/**
 * 获取全局数据监听器实例
 * @returns 全局实例
 */
export function getGlobalListener(): UltraSimpleDataListener {
  if (!globalInstance) {
    globalInstance = new UltraSimpleDataListener();
  }
  return globalInstance;
}

/**
 * 直接监听id（使用全局实例）
 * @param id 数据id
 * @param callback 回调函数
 */
export function listen(id: string, callback: (data: any) => void): void {
  getGlobalListener().listen(id, callback);
}

/**
 * 直接停止监听id（使用全局实例）
 * @param id 数据id
 */
export function unlisten(id: string): void {
  getGlobalListener().unlisten(id);
}