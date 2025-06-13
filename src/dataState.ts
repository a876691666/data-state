import type { IDataState } from './types';

export class DataState implements IDataState {
  private data: Map<string, any> = new Map();
  private subscribers: Map<string, Set<(value: any) => void>> = new Map();
  private globalSubscribers: Set<(key: string, value: any) => void> = new Set();

  get<T = any>(key: string): T | undefined {
    return this.data.get(key);
  }

  set<T = any>(key: string, value: T): void {
    this.data.set(key, value);
    
    // 通知特定key的订阅者
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Error in subscriber for key "${key}":`, error);
        }
      });
    }

    // 通知全局订阅者
    this.globalSubscribers.forEach(callback => {
      try {
        callback(key, value);
      } catch (error) {
        console.error(`Error in global subscriber:`, error);
      }
    });
  }

  delete(key: string): void {
    this.data.delete(key);
    this.subscribers.delete(key);
    
    // 通知全局订阅者
    this.globalSubscribers.forEach(callback => {
      try {
        callback(key, undefined);
      } catch (error) {
        console.error(`Error in global subscriber:`, error);
      }
    });
  }

  clear(): void {
    const keys = Array.from(this.data.keys());
    this.data.clear();
    this.subscribers.clear();
    
    // 通知全局订阅者所有key被清除
    keys.forEach(key => {
      this.globalSubscribers.forEach(callback => {
        try {
          callback(key, undefined);
        } catch (error) {
          console.error(`Error in global subscriber:`, error);
        }
      });
    });
  }

  keys(): string[] {
    return Array.from(this.data.keys());
  }

  subscribe(key: string, callback: (value: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    const keySubscribers = this.subscribers.get(key)!;
    keySubscribers.add(callback);
    
    // 立即调用一次回调，传递当前值
    const currentValue = this.data.get(key);
    if (currentValue !== undefined) {
      try {
        callback(currentValue);
      } catch (error) {
        console.error(`Error in initial callback for key "${key}":`, error);
      }
    }
    
    // 返回取消订阅函数
    return () => {
      keySubscribers.delete(callback);
      if (keySubscribers.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  subscribeAll(callback: (key: string, value: any) => void): () => void {
    this.globalSubscribers.add(callback);
    
    // 立即调用一次回调，传递所有当前值
    this.data.forEach((value, key) => {
      try {
        callback(key, value);
      } catch (error) {
        console.error(`Error in initial global callback:`, error);
      }
    });
    
    // 返回取消订阅函数
    return () => {
      this.globalSubscribers.delete(callback);
    };
  }
} 