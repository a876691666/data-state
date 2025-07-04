#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 TVT Data State 快速启动向导\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function runQuickStart() {
  try {
    console.log('欢迎使用 TVT Data State！让我们快速开始：\n');
    
    const choice = await question(`选择您要做什么：
1. 运行基础示例 (推荐新手)
2. 运行高级示例
3. 查看项目文档
4. 构建项目
5. 创建新的使用示例

请输入数字 (1-5): `);

    console.log('');

    switch (choice.trim()) {
      case '1':
        console.log('🏃‍♂️ 运行基础示例...\n');
        execSync('npm run example:basic', { stdio: 'inherit', cwd: rootDir });
        break;
        
      case '2':
        console.log('🔧 运行高级示例...\n');
        execSync('npm run example:advanced', { stdio: 'inherit', cwd: rootDir });
        break;
        
      case '3':
        console.log('📖 打开项目文档...\n');
        console.log('请查看 README.md 文件或访问：');
        console.log('- 基础使用示例：examples/basic-usage.ts');
        console.log('- 高级使用示例：examples/advanced-usage.ts');
        console.log('- API 文档：README.md');
        break;
        
      case '4':
        console.log('🔨 构建项目...\n');
        execSync('npm run build:all', { stdio: 'inherit', cwd: rootDir });
        console.log('\n✅ 构建完成！');
        break;
        
      case '5':
        await createNewExample();
        break;
        
      default:
        console.log('❌ 无效选择，运行基础示例作为默认操作...\n');
        execSync('npm run example:basic', { stdio: 'inherit', cwd: rootDir });
    }

    console.log('\n🎉 操作完成！');
    console.log('\n📚 更多帮助：');
    console.log('- 查看 README.md 获取完整文档');
    console.log('- 运行 npm run help 查看所有可用命令');
    console.log('- 运行 npm run demo 查看快速演示');

  } catch (error) {
    console.error('❌ 出现错误:', error.message);
  } finally {
    rl.close();
  }
}

async function createNewExample() {
  console.log('📝 创建新的使用示例\n');
  
  const name = await question('示例名称: ');
  const type = await question('连接类型 (websocket/sse/rest/mock): ');
  const url = await question('连接URL (可选): ');

  const exampleContent = `import { quickConnect, createSimpleDataSystem } from '../src/index';

// ${name} 示例
async function ${name.replace(/[^a-zA-Z0-9]/g, '')}Example() {
  console.log('=== ${name} 示例 ===');
  
  try {
    // 快速连接到数据源
    const dataSystem = await quickConnect('${url || `mock://test-${type}`}', '${type}');
    
    // 监听数据变化
    dataSystem.onData((data) => {
      console.log('收到数据:', data);
    });
    
    // 状态管理示例
    dataSystem.set('example', { name: '${name}', type: '${type}' });
    console.log('示例状态:', dataSystem.get('example'));
    
    // 运行一段时间后断开
    setTimeout(async () => {
      await dataSystem.disconnect();
      console.log('示例完成');
    }, 5000);
    
  } catch (error) {
    console.error('示例运行出错:', error.message);
  }
}

// 运行示例
${name.replace(/[^a-zA-Z0-9]/g, '')}Example();
`;

  const fileName = `examples/${name.toLowerCase().replace(/\s+/g, '-')}.ts`;
  const filePath = path.join(rootDir, fileName);
  
  fs.writeFileSync(filePath, exampleContent, 'utf8');
  console.log(`\n✅ 示例文件已创建: ${fileName}`);
  console.log(`运行命令: node --loader ts-node/esm ${fileName}`);
}

runQuickStart();