#!/bin/bash

# TVT Data State 一键设置脚本
echo "🚀 TVT Data State - 一键设置开始"
echo "=================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 构建项目
echo ""
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

# 设置可执行权限
chmod +x scripts/*.js 2>/dev/null || true

echo ""
echo "🎉 设置完成！"
echo ""
echo "📚 接下来你可以:"
echo "  npm run demo         # 运行快速演示"
echo "  npm run quick-start  # 启动交互式向导"
echo "  npm run help         # 查看所有命令"
echo "  python userinput.py  # 使用 Python 助手工具"
echo ""
echo "📖 查看 README.md 获取完整使用说明"