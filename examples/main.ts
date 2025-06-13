// 导入必要的模块
import { DataSystemFactory, MockAdapter } from "../src/index";

// 设备接口定义
interface SensorDevice {
  id: string;
  name: string;
  location: string;
  temperature: number; // 温度 (°C)
  humidity: number; // 湿度 (%)
  dustLevel: number; // 灰尘度 (μg/m³)
  status: "online" | "offline" | "error";
  lastUpdate: number;
  batteryLevel: number; // 电池电量 (%)
}

// 传感器数据接口
interface SensorData {
  deviceId: string;
  deviceName: string;
  location: string;
  temperature: number;
  humidity: number;
  dustLevel: number;
  status: string;
  batteryLevel: number;
  timestamp: number;
  alertLevel: "normal" | "warning" | "critical";
  stateUpdates: Record<string, any>;
}

// 全局变量
let dataSystem: any = null;
let mockAdapter: MockAdapter | null = null;
let unsubscribeStateChange: (() => void) | null = null;
let unsubscribeDataReceived: (() => void) | null = null;
let devices: Map<string, SensorDevice> = new Map();
let deviceCells: Map<string, HTMLElement> = new Map();
let totalDataCount = 0;
let alertCount = 0;
let isPaused = false;

// 初始化500个设备
function initializeDevices(): void {
  devices.clear();
  const locations = [
    "办公室A",
    "办公室B",
    "会议室1",
    "会议室2",
    "走廊",
    "仓库",
    "实验室",
    "机房",
    "休息区",
    "前台",
  ];

  for (let i = 1; i <= 500; i++) {
    const deviceId = `SENSOR_${i.toString().padStart(3, "0")}`;
    const device: SensorDevice = {
      id: deviceId,
      name: `温湿度传感器-${i}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      temperature: 20 + Math.random() * 15, // 20-35°C
      humidity: 30 + Math.random() * 40, // 30-70%
      dustLevel: Math.random() * 100, // 0-100 μg/m³
      status: Math.random() > 0.05 ? "online" : "offline", // 95%在线率
      lastUpdate: Date.now(),
      batteryLevel: 20 + Math.random() * 80, // 20-100%
    };
    devices.set(deviceId, device);
  }

  // console.log(`已初始化 ${devices.size} 个传感器设备`);
}

// 初始化设备网格
function initializeDeviceGrid(): void {
  const devicesGrid = document.getElementById("devicesGrid") as HTMLElement;
  devicesGrid.innerHTML = "";
  deviceCells.clear();

  devices.forEach((device) => {
    const cell = document.createElement("div");
    cell.className = "device-cell offline";
    cell.dataset.deviceId = device.id;

    const alertLevel = getAlertLevel(device.temperature, device.humidity, device.dustLevel);
    const statusIcon = getStatusIcon(device.status, alertLevel);

    cell.innerHTML = `
      <div class="status-icon">${statusIcon}</div>
      <div class="device-id">${device.id.replace("SENSOR_", "")}</div>
      <div class="device-status">${device.status}</div>
      <div class="device-values">
        <div>🌡️${Math.round(device.temperature)}°</div>
        <div>💧${Math.round(device.humidity)}%</div>
        <div>🌫️${Math.round(device.dustLevel)}</div>
        <div>🔋${Math.round(device.batteryLevel)}%</div>
      </div>
    `;

    // 添加点击事件
    cell.addEventListener("click", () => showDeviceDetails(device));

    devicesGrid.appendChild(cell);
    deviceCells.set(device.id, cell);
  });
}

// 获取状态图标
function getStatusIcon(status: string, alertLevel: string): string {
  if (status === "offline") return "🔴";
  if (alertLevel === "critical") return "🚨";
  if (alertLevel === "warning") return "⚠️";
  return "🟢";
}

// 更新设备格子状态
function updateDeviceCell(device: SensorDevice): void {
  const cell = deviceCells.get(device.id);
  if (!cell) return;

  const alertLevel = getAlertLevel(device.temperature, device.humidity, device.dustLevel);
  const statusIcon = getStatusIcon(device.status, alertLevel);

  // 更新CSS类
  cell.className = "device-cell";
  if (device.status === "offline") {
    cell.classList.add("offline");
  } else if (alertLevel === "critical") {
    cell.classList.add("critical");
  } else if (alertLevel === "warning") {
    cell.classList.add("warning");
  } else {
    cell.classList.add("online");
  }

  // 更新内容
  cell.innerHTML = `
    <div class="status-icon">${statusIcon}</div>
    <div class="device-id">${device.id.replace("SENSOR_", "")}</div>
    <div class="device-status">${device.status}</div>
    <div class="device-values">
      <div>🌡️${Math.round(device.temperature)}°</div>
      <div>💧${Math.round(device.humidity)}%</div>
      <div>🌫️${Math.round(device.dustLevel)}</div>
      <div>🔋${Math.round(device.batteryLevel)}%</div>
    </div>
  `;

  // 重新绑定点击事件
  cell.onclick = () => showDeviceDetails(device);
}

// 显示设备详细信息
function showDeviceDetails(device: SensorDevice): void {
  const alertLevel = getAlertLevel(device.temperature, device.humidity, device.dustLevel);
  const alertIcon = alertLevel === "critical" ? "🔴" : alertLevel === "warning" ? "🟡" : "🟢";

  alert(`设备详情：
${alertIcon} ${device.name} (${device.id})
📍 位置: ${device.location}
📊 状态: ${device.status}
🌡️ 温度: ${device.temperature.toFixed(1)}°C ${
    device.temperature < 15 || device.temperature > 35 ? "⚠️" : ""
  }
💧 湿度: ${device.humidity.toFixed(1)}% ${device.humidity < 20 || device.humidity > 80 ? "⚠️" : ""}
🌫️ 灰尘: ${device.dustLevel.toFixed(1)} μg/m³ ${device.dustLevel > 75 ? "⚠️" : ""}
🔋 电量: ${device.batteryLevel.toFixed(0)}% ${device.batteryLevel < 20 ? "⚠️" : ""}
⏰ 更新: ${new Date(device.lastUpdate).toLocaleString()}
🚨 告警级别: ${alertLevel}`);
}

// DOM元素接口
interface Elements {
  connectBtn: HTMLButtonElement;
  disconnectBtn: HTMLButtonElement;
  generateBtn: HTMLButtonElement;
  pauseBtn: HTMLButtonElement;
  resumeBtn: HTMLButtonElement;
  clearBtn: HTMLButtonElement;
  connectionStatus: HTMLElement;
  deviceCount: HTMLElement;
  onlineCount: HTMLElement;
  alertCount: HTMLElement;
  dataList: HTMLElement;
  stateList: HTMLElement;
  interval: HTMLInputElement;
  maxItems: HTMLInputElement;
  devicesGrid: HTMLElement;
}

// DOM元素
const elements: Elements = {
  connectBtn: document.getElementById("connectBtn") as HTMLButtonElement,
  disconnectBtn: document.getElementById("disconnectBtn") as HTMLButtonElement,
  generateBtn: document.getElementById("generateBtn") as HTMLButtonElement,
  pauseBtn: document.getElementById("pauseBtn") as HTMLButtonElement,
  resumeBtn: document.getElementById("resumeBtn") as HTMLButtonElement,
  clearBtn: document.getElementById("clearBtn") as HTMLButtonElement,
  connectionStatus: document.getElementById("connectionStatus") as HTMLElement,
  deviceCount: document.getElementById("totalCount") as HTMLElement,
  onlineCount: document.getElementById("onlineCount") as HTMLElement,
  alertCount: document.getElementById("alertCount") as HTMLElement,
  dataList: document.getElementById("dataList") as HTMLElement,
  stateList: document.getElementById("stateList") as HTMLElement,
  interval: document.getElementById("interval") as HTMLInputElement,
  maxItems: document.getElementById("maxItems") as HTMLInputElement,
  devicesGrid: document.getElementById("devicesGrid") as HTMLElement,
};

// 获取告警级别
function getAlertLevel(
  temperature: number,
  humidity: number,
  dustLevel: number
): "normal" | "warning" | "critical" {
  // 温度异常：<15°C 或 >35°C
  const tempAlert = temperature < 15 || temperature > 35;
  // 湿度异常：<20% 或 >80%
  const humidityAlert = humidity < 20 || humidity > 80;
  // 灰尘度异常：>75 μg/m³
  const dustAlert = dustLevel > 75;

  const alertCount = [tempAlert, humidityAlert, dustAlert].filter(Boolean).length;

  if (alertCount >= 2) return "critical";
  if (alertCount >= 1) return "warning";
  return "normal";
}

// 模拟设备状态变化
function simulateDeviceChange(device: SensorDevice): void {
  // 温度变化 (-2°C 到 +2°C)
  device.temperature += (Math.random() - 0.5) * 4;
  device.temperature = Math.max(10, Math.min(40, device.temperature));

  // 湿度变化 (-5% 到 +5%)
  device.humidity += (Math.random() - 0.5) * 10;
  device.humidity = Math.max(10, Math.min(90, device.humidity));

  // 灰尘度变化 (-10 到 +10 μg/m³)
  device.dustLevel += (Math.random() - 0.5) * 20;
  device.dustLevel = Math.max(0, Math.min(150, device.dustLevel));

  // 电池电量缓慢下降
  if (Math.random() < 0.1) {
    // 10%概率电量下降
    device.batteryLevel = Math.max(0, device.batteryLevel - Math.random() * 2);
  }

  // 设备状态变化 (很小概率离线)
  if (Math.random() < 0.001) {
    // 0.1%概率状态变化
    device.status = device.status === "online" ? "offline" : "online";
  }

  // 低电量时可能离线
  if (device.batteryLevel < 10 && Math.random() < 0.05) {
    device.status = "offline";
  }

  device.lastUpdate = Date.now();

  // 更新对应的格子显示
  updateDeviceCell(device);
}

// 创建传感器Mock适配器
function createSensorAdapter(interval: number, maxItems: number): MockAdapter {
  return new MockAdapter("sensor-data", {
    interval: interval,
    maxItems: maxItems,
    autoStart: true,
    dataGenerator: () => {
      // 随机选择一个设备
      const deviceIds = Array.from(devices.keys());
      const randomDeviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
      const device = devices.get(randomDeviceId);

      if (!device) return null;

      // 模拟设备状态变化
      simulateDeviceChange(device);

      totalDataCount++;
      const alertLevel = getAlertLevel(device.temperature, device.humidity, device.dustLevel);

      if (alertLevel !== "normal") {
        alertCount++;
      }

      const sensorData: SensorData = {
        deviceId: device.id,
        deviceName: device.name,
        location: device.location,
        temperature: Math.round(device.temperature * 10) / 10,
        humidity: Math.round(device.humidity * 10) / 10,
        dustLevel: Math.round(device.dustLevel * 10) / 10,
        status: device.status,
        batteryLevel: Math.round(device.batteryLevel),
        timestamp: device.lastUpdate,
        alertLevel: alertLevel,
        stateUpdates: {
          [`device_${device.id}_temperature`]: device.temperature,
          [`device_${device.id}_humidity`]: device.humidity,
          [`device_${device.id}_dustLevel`]: device.dustLevel,
          [`device_${device.id}_status`]: device.status,
          [`device_${device.id}_battery`]: device.batteryLevel,
          [`device_${device.id}_lastUpdate`]: device.lastUpdate,
          total_data_count: totalDataCount,
          alert_count: alertCount,
          online_devices: Array.from(devices.values()).filter((d) => d.status === "online").length,
        },
      };

      return sensorData;
    },
  });
}

// 更新状态显示
function updateStatus(): void {
  elements.connectionStatus.textContent = mockAdapter?.isConnected() ? "已连接" : "未连接";
  elements.connectionStatus.style.color = mockAdapter?.isConnected() ? "#10b981" : "#ef4444";
  elements.deviceCount.textContent = devices.size.toString();

  const onlineDevices = Array.from(devices.values()).filter((d) => d.status === "online").length;
  elements.onlineCount.textContent = onlineDevices.toString();

  if (elements.alertCount) {
    const currentAlerts = Array.from(devices.values()).filter((d) => {
      const alertLevel = getAlertLevel(d.temperature, d.humidity, d.dustLevel);
      return alertLevel !== "normal";
    }).length;
    elements.alertCount.textContent = currentAlerts.toString();
  }
}

// 更新按钮状态
function updateButtons(): void {
  const isConnected = mockAdapter?.isConnected() || false;
  elements.connectBtn.disabled = isConnected;
  elements.disconnectBtn.disabled = !isConnected;
  elements.generateBtn.disabled = !isConnected;
  elements.pauseBtn.disabled = !isConnected || isPaused;
  elements.resumeBtn.disabled = !isConnected || !isPaused;
}

// 添加数据到列表
function addDataToList(data: SensorData): void {
  const item = document.createElement("div");
  item.className = `data-item new`;

  const alertIcon =
    data.alertLevel === "critical" ? "🔴" : data.alertLevel === "warning" ? "🟡" : "🟢";

  item.innerHTML = `
    <div class="sensor-header">
      <span class="alert-icon">${alertIcon}</span>
      <strong>${data.deviceName}</strong>
      <span style="font-size: 0.7rem; color: #64748b;">${data.deviceId}</span>
    </div>
    <div class="sensor-location">📍 ${data.location}</div>
    <div class="sensor-data">
      <div class="data-row">
        <span>🌡️ 温度:</span> <span class="${
          data.temperature < 15 || data.temperature > 35 ? "alert-value" : ""
        }">${data.temperature}°C</span>
      </div>
      <div class="data-row">
        <span>💧 湿度:</span> <span class="${
          data.humidity < 20 || data.humidity > 80 ? "alert-value" : ""
        }">${data.humidity}%</span>
      </div>
      <div class="data-row">
        <span>🌫️ 灰尘:</span> <span class="${data.dustLevel > 75 ? "alert-value" : ""}">${
    data.dustLevel
  } μg/m³</span>
      </div>
      <div class="data-row">
        <span>🔋 电量:</span> <span class="${data.batteryLevel < 20 ? "alert-value" : ""}">${
    data.batteryLevel
  }%</span>
      </div>
    </div>
    <div class="timestamp">${new Date(data.timestamp).toLocaleTimeString()}</div>
  `;

  elements.dataList.insertBefore(item, elements.dataList.firstChild);

  // 移除new类
  setTimeout(() => item.classList.remove("new"), 300);

  // 限制显示条数
  const items = elements.dataList.children;
  if (items.length > 10) {
    // 减少显示条数以节省空间
    elements.dataList.removeChild(items[items.length - 1]);
  }
}

// 更新状态列表
function updateStateList(): void {
  if (!dataSystem) return;

  const onlineDevices = Array.from(devices.values()).filter((d) => d.status === "online").length;
  const offlineDevices = devices.size - onlineDevices;
  const warningDevices = Array.from(devices.values()).filter((d) => {
    const alertLevel = getAlertLevel(d.temperature, d.humidity, d.dustLevel);
    return alertLevel === "warning";
  }).length;
  const criticalDevices = Array.from(devices.values()).filter((d) => {
    const alertLevel = getAlertLevel(d.temperature, d.humidity, d.dustLevel);
    return alertLevel === "critical";
  }).length;

  const avgTemp =
    Array.from(devices.values()).reduce((sum, d) => sum + d.temperature, 0) / devices.size;
  const avgHumidity =
    Array.from(devices.values()).reduce((sum, d) => sum + d.humidity, 0) / devices.size;
  const avgDust =
    Array.from(devices.values()).reduce((sum, d) => sum + d.dustLevel, 0) / devices.size;

  elements.stateList.innerHTML = `
    <div style="padding: 15px;">
      <h4 style="margin-bottom: 15px; color: #1e293b;">📊 设备统计</h4>
      <div style="display: grid; gap: 10px;">
        <div style="display: flex; justify-content: space-between; padding: 8px; background: #f0f9ff; border-radius: 6px;">
          <span>🟢 在线设备:</span> <strong>${onlineDevices}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px; background: #fef2f2; border-radius: 6px;">
          <span>🔴 离线设备:</span> <strong>${offlineDevices}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px; background: #fffbeb; border-radius: 6px;">
          <span>⚠️ 告警设备:</span> <strong>${warningDevices}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px; background: #fef2f2; border-radius: 6px;">
          <span>🚨 严重告警:</span> <strong>${criticalDevices}</strong>
        </div>
      </div>
      
      <h4 style="margin: 20px 0 15px; color: #1e293b;">📈 平均值</h4>
      <div style="display: grid; gap: 8px;">
        <div style="display: flex; justify-content: space-between; padding: 6px; background: #f8fafc; border-radius: 4px;">
          <span>🌡️ 平均温度:</span> <span>${avgTemp.toFixed(1)}°C</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px; background: #f8fafc; border-radius: 4px;">
          <span>💧 平均湿度:</span> <span>${avgHumidity.toFixed(1)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px; background: #f8fafc; border-radius: 4px;">
          <span>🌫️ 平均灰尘:</span> <span>${avgDust.toFixed(1)} μg/m³</span>
        </div>
      </div>
    </div>
  `;
}

// 连接适配器
async function connect(): Promise<void> {
  try {
    const interval = parseInt(elements.interval.value);
    const maxItems = parseInt(elements.maxItems.value);

    // 初始化设备
    initializeDevices();
    initializeDeviceGrid();

    // 创建数据系统
    dataSystem = DataSystemFactory.create();

    // 创建传感器Mock适配器
    mockAdapter = createSensorAdapter(interval, maxItems);

    // 添加适配器到数据层
    dataSystem.dataAdapterLayer.addAdapter(mockAdapter);

    // 设置检出函数来处理传感器数据
    dataSystem.dataAdapterLayer.setCheckoutFunction("sensor-data", (data: SensorData) => {
      return {
        key: `sensor-${data.deviceId}`,
        data: {
          ...data,
          processed: true,
          processedAt: Date.now(),
          stateUpdates: data.stateUpdates,
        },
      };
    });

    // 监听状态变化
    unsubscribeStateChange = dataSystem.dataState.subscribe(
      "sensor-SENSOR_052",
      (value: any) => {
        console.log(`设备状态变化: sensor-SENSOR_052 =`, value);
        updateStateList();
        updateStatus();
      }
    );

    // 监听数据接收
    unsubscribeDataReceived = dataSystem.listener.onDataReceived((dataItem: any) => {
      // console.log("接收到传感器数据:", dataItem);
      // 从DataItem中提取实际的传感器数据
      const sensorData = dataItem.data as SensorData;
      addDataToList(sensorData);
      updateStatus();
    });

    // 连接适配器
    await mockAdapter.connect();

    // console.log("传感器适配器连接成功，已初始化500个设备");
    updateButtons();
    updateStatus();
    updateStateList();
  } catch (error) {
    // console.error("连接失败:", error);
    alert("连接失败: " + (error as Error).message);
  }
}

// 断开连接
async function disconnect(): Promise<void> {
  try {
    if (mockAdapter?.isConnected()) {
      await mockAdapter.disconnect();
    }

    if (unsubscribeStateChange) {
      unsubscribeStateChange();
      unsubscribeStateChange = null;
    }

    if (unsubscribeDataReceived) {
      unsubscribeDataReceived();
      unsubscribeDataReceived = null;
    }

    dataSystem = null;
    mockAdapter = null;
    isPaused = false;

    // 重置所有设备格子为离线状态
    deviceCells.forEach((cell) => {
      cell.className = "device-cell offline";
    });

    // console.log("传感器适配器断开连接");
    updateButtons();
    updateStatus();
  } catch (error) {
    console.error("断开连接失败:", error);
  }
}

// 生成一条数据
function generateOne(): void {
  if (mockAdapter?.isConnected()) {
    mockAdapter.generateOne();
  }
}

// 暂停生成
function pauseGeneration(): void {
  if (mockAdapter?.isConnected()) {
    mockAdapter.stopGenerating();
  }
  isPaused = true;
  updateButtons();
}

// 恢复生成
function resumeGeneration(): void {
  if (mockAdapter?.isConnected()) {
    mockAdapter.startGenerating();
  }
  isPaused = false;
  updateButtons();
}

// 清空数据
function clearData(): void {
  totalDataCount = 0;
  alertCount = 0;

  elements.dataList.innerHTML =
    '<div style="padding: 20px; text-align: center; color: #64748b;">暂无数据，请先连接适配器</div>';
  elements.stateList.innerHTML =
    '<div style="padding: 20px; text-align: center; color: #64748b;">暂无状态数据</div>';

  if (dataSystem) {
    dataSystem.dataState.clear();
  }

  if (mockAdapter && mockAdapter.resetCount) {
    mockAdapter.resetCount();
  }

  // 重新初始化设备状态
  initializeDevices();
  if (elements.devicesGrid.children.length > 0) {
    initializeDeviceGrid();
  }

  updateStatus();
}

// 初始化函数
function init(): void {
  // 绑定事件
  elements.connectBtn.addEventListener("click", connect);
  elements.disconnectBtn.addEventListener("click", disconnect);
  elements.generateBtn.addEventListener("click", generateOne);
  elements.pauseBtn.addEventListener("click", pauseGeneration);
  elements.resumeBtn.addEventListener("click", resumeGeneration);
  elements.clearBtn.addEventListener("click", clearData);

  // 配置变化时更新适配器
  elements.interval.addEventListener("change", () => {
    const newInterval = parseInt(elements.interval.value);
    if (mockAdapter?.isConnected()) {
      mockAdapter.updateOptions({ interval: newInterval });
    }
  });

  elements.maxItems.addEventListener("change", () => {
    const newMaxItems = parseInt(elements.maxItems.value);
    if (mockAdapter?.isConnected()) {
      mockAdapter.updateOptions({ maxItems: newMaxItems });
    }
  });

  // 初始化状态
  updateButtons();
  updateStatus();

  // 初始化设备网格（显示离线状态）
  initializeDevices();
  initializeDeviceGrid();

  // console.log("传感器设备监控系统已加载 - 支持500个温湿度灰尘传感器格子显示");
}

// 页面加载完成后初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
