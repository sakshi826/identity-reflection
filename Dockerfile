FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server ./server
COPY database ./database
COPY --from=builder /app/dist ./dist

# Phase 2 — Docker Environment Variables
ENV DATABASE_URL=$DATABASE_URL
ENV DB_PROJECT_ID=$DB_PROJECT_ID
ENV DB_API_KEY=$DB_API_KEY
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "server/server.js"]
