FROM node:20-alpine

WORKDIR /app

# Install production dependencies first so this layer is cached
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Don't run as root
USER node

CMD ["node", "src/server.js"]
