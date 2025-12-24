# 1️⃣ 构建阶段
FROM node:20.15.1-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install pnpm -g

RUN pnpm install

COPY . .
RUN pnpm run build

# 2️⃣ 运行阶段
FROM node:20.15.1-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY public ./public/

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install pnpm -g

RUN pnpm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
