import { BaseAdapter } from './baseAdapter';

export interface WebSocketAdapterOptions {
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  pongTimeout?: number;
}

export class WebSocketAdapter extends BaseAdapter {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WebSocketAdapterOptions;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private pongTimer: NodeJS.Timeout | null = null;

  constructor(name: string, url: string, options: WebSocketAdapterOptions = {}) {
    super(name);
    this.url = url;
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      pingInterval: 30000,
      pongTimeout: 5000,
      ...options
    };
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url, this.options.protocols);

        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.startPing();
          console.log(`WebSocket adapter "${this.name}" connected`);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            // 处理pong消息
            if (event.data === 'pong') {
              this.handlePong();
              return;
            }

            const data = JSON.parse(event.data);
            this.emitData(this.createDataItem(data));
          } catch (error) {
            console.error(`Error parsing WebSocket data in adapter "${this.name}":`, error);
            this.emitData(this.createDataItem(event.data));
          }
        };

        this.ws.onclose = (event) => {
          console.log(`WebSocket closed in adapter "${this.name}":`, event.code, event.reason);
          this.connected = false;
          this.stopPing();
          
          if (!event.wasClean && this.reconnectAttempts < this.options.maxReconnectAttempts!) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error(`WebSocket error in adapter "${this.name}":`, error);
          reject(error);
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

    this.stopPing();

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Normal closure');
    }

    this.ws = null;
    this.connected = false;
    console.log(`WebSocket adapter "${this.name}" disconnected`);
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
    } else {
      console.warn(`Cannot send data: WebSocket adapter "${this.name}" is not connected`);
    }
  }

  private startPing(): void {
    if (this.options.pingInterval && this.options.pingInterval > 0) {
      this.pingTimer = setInterval(() => {
        this.ping();
      }, this.options.pingInterval);
    }
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('ping');
      
      // 设置pong超时
      this.pongTimer = setTimeout(() => {
        console.warn(`Pong timeout in WebSocket adapter "${this.name}"`);
        this.ws?.close(1000, 'Pong timeout');
      }, this.options.pongTimeout);
    }
  }

  private handlePong(): void {
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} for WebSocket adapter "${this.name}"`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.disconnect();
        await this.connect();
      } catch (error) {
        console.error(`Reconnect failed for WebSocket adapter "${this.name}":`, error);
      }
    }, this.options.reconnectInterval);
  }
} 