#!/usr/bin/env node

console.log(`
🚀 TVT Data State - 帮助文档

📦 安装和设置：
  npm install              # 安装依赖
  npm run setup            # 一键设置项目

🏃‍♂️ 快速开始：
  npm run quick-start      # 启动交互式向导
  npm run demo             # 运行快速演示
  npm test                 # 运行测试（当前显示演示）

📖 示例和演示：
  npm run example:basic    # 运行基础使用示例
  npm run example:advanced # 运行高级使用示例

🔨 开发工具：
  npm run dev              # 启动开发服务器
  npm run build            # 构建库文件
  npm run build:docs       # 构建文档
  npm run build:all        # 构建所有内容
  npm run preview          # 预览构建结果

🚀 发布：
  npm run release          # 发布 patch 版本
  npm run release:minor    # 发布 minor 版本  
  npm run release:major    # 发布 major 版本

❓ 帮助：
  npm run help             # 显示此帮助信息

📚 更多信息：
  - 查看 README.md 获取完整文档
  - 查看 examples/ 目录获取使用示例
  - 查看 src/ 目录了解源代码结构

🌟 快速使用模板：

JavaScript/TypeScript:
\`\`\`javascript
import { quickConnect } from 'tvt-data-state';

const dataSystem = await quickConnect('ws://localhost:8080/ws');
dataSystem.onData(data => console.log(data));
\`\`\`

简单状态管理:
\`\`\`javascript
import { createSimpleDataSystem } from 'tvt-data-state';

const system = createSimpleDataSystem();
system.set('user', { name: 'Alice' });
console.log(system.get('user'));
\`\`\`
`);