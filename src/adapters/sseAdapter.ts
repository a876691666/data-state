import { BaseAdapter } from './baseAdapter';

export interface SSEAdapterOptions {
  withCredentials?: boolean;
  headers?: Record<string, string>;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class SSEAdapter extends BaseAdapter {
  private eventSource: EventSource | null = null;
  private url: string;
  private options: SSEAdapterOptions;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(name: string, url: string, options: SSEAdapterOptions = {}) {
    super(name);
    this.url = url;
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...options
    };
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(this.url, {
          withCredentials: this.options.withCredentials
        });

        this.eventSource.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log(`SSE adapter "${this.name}" connected`);
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emitData(this.createDataItem(data, event.lastEventId));
          } catch (error) {
            console.error(`Error parsing SSE data in adapter "${this.name}":`, error);
            this.emitData(this.createDataItem(event.data, event.lastEventId));
          }
        };

        this.eventSource.onerror = (error) => {
          console.error(`SSE error in adapter "${this.name}":`, error);
          this.connected = false;
          
          if (this.reconnectAttempts < this.options.maxReconnectAttempts!) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.connected = false;
    console.log(`SSE adapter "${this.name}" disconnected`);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} for SSE adapter "${this.name}"`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.disconnect();
        await this.connect();
      } catch (error) {
        console.error(`Reconnect failed for SSE adapter "${this.name}":`, error);
      }
    }, this.options.reconnectInterval);
  }
} 