# TVT Data State

一个强大且易用的 TypeScript 数据状态管理库，支持多种数据源适配器（SSE、WebSocket、REST、Mock）。

## 🚀 快速开始

### 安装

```bash
npm install tvt-data-state
```

### 基本使用

```typescript
import { quickConnect } from 'tvt-data-state';

// 一行代码连接到数据源
const dataSystem = await quickConnect('ws://localhost:8080/ws');

// 监听数据变化
dataSystem.onData((data) => {
  console.log('收到数据:', data);
});

// 状态管理
dataSystem.set('user', { name: 'Alice', age: 30 });
const user = dataSystem.get('user');
```

## 📚 详细使用

### 1. 创建数据系统

```typescript
import { createSimpleDataSystem } from 'tvt-data-state';

const dataSystem = createSimpleDataSystem();
```

### 2. 连接数据源

支持多种连接类型，可以自动检测：

```typescript
// WebSocket连接
await dataSystem.connect('ws://localhost:8080/ws');

// SSE连接
await dataSystem.connect('http://localhost:8080/events');

// REST API轮询
await dataSystem.connect('http://localhost:8080/api/data');

// 模拟数据（用于测试）
await dataSystem.connect('mock://test', 'mock');
```

### 3. 数据监听

```typescript
// 监听所有数据变化
const unsubscribe = dataSystem.onData((data) => {
  console.log('收到数据:', data);
});

// 监听特定状态变化
const unsubscribeState = dataSystem.onStateChange('user', (user) => {
  console.log('用户信息变化:', user);
});

// 取消监听
unsubscribe();
unsubscribeState();
```

### 4. 状态管理

```typescript
// 设置状态
dataSystem.set('user', { name: 'Alice', age: 30 });
dataSystem.set('config', { theme: 'dark' });

// 获取状态
const user = dataSystem.get('user');
const config = dataSystem.get('config');

// 获取所有状态键
const keys = dataSystem.getKeys();

// 清空所有状态
dataSystem.clear();
```

### 5. 连接管理

```typescript
// 检查连接状态
if (dataSystem.isConnected()) {
  console.log('已连接');
}

// 断开连接
await dataSystem.disconnect();
```

## 🔧 高级使用

### 使用工厂模式

```typescript
import { DataSystemFactory } from 'tvt-data-state';

const system = DataSystemFactory.create({
  // 配置选项
});

// 访问各个组件
system.dataAdapterLayer;
system.listener;
system.consumer;
system.dataState;
```

### 自定义适配器

```typescript
import { SSEAdapter, WebSocketAdapter, RestAdapter } from 'tvt-data-state';

// 创建自定义SSE适配器
const sseAdapter = new SSEAdapter('my-sse', 'http://localhost:8080/events', {
  // 自定义选项
});

// 添加到数据层
system.dataAdapterLayer.addAdapter(sseAdapter);
await system.dataAdapterLayer.connectAdapter('my-sse');
```

## 📖 API 文档

### SimpleDataSystem

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `connect(url, type?)` | 连接到数据源 | `url: string, type?: 'sse' \| 'websocket' \| 'rest' \| 'mock'` | `Promise<void>` |
| `onData(callback)` | 监听数据变化 | `callback: (data: any) => void` | `() => void` |
| `onStateChange(key, callback)` | 监听状态变化 | `key: string, callback: (value: any) => void` | `() => void` |
| `get<T>(key)` | 获取状态值 | `key: string` | `T \| undefined` |
| `set<T>(key, value)` | 设置状态值 | `key: string, value: T` | `void` |
| `getKeys()` | 获取所有状态键 | - | `string[]` |
| `clear()` | 清空所有状态 | - | `void` |
| `disconnect()` | 断开连接 | - | `Promise<void>` |
| `isConnected()` | 检查连接状态 | - | `boolean` |

### 工具函数

| 函数 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `createSimpleDataSystem()` | 创建简单数据系统 | - | `SimpleDataSystem` |
| `quickConnect(url, type?)` | 快速连接数据源 | `url: string, type?: string` | `Promise<SimpleDataSystem>` |

## 🏃‍♂️ 运行示例

```bash
# 克隆项目
git clone <repository-url>
cd tvt-data-state

# 安装依赖
npm install

# 运行基础示例
npm run example:basic

# 运行高级示例  
npm run example:advanced

# 启动开发环境
npm run dev
```

## 🔨 开发

```bash
# 构建项目
npm run build

# 构建文档
npm run build:docs

# 构建全部
npm run build:all

# 发布新版本
npm run release        # patch版本
npm run release:minor  # minor版本  
npm run release:major  # major版本
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！