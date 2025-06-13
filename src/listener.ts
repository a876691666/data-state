import type { IListener, DataItem } from './types';
import type { DataState } from './dataState';
import type { DataAdapterLayer } from './dataAdapterLayer';

export class Listener implements IListener {
  private dataAdapterLayer: DataAdapterLayer;
  private dataState: DataState;
  private stateChangeCallbacks: Set<(key: string, value: any) => void> = new Set();
  private dataReceivedCallbacks: Set<(data: DataItem) => void> = new Set();
  private unsubscribeStateChanges: (() => void) | null = null;
  private unsubscribeDataReceived: (() => void) | null = null;

  constructor(dataAdapterLayer: DataAdapterLayer) {
    this.dataAdapterLayer = dataAdapterLayer;
    this.dataState = dataAdapterLayer.getDataState();
    this.setupListeners();
  }

  // 监听所有状态变化
  onStateChange(callback: (key: string, value: any) => void): () => void;
  // 监听指定key的状态变化
  onStateChange(key: string, callback: (value: any) => void): () => void;
  // 实现
  onStateChange(
    keyOrCallback: string | ((key: string, value: any) => void),
    callback?: (value: any) => void
  ): () => void {
    if (typeof keyOrCallback === 'string' && callback) {
      // 监听指定key
      const key = keyOrCallback;
      return this.dataState.subscribe(key, callback);
    } else if (typeof keyOrCallback === 'function') {
      // 监听所有状态变化
      const globalCallback = keyOrCallback;
      this.stateChangeCallbacks.add(globalCallback);
      
      return () => {
        this.stateChangeCallbacks.delete(globalCallback);
      };
    } else {
      throw new Error('Invalid arguments for onStateChange');
    }
  }

  onDataReceived(callback: (data: DataItem) => void): () => void {
    this.dataReceivedCallbacks.add(callback);
    
    return () => {
      this.dataReceivedCallbacks.delete(callback);
    };
  }

  // 销毁监听器
  destroy(): void {
    if (this.unsubscribeStateChanges) {
      this.unsubscribeStateChanges();
      this.unsubscribeStateChanges = null;
    }

    if (this.unsubscribeDataReceived) {
      this.unsubscribeDataReceived();
      this.unsubscribeDataReceived = null;
    }

    this.stateChangeCallbacks.clear();
    this.dataReceivedCallbacks.clear();
  }

  // 获取当前监听器数量
  getListenerCount(): {
    stateChange: number;
    dataReceived: number;
  } {
    return {
      stateChange: this.stateChangeCallbacks.size,
      dataReceived: this.dataReceivedCallbacks.size
    };
  }

  private setupListeners(): void {
    // 监听数据状态变化
    this.unsubscribeStateChanges = this.dataState.subscribeAll((key, value) => {
      this.stateChangeCallbacks.forEach(callback => {
        try {
          callback(key, value);
        } catch (error) {
          console.error('Error in state change callback:', error);
        }
      });
    });

    // 监听数据接收
    this.unsubscribeDataReceived = this.dataAdapterLayer.onData((data: DataItem) => {
      this.dataReceivedCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in data received callback:', error);
        }
      });
    });
  }
} 