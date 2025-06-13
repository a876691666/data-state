import { BaseAdapter } from './baseAdapter';

export interface StreamAdapterOptions {
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class StreamAdapter extends BaseAdapter {
  private url: string;
  private options: StreamAdapterOptions;
  private abortController: AbortController | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  constructor(name: string, url: string, options: StreamAdapterOptions = {}) {
    super(name);
    this.url = url;
    this.options = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 2000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain, application/json',
      },
      ...options
    };
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    await this.startStream();
    console.log(`Stream adapter "${this.name}" connected`);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (error) {
        console.error(`Error canceling stream reader in adapter "${this.name}":`, error);
      }
      this.reader = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    console.log(`Stream adapter "${this.name}" disconnected`);
  }

  private async startStream(retryCount: number = 0): Promise<void> {
    try {
      this.abortController = new AbortController();
      
      const timeoutId = setTimeout(() => {
        this.abortController?.abort();
      }, this.options.timeout);

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: this.options.headers,
        signal: this.abortController.signal,
      };

      if (this.options.body) {
        requestOptions.body = typeof this.options.body === 'string' 
          ? this.options.body 
          : JSON.stringify(this.options.body);
      }

      const response = await fetch(this.url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      this.connected = true;
      this.reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (this.connected) {
        try {
          const { done, value } = await this.reader.read();
          
          if (done) {
            console.log(`Stream ended for adapter "${this.name}"`);
            break;
          }

          // 解码数据块
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 处理完整的行（以换行符分隔）
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行

          for (const line of lines) {
            if (line.trim()) {
              this.processStreamLine(line.trim());
            }
          }

        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log(`Stream aborted for adapter "${this.name}"`);
            break;
          }
          throw error;
        }
      }

      // 处理缓冲区中剩余的数据
      if (buffer.trim()) {
        this.processStreamLine(buffer.trim());
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`Stream request aborted for adapter "${this.name}"`);
        return;
      }

      console.error(`Error in stream adapter "${this.name}":`, error);

      // 重试逻辑
      if (retryCount < this.options.retryAttempts! && this.connected) {
        console.log(`Retrying stream connection for adapter "${this.name}" (attempt ${retryCount + 1})`);
        setTimeout(() => {
          this.startStream(retryCount + 1);
        }, this.options.retryDelay);
      } else {
        this.connected = false;
      }
    } finally {
      this.reader = null;
      this.abortController = null;
    }
  }

  private processStreamLine(line: string): void {
    try {
      // 尝试解析为JSON
      const data = JSON.parse(line);
      this.emitData(this.createDataItem(data));
    } catch (error) {
      // 如果不是JSON，直接作为文本处理
      this.emitData(this.createDataItem(line));
    }
  }

  // 更新请求配置
  updateOptions(options: Partial<StreamAdapterOptions>): void {
    this.options = { ...this.options, ...options };
  }
} 