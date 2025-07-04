# TVT Data State - 中文文档

一个强大且易用的 TypeScript 数据状态管理库，支持多种数据源适配器。

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

## 🎯 快速演示

```bash
# 运行极简API演示
npm run demo
```

## 💡 三种使用方式

### 方式1: 全局函数（最简单）

```typescript
import { listen, unlisten } from 'tvt-data-state';

// 监听用户数据
listen('user-123', (data) => console.log('用户:', data));

// 停止监听
unlisten('user-123');
```

### 方式2: 创建实例（推荐）

```typescript
import { createDataListener } from 'tvt-data-state';

const listener = createDataListener();
listener.listen('order-456', (data) => console.log('订单:', data));
listener.unlisten('order-456');
```

### 方式3: 混合使用

```typescript
import { listen, createDataListener } from 'tvt-data-state';

// 全局监听通知
listen('notification', (data) => console.log('🔔', data));

// 业务数据监听器
const business = createDataListener();
business.listen('data', (data) => console.log('📊', data));
```

## 🛠️ 极速开始

### 方式一：一键演示

```bash
npm run demo
```

### 方式二：手动设置

```bash
npm install
npm run setup
```

### 方式三：使用 Python 助手

```bash
python userinput.py
```

## 🛠️ 常用命令

| 命令 | 功能 | 适合场景 |
|------|------|----------|
| `npm run demo` | 极简API演示 | 第一次使用 |
| `npm run example:ultra` | 详细极简示例 | 学习用法 |
| `npm run example:basic` | 基础示例 | 了解完整功能 |
| `npm run help` | 查看帮助 | 查看所有命令 |

## 📖 极简API文档

| 函数/方法 | 描述 | 用法 |
|-----------|------|------|
| `listen(id, callback)` | 监听数据变化 | `listen('user', data => console.log(data))` |
| `unlisten(id)` | 停止监听 | `unlisten('user')` |
| `createDataListener()` | 创建监听器实例 | `const listener = createDataListener()` |
| `listener.unlistenAll()` | 停止所有监听 | `listener.unlistenAll()` |

## � 设计理念

这个库有两个层次：

1. **极简API** - 只要两个方法，隐藏所有复杂性 ⭐**推荐**
2. **完整API** - 提供完整控制能力

99% 的场景下，您只需要：
- `listen(id, callback)` - 监听数据
- `unlisten(id)` - 停止监听

## 🎉 特性

- ✅ **超简单** - 只需两个方法
- ✅ **零配置** - 自动处理连接
- ✅ **TypeScript** - 完整类型支持  
- ✅ **轻量级** - 最小化API设计
- ✅ **功能完整** - 保留所有底层能力

## 🚨 问题解决

如果遇到问题：

1. 运行 `npm run demo` 看演示
2. 查看 `npm run help` 获取帮助
3. 使用 `python userinput.py` 诊断问题

## 📞 更多

- � 查看 [README.md](./README.md) 获取完整英文文档
- 🔧 运行 `npm run help` 查看所有命令
- 📋 查看 Issues 反馈问题