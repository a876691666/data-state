import { defineConfig } from "vite";
import packageJson from "./package.json";

export default defineConfig({
  base: `/${packageJson.name}`,
  build: {
    outDir: "docs", // 输出目录设置为 docs
  },
});
