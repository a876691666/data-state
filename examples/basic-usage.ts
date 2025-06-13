import { createSimpleDataSystem, quickConnect } from '../src/index';

// 示例1: 基本使用
async function basicExample() {
  console.log('=== 基本使用示例 ===');
  
  // 创建数据系统实例
  const dataSystem = createSimpleDataSystem();
  
  // 监听数据变化
  const unsubscribe = dataSystem.onData((data) => {
    console.log('收到数据:', data);
  });
  
  // 连接到模拟数据源
  await dataSystem.connect('mock://test', 'mock');
  
  // 等待一些数据
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 取消监听
  unsubscribe();
  
  // 断开连接
  await dataSystem.disconnect();
}

// 示例2: 快速连接
async function quickConnectExample() {
  console.log('=== 快速连接示例 ===');
  
  // 一行代码连接到数据源
  const dataSystem = await quickConnect('mock://quick-test', 'mock');
  
  // 监听数据
  dataSystem.onData((data) => {
    console.log('快速连接收到数据:', data);
  });
  
  // 等待一些数据
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await dataSystem.disconnect();
}

// 示例3: 状态管理
async function stateManagementExample() {
  console.log('=== 状态管理示例 ===');
  
  const dataSystem = createSimpleDataSystem();
  
  // 设置一些状态
  dataSystem.set('user', { name: 'Alice', age: 30 });
  dataSystem.set('config', { theme: 'dark', language: 'zh' });
  
  // 获取状态
  console.log('用户信息:', dataSystem.get('user'));
  console.log('配置信息:', dataSystem.get('config'));
  
  // 监听状态变化
  const unsubscribe = dataSystem.onStateChange('user', (user) => {
    console.log('用户信息变化:', user);
  });
  
  // 更新状态
  dataSystem.set('user', { name: 'Bob', age: 25 });
  
  // 查看所有状态键
  console.log('所有状态键:', dataSystem.getKeys());
  
  unsubscribe();
}

// 示例4: WebSocket连接（需要真实的WebSocket服务器）
async function websocketExample() {
  console.log('=== WebSocket连接示例 ===');
  
  try {
    // 注意：这需要一个真实的WebSocket服务器
    // const dataSystem = await quickConnect('ws://localhost:8080/ws');
    
    // 使用模拟数据代替
    const dataSystem = await quickConnect('mock://websocket-simulation', 'mock');
    
    dataSystem.onData((data) => {
      console.log('WebSocket数据:', data);
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    await dataSystem.disconnect();
    
  } catch (error) {
    console.log('WebSocket连接失败（这是正常的，因为没有真实服务器）:', error.message);
  }
}

// 示例5: REST API轮询
async function restExample() {
  console.log('=== REST API轮询示例 ===');
  
  try {
    // 注意：这需要一个真实的REST API
    // const dataSystem = await quickConnect('https://api.example.com/data');
    
    // 使用模拟数据代替
    const dataSystem = await quickConnect('mock://rest-simulation', 'mock');
    
    dataSystem.onData((data) => {
      console.log('REST API数据:', data);
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await dataSystem.disconnect();
    
  } catch (error) {
    console.log('REST API连接失败（这是正常的，因为没有真实API）:', error.message);
  }
}

// 运行所有示例
async function runAllExamples() {
  try {
    await basicExample();
    console.log('\n');
    
    await quickConnectExample();
    console.log('\n');
    
    await stateManagementExample();
    console.log('\n');
    
    await websocketExample();
    console.log('\n');
    
    await restExample();
    
  } catch (error) {
    console.error('示例运行出错:', error);
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
} 