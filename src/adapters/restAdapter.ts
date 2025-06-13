import { BaseAdapter } from './baseAdapter';

export interface RestAdapterOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  pollInterval?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class RestAdapter extends BaseAdapter {
  private url: string;
  private options: RestAdapterOptions;
  private pollTimer: NodeJS.Timeout | null = null;
  private abortController: AbortController | null = null;

  constructor(name: string, url: string, options: RestAdapterOptions = {}) {
    super(name);
    this.url = url;
    this.options = {
      method: 'GET',
      pollInterval: 5000,
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    this.connected = true;
    this.startPolling();
    console.log(`REST adapter "${this.name}" connected`);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.stopPolling();
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    console.log(`REST adapter "${this.name}" disconnected`);
  }

  private startPolling(): void {
    if (this.options.pollInterval && this.options.pollInterval > 0) {
      // 立即执行一次
      this.fetchData();
      
      // 设置定时轮询
      this.pollTimer = setInterval(() => {
        this.fetchData();
      }, this.options.pollInterval);
    }
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async fetchData(retryCount: number = 0): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      this.abortController = new AbortController();
      
      const timeoutId = setTimeout(() => {
        this.abortController?.abort();
      }, this.options.timeout);

      const requestOptions: RequestInit = {
        method: this.options.method,
        headers: this.options.headers,
        signal: this.abortController.signal,
      };

      if (this.options.body && this.options.method !== 'GET') {
        requestOptions.body = typeof this.options.body === 'string' 
          ? this.options.body 
          : JSON.stringify(this.options.body);
      }

      const response = await fetch(this.url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      this.emitData(this.createDataItem(data));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`Request aborted for REST adapter "${this.name}"`);
        return;
      }

      console.error(`Error fetching data in REST adapter "${this.name}":`, error);

      // 重试逻辑
      if (retryCount < this.options.retryAttempts!) {
        console.log(`Retrying request for REST adapter "${this.name}" (attempt ${retryCount + 1})`);
        setTimeout(() => {
          this.fetchData(retryCount + 1);
        }, this.options.retryDelay);
      }
    } finally {
      this.abortController = null;
    }
  }

  // 手动触发数据获取
  async fetch(): Promise<void> {
    await this.fetchData();
  }

  // 更新请求配置
  updateOptions(options: Partial<RestAdapterOptions>): void {
    this.options = { ...this.options, ...options };
    
    // 如果轮询间隔改变，重新启动轮询
    if (options.pollInterval !== undefined && this.connected) {
      this.stopPolling();
      this.startPolling();
    }
  }
} 