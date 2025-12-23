# 1️⃣ 构建阶段
FROM node:20.15.1-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install pnpm

RUN pnpm install

COPY . .
RUN npm run build

# 2️⃣ 运行阶段
FROM node:20.15.1-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install pnpm

RUN pnpm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
