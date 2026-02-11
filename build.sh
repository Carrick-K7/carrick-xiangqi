#!/bin/bash

# Xiangqi 项目构建脚本

echo "🏮 开始构建中国象棋项目..."

# 创建构建目录
mkdir -p dist

# 复制主要文件
echo "📦 复制文件..."
cp index.html dist/
cp -r engine dist/
cp -r src dist/

# 复制测试报告
cp test/e2e-test-report.json dist/

# 创建版本信息
echo "{
  \"version\": \"1.0.0\",
  \"buildTime\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
  \"features\": [
    \"9x10棋盘渲染\",
    \"各兵种走棋规则验证\",
    \"AI分析功能\",
    \"悔棋功能\",
    \"经典棋谱展示\",
    \"走法提示系统\",
    \"对战历史记录\"
  ]
}" > dist/version.json

echo "✅ 构建完成！"
echo "📂 构建目录: dist/"
echo ""
echo "📊 项目统计:"
echo "  - HTML: $(wc -l < dist/index.html) 行"
echo "  - JavaScript: $(find dist/src -name '*.js' -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}') 行"
echo "  - 引擎: $(find dist/engine -name '*.js' -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}') 行"
