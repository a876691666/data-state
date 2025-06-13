import type { IAdapter, DataItem, CheckoutFunction, CheckoutResult } from './types';
import { DataState } from './dataState';

export interface DataAdapterLayerOptions {
  enableLogging?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export class DataAdapterLayer {
  private adapters: Map<string, IAdapter> = new Map();
  private dataState: DataState;
  private options: DataAdapterLayerOptions;
  private checkoutFunctions: Map<string, CheckoutFunction> = new Map();
  private dataCallbacks: Set<(data: DataItem) => void> = new Set();

  constructor(options: DataAdapterLayerOptions = {}) {
    this.options = {
      enableLogging: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    };
    
    this.dataState = new DataState();
  }

  // 添加适配器
  addAdapter(adapter: IAdapter): void {
    if (this.adapters.has(adapter.name)) {
      throw new Error(`Adapter with name "${adapter.name}" already exists`);
    }

    this.adapters.set(adapter.name, adapter);
    
    // 监听适配器数据
    adapter.onData((data: DataItem) => {
      this.handleAdapterData(data);
    });

    if (this.options.enableLogging) {
      console.log(`Added adapter: ${adapter.name}`);
    }
  }

  // 移除适配器
  async removeAdapter(name: string): Promise<void> {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Adapter "${name}" not found`);
    }

    // 断开连接
    if (adapter.isConnected()) {
      await adapter.disconnect();
    }

    this.adapters.delete(name);
    this.checkoutFunctions.delete(name);

    if (this.options.enableLogging) {
      console.log(`Removed adapter: ${name}`);
    }
  }

  // 获取适配器
  getAdapter(name: string): IAdapter | undefined {
    return this.adapters.get(name);
  }

  // 获取所有适配器
  getAllAdapters(): IAdapter[] {
    return Array.from(this.adapters.values());
  }

  // 连接指定适配器
  async connectAdapter(name: string): Promise<void> {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Adapter "${name}" not found`);
    }

    await adapter.connect();
    
    if (this.options.enableLogging) {
      console.log(`Connected adapter: ${name}`);
    }
  }

  // 断开指定适配器
  async disconnectAdapter(name: string): Promise<void> {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw new Error(`Adapter "${name}" not found`);
    }

    await adapter.disconnect();
    
    if (this.options.enableLogging) {
      console.log(`Disconnected adapter: ${name}`);
    }
  }

  // 连接所有适配器
  async connectAll(): Promise<void> {
    const promises = Array.from(this.adapters.values()).map(async (adapter) => {
      try {
        await adapter.connect();
        if (this.options.enableLogging) {
          console.log(`Connected adapter: ${adapter.name}`);
        }
      } catch (error) {
        console.error(`Failed to connect adapter "${adapter.name}":`, error);
        throw error;
      }
    });

    await Promise.all(promises);
  }

  // 断开所有适配器
  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.adapters.values()).map(async (adapter) => {
      try {
        await adapter.disconnect();
        if (this.options.enableLogging) {
          console.log(`Disconnected adapter: ${adapter.name}`);
        }
      } catch (error) {
        console.error(`Failed to disconnect adapter "${adapter.name}":`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  // 设置检出函数
  setCheckoutFunction<R = any, S = any>(adapterName: string, checkoutFn: CheckoutFunction<R, S>): void {
    this.checkoutFunctions.set(adapterName, checkoutFn);
  }

  // 移除检出函数
  removeCheckoutFunction(adapterName: string): void {
    this.checkoutFunctions.delete(adapterName);
  }

  // 获取数据状态实例
  getDataState(): DataState {
    return this.dataState;
  }

  // 监听数据变化
  onData(callback: (data: DataItem) => void): () => void {
    this.dataCallbacks.add(callback);
    
    return () => {
      this.dataCallbacks.delete(callback);
    };
  }

  // 获取适配器状态
  getAdapterStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.adapters.forEach((adapter, name) => {
      status[name] = adapter.isConnected();
    });
    return status;
  }

  // 获取统计信息
  getStats(): {
    totalAdapters: number;
    connectedAdapters: number;
    dataStateKeys: number;
  } {
    const connectedCount = Array.from(this.adapters.values())
      .filter(adapter => adapter.isConnected()).length;

    return {
      totalAdapters: this.adapters.size,
      connectedAdapters: connectedCount,
      dataStateKeys: this.dataState.keys().length
    };
  }

  // 处理适配器数据
  private handleAdapterData(data: DataItem): void {
    try {
      // 应用检出函数（如果存在）
      const checkoutFn = this.checkoutFunctions.get(data.source || '');
      let processedData = data;
      let stateKey = this.generateStateKey(data);
      
      if (checkoutFn) {
        const result: CheckoutResult = checkoutFn(data.data);
        processedData = {
          ...data,
          data: result.data
        };
        // 使用检出函数返回的 key
        stateKey = result.key;
      }

      // 处理状态更新（如果数据中包含stateUpdates）
      if (processedData.data && processedData.data.stateUpdates) {
        Object.entries(processedData.data.stateUpdates).forEach(([key, value]) => {
          this.dataState.set(key, value);
        });
      }

      // 存储到数据状态，使用检出函数提供的 key 或默认生成的 key
      this.dataState.set(stateKey, processedData);

      // 通知数据回调
      this.dataCallbacks.forEach(callback => {
        try {
          callback(processedData);
        } catch (error) {
          console.error('Error in data callback:', error);
        }
      });

      if (this.options.enableLogging) {
        // console.log(`Processed data from ${data.source} with key ${stateKey}:`, processedData);
      }

    } catch (error) {
      console.error('Error handling adapter data:', error);
    }
  }

  // 生成数据状态键
  private generateStateKey(data: DataItem): string {
    return `${data.source || 'unknown'}_${data.id}`;
  }
} 