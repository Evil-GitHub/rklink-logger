#!/bin/bash

# 当任何命令失败时，立即退出脚本
set -e

# 检查是否提供了版本类型参数（patch, minor, major）
if [ -z "$1" ]; then
  echo "错误：请提供版本更新类型。"
  echo "用法: ./release.sh <patch|minor|major>"
  exit 1
fi

# 检查 Git 工作目录是否干净
if ! git diff-index --quiet HEAD --; then
  echo "错误：Git 工作目录有未提交的更改。请先提交或暂存您的更改。"
  exit 1
fi

echo "
🚀 开始构建项目..."
npm run build

# 2. 更新版本号
echo "
🔖 正在更新版本号..."
npm version $1 -m "chore(release): %s"

# 3. 推送代码和标签
echo "
📤 正在推送代码和标签..."
git push && git push --tags

# 4. 发布到 NPM
echo "
🎉 正在发布到 NPM..."
npm publish

echo "
✅ 发布成功！"

