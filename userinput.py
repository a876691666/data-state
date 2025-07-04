#!/usr/bin/env python3
"""
TVT Data State 项目助手工具
提供项目的快速操作和信息查询
"""

import os
import subprocess
import json
import sys

def get_project_info():
    """获取项目基本信息"""
    try:
        with open('package.json', 'r', encoding='utf-8') as f:
            package_info = json.load(f)
        return package_info
    except FileNotFoundError:
        print("❌ 错误：找不到 package.json 文件")
        return None

def run_command(command, description):
    """运行命令并显示描述"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 执行失败: {e}")
        if e.stderr:
            print(f"错误信息: {e.stderr}")
        return False

def main():
    print("🚀 TVT Data State 项目助手")
    print("=" * 40)
    
    # 获取项目信息
    project_info = get_project_info()
    if project_info:
        print(f"📦 项目: {project_info.get('name', 'Unknown')}")
        print(f"📋 版本: {project_info.get('version', 'Unknown')}")
        print(f"📝 描述: TypeScript 数据状态管理库")
    
    print("\n请选择操作:")
    print("1. 🏃‍♂️ 运行演示 (推荐)")
    print("2. 📖 查看帮助")
    print("3. 🔨 构建项目")
    print("4. 🚀 启动开发服务器") 
    print("5. 📋 显示项目状态")
    print("6. 🧹 清理项目")
    print("0. 退出")
    
    choice = input("\n请输入选择 (0-6): ").strip()
    
    commands = {
        "1": ("npm run demo", "运行项目演示"),
        "2": ("npm run help", "显示帮助信息"),
        "3": ("npm run build:all", "构建项目和文档"),
        "4": ("npm run dev", "启动开发服务器"),
        "5": ("npm run quick-start", "显示项目状态和快速操作"),
        "6": ("rm -rf node_modules dist && npm install", "清理并重新安装依赖")
    }
    
    if choice == "0":
        print("👋 再见!")
        return
    
    if choice in commands:
        command, description = commands[choice]
        success = run_command(command, description)
        if success:
            print("✅ 操作完成!")
        else:
            print("❌ 操作失败!")
    else:
        print("❌ 无效选择")
        
    print("\n💡 提示: 运行 'python userinput.py' 再次使用此工具")

if __name__ == "__main__":
    main()