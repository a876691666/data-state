# TVT Data State

一个强大且易用的 TypeScript 数据状态管理库，支持多种数据源适配器（SSE、WebSocket、REST、Mock）。

## ⚡ 极简使用 - 只需两个API

```typescript
import { listen, unlisten } from 'tvt-data-state';

// 监听数据
listen('user-123', (data) => {
  console.log('用户数据:', data);
});

// 停止监听  
unlisten('user-123');
```

**就这么简单！** 🎉

## � 快速开始

### 安装

```bash
npm install tvt-data-state
```

### 极简API演示

```bash
npm run demo
```

### 三种使用方式

#### 方式1: 全局函数（最简单）

```typescript
import { listen, unlisten } from 'tvt-data-state';

// 监听用户数据
listen('user-123', (data) => {
  console.log('用户数据变化:', data);
});

// 监听配置数据  
listen('config', (data) => {
  console.log('配置变化:', data);
});

// 停止监听
unlisten('user-123');
unlisten('config');
```

#### 方式2: 创建实例（推荐）

```typescript
import { createDataListener } from 'tvt-data-state';

const dataListener = createDataListener();

// 监听数据
dataListener.listen('order-456', (data) => {
  console.log('订单数据:', data);
});

// 停止监听
dataListener.unlisten('order-456');

// 停止所有监听
dataListener.unlistenAll();
```

#### 方式3: 混合使用

```typescript
import { listen, unlisten, createDataListener } from 'tvt-data-state';

// 全局监听通知
listen('notification', (data) => {
  console.log('🔔 通知:', data);
});

// 创建业务数据监听器
const businessListener = createDataListener();
businessListener.listen('business-data', (data) => {
  console.log('📊 业务数据:', data);
});
```

## 📖 API 文档

### 极简API

| 函数 | 描述 | 参数 |
|------|------|------|
| `listen(id, callback)` | 监听指定id的数据变化 | `id: string, callback: (data: any) => void` |
| `unlisten(id)` | 停止监听指定id | `id: string` |
| `createDataListener()` | 创建数据监听器实例 | - |

### 实例方法

| 方法 | 描述 | 参数 |
|------|------|------|
| `listener.listen(id, callback)` | 监听数据 | `id: string, callback: (data: any) => void` |
| `listener.unlisten(id)` | 停止监听 | `id: string` |
| `listener.unlistenAll()` | 停止所有监听 | - |

## 🏃‍♂️ 运行示例

```bash
# 极简API演示（推荐）
npm run demo

# 基础使用示例
npm run example:basic

# 高级使用示例  
npm run example:advanced

# 极简API详细示例
npm run example:ultra
```

## 📚 完整功能

如果您需要更多高级功能（自定义适配器、连接管理等），可以使用完整API：

### 传统使用方式

```typescript
import { quickConnect } from 'tvt-data-state';

// 连接到数据源
const dataSystem = await quickConnect('ws://localhost:8080/ws');

// 监听数据变化
dataSystem.onData((data) => {
  console.log('收到数据:', data);
});

// 状态管理
dataSystem.set('user', { name: 'Alice', age: 30 });
const user = dataSystem.get('user');
```

### 高级API

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

## 💡 设计理念

这个库提供了两个层次的API：

1. **极简API** - 只关心数据监听，隐藏所有复杂性
2. **完整API** - 提供完整的控制能力

大多数情况下，您只需要使用极简API的两个方法：
- `listen(id, callback)` - 监听数据
- `unlisten(id)` - 停止监听

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！