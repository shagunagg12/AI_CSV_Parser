FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
