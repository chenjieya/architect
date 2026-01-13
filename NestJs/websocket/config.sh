#!/bin/bash

REMOTE_USER="alvis"
REMOTE_HOST="alvis.org.cn"
REMOTE_DIR="/project/docker/chat-room"
REMOTE_PASS="chenjie+00"

echo "🚀 开始上传 DockerCompose 项目..."

# 1. 使用 tar 打包并传输
echo "📦 打包并传输文件..."
tar -czf - ./docker-compose | \
sshpass -p "${REMOTE_PASS}" ssh ${REMOTE_USER}@${REMOTE_HOST} \
    "cd ${REMOTE_DIR} && tar xzf -"

echo "✨ 操作完成！"