FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Устанавливаем serve
RUN npm install -g serve

# Проверяем, что serve установлен
RUN which serve && serve --version

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]