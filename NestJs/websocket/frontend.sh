#!/bin/bash

REMOTE_USER="alvis"
REMOTE_HOST="alvis.org.cn"
REMOTE_DIR="/project/docker/chat-room"
REMOTE_PASS="chenjie+00"

echo "切换到前端工程目录"
cd ./ten_thousand_art_languages_web && pnpm build-only


# 备份文件
echo "🔧 备份文件"
sshpass -p "${REMOTE_PASS}" ssh -T ${REMOTE_USER}@${REMOTE_HOST} << EOF
		set -e  # 遇到错误立即退出
    echo "开始执行远程操作"
    
    # 备份旧版本（如果存在）
    if [ -d "${REMOTE_DIR}/dist" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        echo "备份旧版本前端代码 => ${REMOTE_DIR}/dist_\${timestamp}"
        sudo mv "${REMOTE_DIR}/dist" "${REMOTE_DIR}/dist_\${timestamp}"
    else
        echo "警告：${REMOTE_DIR}/dist 文件夹不存在，无需备份"
    fi
EOF

# 上传到目录
echo "📤 上传到服务器目录..."
sshpass -p "${REMOTE_PASS}" rsync -av --progress ./dist ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/


echo "✨ 全部操作完成"