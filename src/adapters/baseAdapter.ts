import type { IAdapter, DataItem } from '../types';

export abstract class BaseAdapter implements IAdapter {
  public readonly name: string;
  protected connected: boolean = false;
  protected dataCallbacks: Set<(data: DataItem) => void> = new Set();

  constructor(name: string) {
    this.name = name;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }

  onData(callback: (data: DataItem) => void): void {
    this.dataCallbacks.add(callback);
  }

  offData(callback: (data: DataItem) => void): void {
    this.dataCallbacks.delete(callback);
  }

  protected emitData(data: DataItem): void {
    this.dataCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in data callback for adapter "${this.name}":`, error);
      }
    });
  }

  protected createDataItem(data: any, id?: string): DataItem {
    return {
      id: id || this.generateId(),
      timestamp: Date.now(),
      data,
      source: this.name
    };
  }

  private generateId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 