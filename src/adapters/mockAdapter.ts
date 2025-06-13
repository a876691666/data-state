import { BaseAdapter } from "./baseAdapter";

export interface MockAdapterOptions {
  interval?: number; // 数据生成间隔（毫秒）
  dataGenerator?: () => any;
  maxItems?: number; // 每个间隔内生成的数据条数（间隔内变化次数）
  autoStart?: boolean;
}

export class MockAdapter extends BaseAdapter {
  private options: MockAdapterOptions;
  private timer: NodeJS.Timeout | null = null;
  private totalItemCount: number = 0;

  constructor(name: string, options: MockAdapterOptions = {}) {
    super(name);
    this.options = {
      interval: 2000,
      maxItems: 1,
      autoStart: true,
      dataGenerator: this.defaultDataGenerator.bind(this),
      ...options,
    };
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    this.connected = true;
    this.totalItemCount = 0;

    if (this.options.autoStart) {
      this.startGenerating();
    }

    console.log(`Mock adapter "${this.name}" connected`);
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.stopGenerating();
    console.log(`Mock adapter "${this.name}" disconnected`);
  }

  startGenerating(): void {
    if (!this.connected || this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      try {
        const itemsToGenerate = this.options.maxItems || 1;
        
        for (let i = 0; i < itemsToGenerate; i++) {
          const data = this.options.dataGenerator?.() ?? this.defaultDataGenerator();
          this.emitData(this.createDataItem(data));
          this.totalItemCount++;
        }
      } catch (error) {
        console.error(`Error generating mock data in adapter "${this.name}":`, error);
      }
    }, this.options.interval);
  }

  stopGenerating(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // 手动生成一批数据（按照当前配置的 maxItems 数量）
  generateOne(): void {
    if (!this.connected) {
      console.warn(`Cannot generate data: Mock adapter "${this.name}" is not connected`);
      return;
    }

    try {
      const itemsToGenerate = this.options.maxItems || 1;
      
      for (let i = 0; i < itemsToGenerate; i++) {
        const data = this.options.dataGenerator?.() ?? this.defaultDataGenerator();
        this.emitData(this.createDataItem(data));
        this.totalItemCount++;
      }
    } catch (error) {
      console.error(`Error generating mock data in adapter "${this.name}":`, error);
    }
  }

  // 重置计数器
  resetCount(): void {
    this.totalItemCount = 0;
  }

  // 获取当前生成的数据总条数
  getItemCount(): number {
    return this.totalItemCount;
  }

  // 更新配置
  updateOptions(options: Partial<MockAdapterOptions>): void {
    const wasGenerating = this.timer !== null;

    if (wasGenerating) {
      this.stopGenerating();
    }

    this.options = { ...this.options, ...options };

    if (wasGenerating && this.connected) {
      this.startGenerating();
    }
  }

  private defaultDataGenerator(): any {
    const types = ["user", "order", "product", "event"];
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case "user":
        return {
          type: "user",
          id: Math.floor(Math.random() * 10000),
          name: `User${Math.floor(Math.random() * 1000)}`,
          email: `user${Math.floor(Math.random() * 1000)}@example.com`,
          status: Math.random() > 0.5 ? "active" : "inactive",
        };

      case "order":
        return {
          type: "order",
          id: `ORDER-${Math.floor(Math.random() * 100000)}`,
          amount: Math.floor(Math.random() * 1000) + 10,
          currency: "USD",
          status: ["pending", "processing", "completed", "cancelled"][
            Math.floor(Math.random() * 4)
          ],
        };

      case "product":
        return {
          type: "product",
          id: `PROD-${Math.floor(Math.random() * 10000)}`,
          name: `Product ${Math.floor(Math.random() * 1000)}`,
          price: Math.floor(Math.random() * 500) + 5,
          category: ["electronics", "clothing", "books", "home"][Math.floor(Math.random() * 4)],
        };

      case "event":
        return {
          type: "event",
          name: ["click", "view", "purchase", "signup"][Math.floor(Math.random() * 4)],
          userId: Math.floor(Math.random() * 10000),
          metadata: {
            page: `/page${Math.floor(Math.random() * 10)}`,
            userAgent: "MockBrowser/1.0",
          },
        };

      default:
        return {
          type: "unknown",
          value: Math.random(),
          message: "Generated mock data",
        };
    }
  }
}
