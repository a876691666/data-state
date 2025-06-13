// 核心类型
export type {
  DataItem,
  IAdapter,
  IDataState,
  IListener,
  IConsumer,
  AdapterConfig,
  CheckoutFunction,
} from "./types";

// 核心组件
export { DataState } from "./dataState";
export { DataAdapterLayer, type DataAdapterLayerOptions } from "./dataAdapterLayer";
export { Listener } from "./listener";
export { Consumer, type ConsumerOptions } from "./consumer";

// 适配器
export {
  BaseAdapter,
  SSEAdapter,
  type SSEAdapterOptions,
  WebSocketAdapter,
  type WebSocketAdapterOptions,
  RestAdapter,
  type RestAdapterOptions,
  MockAdapter,
  type MockAdapterOptions,
} from "./adapters";

// 简单包装器
export { 
  SimpleDataSystem, 
  createSimpleDataSystem, 
  quickConnect 
} from "./simpleWrapper";

// 导入用于工厂函数
import { DataAdapterLayer } from "./dataAdapterLayer";
import { Listener } from "./listener";
import { Consumer } from "./consumer";
import type { DataAdapterLayerOptions } from "./dataAdapterLayer";

// 工厂函数
export class DataSystemFactory {
  static create(options: DataAdapterLayerOptions = {}) {
    const dataAdapterLayer = new DataAdapterLayer(options);
    const listener = new Listener(dataAdapterLayer);
    const consumer = new Consumer(listener);

    return {
      dataAdapterLayer,
      listener,
      consumer,
      dataState: dataAdapterLayer.getDataState(),
    };
  }
}

// 默认导出
export default DataSystemFactory;
