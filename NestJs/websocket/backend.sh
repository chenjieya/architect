#!/bin/bash

REMOTE_USER="alvis"
REMOTE_HOST="alvis.org.cn"
REMOTE_DIR="/project/docker/chat-room"
REMOTE_PASS="chenjie+00"

echo "🚀 开始上传 NestJS 项目..."

# cd ./socket-io-chat-room  # 进入项目目录


# 1. 创建排除列表文件
cat > .rsync-exclude << EOF
dist/
node_modules/
test/
.git/
.DS_Store
*.log
coverage/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.idea/
.vscode/
EOF

# 2. 备份远程后端文件夹
echo "🔧 备份文件"
sshpass -p "${REMOTE_PASS}" ssh -T ${REMOTE_USER}@${REMOTE_HOST} << EOF
		set -e  # 遇到错误立即退出

    # 备份旧版本（如果存在）
    if [ -d "${REMOTE_DIR}/socket-io-chat-room" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        echo "备份旧版本前端代码 => ${REMOTE_DIR}/socket-io-chat-room_\${timestamp}"
        sudo mv "${REMOTE_DIR}/socket-io-chat-room" "${REMOTE_DIR}/socket-io-chat-room_\${timestamp}"
    else
        echo "警告：${REMOTE_DIR}/socket-io-chat-room 文件夹不存在，无需备份"
    fi
EOF

# 3. 使用 tar 打包并传输
echo "📦 打包并传输文件..."
tar --exclude-from=.rsync-exclude -czf - ./socket-io-chat-room | \
sshpass -p "${REMOTE_PASS}" ssh ${REMOTE_USER}@${REMOTE_HOST} \
    "cd ${REMOTE_DIR} && tar xzf -"

# 3. 清理本地临时文件
rm -f .rsync-exclude


echo "✨ 操作完成！"