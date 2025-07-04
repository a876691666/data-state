# TVT Data State - 中文文档

一个强大且易用的 TypeScript 数据状态管理库，支持多种数据源适配器。

## ⚡ 极速开始

### 方式一：一键设置（推荐）

```bash
# 克隆项目后运行
chmod +x scripts/setup.sh
./scripts/setup.sh
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

## 🎯 快速演示

```bash
# 运行演示看效果
npm run demo

# 或使用交互式向导
npm run quick-start
```

## 💡 简单使用

```typescript
import { quickConnect } from 'tvt-data-state';

// 一行代码连接并使用
const data = await quickConnect('mock://demo');
data.onData(console.log);
```

## 🛠️ 常用命令

| 命令 | 功能 | 适合场景 |
|------|------|----------|
| `npm run demo` | 快速演示 | 第一次使用 |
| `npm run quick-start` | 交互式向导 | 选择功能 |
| `npm run help` | 查看帮助 | 查看所有命令 |
| `python userinput.py` | Python 助手 | 喜欢 Python |

## 📖 详细文档

查看 [README.md](./README.md) 获取完整的英文文档。

## 🎉 特性

- ✅ **简单易用** - 一行代码即可开始
- ✅ **多种适配器** - 支持 WebSocket、SSE、REST、Mock
- ✅ **TypeScript** - 完整的类型支持
- ✅ **零配置** - 自动检测连接类型
- ✅ **交互式工具** - 多种辅助工具
- ✅ **完整文档** - 详细的使用说明

## 🚨 问题解决

如果遇到问题：

1. 确保 Node.js 版本 >= 16
2. 运行 `npm run setup` 重新设置
3. 查看 `npm run help` 获取帮助
4. 使用 `python userinput.py` 诊断问题

## 📞 联系我们

- 📋 查看 Issues
- 📖 阅读文档
- 🔧 运行 `npm run help`