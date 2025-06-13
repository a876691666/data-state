// 基础数据类型
export interface DataItem {
  id: string;
  timestamp: number;
  data: any;
  source?: string;
}

// 适配器接口
export interface IAdapter {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  onData(callback: (data: DataItem) => void): void;
  offData(callback: (data: DataItem) => void): void;
}

// 数据状态接口
export interface IDataState {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
  subscribe(key: string, callback: (value: any) => void): () => void;
  subscribeAll(callback: (key: string, value: any) => void): () => void;
}

// 监听层接口
export interface IListener {
  // 监听所有状态变化
  onStateChange(callback: (key: string, value: any) => void): () => void;
  // 监听指定key的状态变化
  onStateChange(key: string, callback: (value: any) => void): () => void;
  onDataReceived(callback: (data: DataItem) => void): () => void;
}

// 消费者接口
export interface IConsumer {
  consume(data: DataItem): void;
  onError(error: Error): void;
}

// 适配器配置
export interface AdapterConfig {
  name: string;
  type: 'sse' | 'websocket' | 'mqtt' | 'rest' | 'stream' | 'mock';
  url?: string;
  options?: Record<string, any>;
}

// 检出函数返回类型
export interface CheckoutResult<S = any> {
  key: string;
  data: S;
}

// 检出函数类型
export type CheckoutFunction<R = any, S = any> = (result: R) => CheckoutResult<S>; 