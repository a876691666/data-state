import { listen, unlisten, createDataListener } from '../src/index';

console.log('🚀 极简API使用示例 - 只需要两个方法！');
console.log('==============================');

// 方式1: 使用全局函数（最简单）
function globalFunctionExample() {
  console.log('\n=== 方式1: 全局函数 ===');
  
  // 监听用户数据
  listen('user-123', (data) => {
    console.log('用户数据变化:', data);
  });
  
  // 监听配置数据
  listen('config', (data) => {
    console.log('配置数据变化:', data);
  });
  
  // 模拟数据变化（实际使用中数据来自外部）
  setTimeout(() => {
    // 这里只是为了演示，实际数据会来自数据源
    const { getGlobalListener } = require('../src/ultraSimple');
    getGlobalListener().setData('user-123', { name: 'Alice', age: 30 });
    getGlobalListener().setData('config', { theme: 'dark', lang: 'zh' });
  }, 1000);
  
  // 3秒后停止监听用户数据
  setTimeout(() => {
    console.log('\n停止监听 user-123');
    unlisten('user-123');
  }, 3000);
  
  // 5秒后停止监听配置数据
  setTimeout(() => {
    console.log('停止监听 config');
    unlisten('config');
  }, 5000);
}

// 方式2: 使用实例（推荐用于复杂场景）
function instanceExample() {
  console.log('\n=== 方式2: 创建实例 ===');
  
  const dataListener = createDataListener();
  
  // 监听订单数据
  dataListener.listen('order-456', (data) => {
    console.log('订单数据:', data);
  });
  
  // 监听商品数据
  dataListener.listen('product-789', (data) => {
    console.log('商品数据:', data);
  });
  
  // 模拟数据变化
  setTimeout(() => {
    dataListener.setData('order-456', { 
      id: 'order-456', 
      status: 'processing', 
      amount: 299.99 
    });
    dataListener.setData('product-789', { 
      id: 'product-789', 
      name: 'TypeScript 实战', 
      price: 89.99 
    });
  }, 2000);
  
  // 4秒后停止监听订单
  setTimeout(() => {
    console.log('停止监听 order-456');
    dataListener.unlisten('order-456');
  }, 4000);
  
  // 6秒后停止所有监听
  setTimeout(() => {
    console.log('停止所有监听');
    dataListener.unlistenAll();
  }, 6000);
}

// 方式3: 混合使用
function mixedExample() {
  console.log('\n=== 方式3: 混合使用 ===');
  
  // 全局监听通知
  listen('notification', (data) => {
    console.log('🔔 通知:', data);
  });
  
  // 创建专门的数据监听器处理业务数据
  const businessListener = createDataListener();
  
  businessListener.listen('business-data', (data) => {
    console.log('📊 业务数据:', data);
  });
  
  // 模拟数据更新
  setTimeout(() => {
    const { getGlobalListener } = require('../src/ultraSimple');
    getGlobalListener().setData('notification', '系统维护通知');
    businessListener.setData('business-data', { revenue: 150000, users: 1250 });
  }, 1500);
}

// 运行所有示例
async function runExamples() {
  try {
    globalFunctionExample();
    instanceExample();
    mixedExample();
    
    // 7秒后结束演示
    setTimeout(() => {
      console.log('\n✅ 演示结束');
      console.log('\n总结: 只需要两个API就能完成数据监听！');
      console.log('👉 listen(id, callback)   - 监听数据');
      console.log('👉 unlisten(id)          - 停止监听');
      console.log('\n就是这么简单！🎉');
    }, 7000);
    
  } catch (error) {
    console.error('❌ 示例运行出错:', error);
  }
}

// 运行示例
runExamples();