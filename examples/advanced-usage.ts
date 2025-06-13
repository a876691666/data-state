import { 
  DataSystemFactory, 
  createSimpleDataSystem, 
  quickConnect,
  SSEAdapter,
  WebSocketAdapter,
  RestAdapter,
  MockAdapter
} from '../src/index';

// 示例1: 多适配器同时使用
async function multiAdapterExample() {
  console.log('=== 多适配器同时使用示例 ===');
  
  const system = DataSystemFactory.create({
    enableLogging: true,
    maxRetries: 3,
    retryDelay: 1000
  });

  // 添加多个不同类型的适配器
  const mockAdapter1 = new MockAdapter('sensor-data', {
    interval: 1000,
    dataGenerator: () => ({
      type: 'sensor',
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 20,
      timestamp: new Date().toISOString()
    })
  });

  const mockAdapter2 = new MockAdapter('user-activity', {
    interval: 2000,
    dataGenerator: () => ({
      type: 'activity',
      userId: Math.floor(Math.random() * 1000),
      action: ['login', 'logout', 'view_page', 'click_button'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString()
    })
  });

  const mockAdapter3 = new MockAdapter('system-metrics', {
    interval: 3000,
    dataGenerator: () => ({
      type: 'metrics',
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      timestamp: new Date().toISOString()
    })
  });

  // 添加适配器到系统
  system.dataAdapterLayer.addAdapter(mockAdapter1);
  system.dataAdapterLayer.addAdapter(mockAdapter2);
  system.dataAdapterLayer.addAdapter(mockAdapter3);

  // 监听不同类型的数据
  const unsubscribe1 = system.listener.onDataReceived((item) => {
    if (item.data.type === 'sensor') {
      console.log(`🌡️  传感器数据: 温度=${item.data.temperature.toFixed(1)}°C, 湿度=${item.data.humidity.toFixed(1)}%`);
    }
  });

  const unsubscribe2 = system.listener.onDataReceived((item) => {
    if (item.data.type === 'activity') {
      console.log(`👤 用户活动: 用户${item.data.userId} 执行了 ${item.data.action}`);
    }
  });

  const unsubscribe3 = system.listener.onDataReceived((item) => {
    if (item.data.type === 'metrics') {
      console.log(`📊 系统指标: CPU=${item.data.cpu.toFixed(1)}%, 内存=${item.data.memory.toFixed(1)}%, 磁盘=${item.data.disk.toFixed(1)}%`);
    }
  });

  // 连接所有适配器
  await system.dataAdapterLayer.connectAll();

  // 运行一段时间
  await new Promise(resolve => setTimeout(resolve, 10000));

  // 显示统计信息
  const stats = system.dataAdapterLayer.getStats();
  console.log('📈 系统统计:', stats);

  // 清理
  unsubscribe1();
  unsubscribe2();
  unsubscribe3();
  await system.dataAdapterLayer.disconnectAll();
}

// 示例2: 数据过滤和转换
async function dataFilteringExample() {
  console.log('\n=== 数据过滤和转换示例 ===');
  
  const dataSystem = createSimpleDataSystem();
  
  // 连接到模拟数据源
  await dataSystem.connect('mock://mixed-data', 'mock');

  // 创建一个数据过滤器
  const temperatureFilter = (data: any) => {
    return data.type === 'sensor' && data.temperature > 25;
  };

  // 创建一个数据转换器
  const temperatureTransformer = (data: any) => {
    return {
      ...data,
      temperatureFahrenheit: (data.temperature * 9/5) + 32,
      level: data.temperature > 30 ? 'high' : data.temperature > 20 ? 'medium' : 'low'
    };
  };

  // 监听并过滤高温数据
  const unsubscribe = dataSystem.onData((data) => {
    if (temperatureFilter(data)) {
      const transformed = temperatureTransformer(data);
      console.log(`🔥 高温警告: ${transformed.temperature}°C (${transformed.temperatureFahrenheit.toFixed(1)}°F) - 级别: ${transformed.level}`);
    }
  });

  // 运行一段时间
  await new Promise(resolve => setTimeout(resolve, 8000));

  unsubscribe();
  await dataSystem.disconnect();
}

// 示例3: 状态管理和数据聚合
async function stateAggregationExample() {
  console.log('\n=== 状态管理和数据聚合示例 ===');
  
  const dataSystem = createSimpleDataSystem();
  
  // 初始化聚合状态
  dataSystem.set('sensorStats', {
    count: 0,
    totalTemperature: 0,
    avgTemperature: 0,
    minTemperature: Infinity,
    maxTemperature: -Infinity,
    readings: []
  });

  // 监听数据并更新聚合状态
  const unsubscribe = dataSystem.onData((data) => {
    if (data.type === 'sensor') {
      const currentStats = dataSystem.get('sensorStats');
      const newStats = {
        count: currentStats.count + 1,
        totalTemperature: currentStats.totalTemperature + data.temperature,
        avgTemperature: 0, // 将在下面计算
        minTemperature: Math.min(currentStats.minTemperature, data.temperature),
        maxTemperature: Math.max(currentStats.maxTemperature, data.temperature),
        readings: [...currentStats.readings.slice(-9), data.temperature] // 保留最近10个读数
      };
      
      newStats.avgTemperature = newStats.totalTemperature / newStats.count;
      
      dataSystem.set('sensorStats', newStats);
    }
  });

  // 监听统计数据变化
  const statsUnsubscribe = dataSystem.onStateChange('sensorStats', (stats) => {
    console.log(`📊 传感器统计 (${stats.count}次读数):`);
    console.log(`   平均温度: ${stats.avgTemperature.toFixed(2)}°C`);
    console.log(`   温度范围: ${stats.minTemperature.toFixed(1)}°C - ${stats.maxTemperature.toFixed(1)}°C`);
    console.log(`   最近读数: [${stats.readings.map(r => r.toFixed(1)).join(', ')}]`);
    console.log('');
  });

  await dataSystem.connect('mock://sensor-data', 'mock');

  // 运行一段时间
  await new Promise(resolve => setTimeout(resolve, 12000));

  // 显示最终统计
  const finalStats = dataSystem.get('sensorStats');
  console.log('🏁 最终统计结果:', finalStats);

  unsubscribe();
  statsUnsubscribe();
  await dataSystem.disconnect();
}

// 示例4: 错误处理和重连机制
async function errorHandlingExample() {
  console.log('\n=== 错误处理和重连机制示例 ===');
  
  const system = DataSystemFactory.create({
    enableLogging: true
  });

  // 创建一个会间歇性失败的模拟适配器
  let failureCount = 0;
  const unreliableAdapter = new MockAdapter('unreliable-source', {
    interval: 1000,
    dataGenerator: () => {
      failureCount++;
      if (failureCount % 5 === 0) {
        throw new Error('模拟网络错误');
      }
      return {
        id: failureCount,
        message: `数据 #${failureCount}`,
        timestamp: new Date().toISOString()
      };
    }
  });

  system.dataAdapterLayer.addAdapter(unreliableAdapter);

  // 监听数据和错误
  const dataUnsubscribe = system.listener.onDataReceived((item) => {
    console.log(`✅ 成功接收: ${item.data.message}`);
  });

  // 监听连接状态变化
  let connectionCheckInterval = setInterval(() => {
    const stats = system.dataAdapterLayer.getStats();
    console.log(`🔗 连接状态: ${stats.connectedAdapters}/${stats.totalAdapters} 适配器已连接`);
  }, 3000);

  try {
    await system.dataAdapterLayer.connectAdapter('unreliable-source');
    
    // 运行一段时间观察错误处理
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
  } finally {
    clearInterval(connectionCheckInterval);
    dataUnsubscribe();
    await system.dataAdapterLayer.disconnectAll();
  }
}

// 示例5: 性能监控和优化
async function performanceMonitoringExample() {
  console.log('\n=== 性能监控和优化示例 ===');
  
  const system = DataSystemFactory.create({
    enableLogging: false, // 关闭日志以提高性能
    maxRetries: 1,
    retryDelay: 500
  });

  // 创建高频数据适配器
  const highFrequencyAdapter = new MockAdapter('high-frequency', {
    interval: 10, // 每10ms一条数据
    maxItems: 1000,
    dataGenerator: () => ({
      timestamp: Date.now(),
      value: Math.random() * 1000,
      batch: Math.floor(Date.now() / 1000) // 按秒分批
    })
  });

  system.dataAdapterLayer.addAdapter(highFrequencyAdapter);

  let dataCount = 0;
  let startTime = Date.now();
  let batchStats = new Map();

  const unsubscribe = system.listener.onDataReceived((item) => {
    dataCount++;
    
    // 统计每秒的数据量
    const batch = item.data.batch;
    if (!batchStats.has(batch)) {
      batchStats.set(batch, 0);
    }
    batchStats.set(batch, batchStats.get(batch) + 1);

    // 每100条数据显示一次性能统计
    if (dataCount % 100 === 0) {
      const elapsed = Date.now() - startTime;
      const rate = (dataCount / elapsed * 1000).toFixed(2);
      console.log(`⚡ 性能统计: 已处理 ${dataCount} 条数据, 速率: ${rate} 条/秒`);
    }
  });

  await system.dataAdapterLayer.connectAdapter('high-frequency');

  // 等待数据处理完成
  await new Promise(resolve => setTimeout(resolve, 12000));

  // 显示最终性能报告
  const totalTime = Date.now() - startTime;
  const avgRate = (dataCount / totalTime * 1000).toFixed(2);
  
  console.log('\n📈 最终性能报告:');
  console.log(`   总数据量: ${dataCount} 条`);
  console.log(`   总耗时: ${totalTime} ms`);
  console.log(`   平均速率: ${avgRate} 条/秒`);
  console.log(`   批次统计: ${Array.from(batchStats.entries()).map(([batch, count]) => `${batch}秒: ${count}条`).join(', ')}`);

  unsubscribe();
  await system.dataAdapterLayer.disconnectAll();
}

// 运行所有高级示例
async function runAdvancedExamples() {
  try {
    await multiAdapterExample();
    await dataFilteringExample();
    await stateAggregationExample();
    await errorHandlingExample();
    await performanceMonitoringExample();
    
    console.log('\n🎉 所有高级示例运行完成！');
  } catch (error) {
    console.error('❌ 示例运行出错:', error);
  }
}

export {
  multiAdapterExample,
  dataFilteringExample,
  stateAggregationExample,
  errorHandlingExample,
  performanceMonitoringExample,
  runAdvancedExamples
}; 