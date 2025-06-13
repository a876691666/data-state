import type { IConsumer, DataItem } from './types';
import type { Listener } from './listener';

export interface ConsumerOptions {
  enableLogging?: boolean;
  batchSize?: number;
  batchTimeout?: number;
  errorRetryAttempts?: number;
  errorRetryDelay?: number;
}

export class Consumer implements IConsumer {
  private listener: Listener;
  private options: ConsumerOptions;
  private dataQueue: DataItem[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private processingCallbacks: Set<(data: DataItem | DataItem[]) => void> = new Set();
  private errorCallbacks: Set<(error: Error) => void> = new Set();
  private unsubscribeDataReceived: (() => void) | null = null;

  constructor(listener: Listener, options: ConsumerOptions = {}) {
    this.listener = listener;
    this.options = {
      enableLogging: true,
      batchSize: 1,
      batchTimeout: 1000,
      errorRetryAttempts: 3,
      errorRetryDelay: 1000,
      ...options
    };

    this.setupDataConsumption();
  }

  consume(data: DataItem): void {
    try {
      if (this.options.batchSize! > 1) {
        this.addToBatch(data);
      } else {
        this.processData(data);
      }
    } catch (error) {
      this.onError(error as Error);
    }
  }

  onError(error: Error): void {
    if (this.options.enableLogging) {
      console.error('Consumer error:', error);
    }

    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  // 添加数据处理回调
  onData(callback: (data: DataItem | DataItem[]) => void): () => void {
    this.processingCallbacks.add(callback);
    
    return () => {
      this.processingCallbacks.delete(callback);
    };
  }

  // 添加错误处理回调
  onErrorCallback(callback: (error: Error) => void): () => void {
    this.errorCallbacks.add(callback);
    
    return () => {
      this.errorCallbacks.delete(callback);
    };
  }

  // 手动处理队列中的数据
  flush(): void {
    if (this.dataQueue.length > 0) {
      this.processBatch();
    }
  }

  // 获取队列状态
  getQueueStatus(): {
    queueLength: number;
    batchSize: number;
    processingCallbacks: number;
    errorCallbacks: number;
  } {
    return {
      queueLength: this.dataQueue.length,
      batchSize: this.options.batchSize!,
      processingCallbacks: this.processingCallbacks.size,
      errorCallbacks: this.errorCallbacks.size
    };
  }

  // 更新配置
  updateOptions(options: Partial<ConsumerOptions>): void {
    this.options = { ...this.options, ...options };
    
    // 如果批处理大小改为1，立即处理队列
    if (options.batchSize === 1 && this.dataQueue.length > 0) {
      this.flush();
    }
  }

  // 销毁消费者
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.unsubscribeDataReceived) {
      this.unsubscribeDataReceived();
      this.unsubscribeDataReceived = null;
    }

    // 处理剩余数据
    this.flush();

    this.processingCallbacks.clear();
    this.errorCallbacks.clear();
    this.dataQueue = [];
  }

  private setupDataConsumption(): void {
    this.unsubscribeDataReceived = this.listener.onDataReceived((data: DataItem) => {
      this.consume(data);
    });
  }

  private addToBatch(data: DataItem): void {
    this.dataQueue.push(data);

    // 如果达到批处理大小，立即处理
    if (this.dataQueue.length >= this.options.batchSize!) {
      this.processBatch();
      return;
    }

    // 设置批处理超时
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.options.batchTimeout);
    }
  }

  private processBatch(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.dataQueue.length === 0) {
      return;
    }

    const batch = [...this.dataQueue];
    this.dataQueue = [];

    try {
      this.processData(batch);
    } catch (error) {
      this.onError(error as Error);
    }
  }

  private processData(data: DataItem | DataItem[]): void {
    this.processingCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in processing callback:', error);
        this.onError(error as Error);
      }
    });
  }
} 