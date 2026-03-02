#!/bin/bash
# deploy-xiangqi.sh - Xiangqi 部署脚本
# 使用: ./deploy-xiangqi.sh

set -e  # 遇到错误立即退出

PROJECT_DIR="/root/.openclaw/workspace/projects/carrick-xiangqi"
DEPLOY_DIR="/var/www/xiangqi.carrick7.com"
DOMAIN="xiangqi.carrick7.com"

echo "🏮 Xiangqi 部署开始..."

cd "$PROJECT_DIR"

# 1. 构建
echo "📦 步骤1: 构建项目..."
bash build.sh

# 2. 验证构建输出
echo "🔍 步骤2: 验证构建..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ 错误: 构建失败，dist/index.html 不存在"
    exit 1
fi

TITLE=$(grep -o '<title>[^<]*</title>' dist/index.html | sed 's/<[^>]*>//g')
echo "   页面标题: $TITLE"

# 3. 部署
echo "📤 步骤3: 部署文件..."
sudo mkdir -p "$DEPLOY_DIR"
sudo rm -rf "$DEPLOY_DIR"/*
sudo cp -r dist/* "$DEPLOY_DIR/"

# 4. 验证部署
echo "✅ 步骤4: 验证部署..."
sleep 2  # 等待Caddy刷新
DEPLOYED_TITLE=$(curl -s "https://$DOMAIN" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')

if [ "$TITLE" == "$DEPLOYED_TITLE" ]; then
    echo "   ✅ 部署验证通过: $DEPLOYED_TITLE"
else
    echo "   ⚠️ 警告: 部署标题不匹配"
    echo "   期望: $TITLE"
    echo "   实际: $DEPLOYED_TITLE"
fi

# 5. 清除CDN/代理缓存（如有）
echo "🔄 步骤5: 刷新缓存..."
sudo systemctl reload caddy 2>/dev/null || true

echo ""
echo "🎉 Xiangqi 部署成功!"
echo "🌐 访问: https://$DOMAIN"
echo ""
echo "提示: 如果仍看到旧版本，请 Ctrl+F5 强制刷新浏览器"

# 自动触发基础设施重载（除非跳过）
if [ -z "$SKIP_INFRA_RELOAD" ]; then
    echo "🔄 触发基础设施重载..."
    cd /root/.openclaw/workspace/projects/carrick-infra
    bash deploy.sh
fi
