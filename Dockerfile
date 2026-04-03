FROM node:20-alpine

WORKDIR /app/backend

# Install backend dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production || npm install --only=production

# Copy backend source only
COPY backend/src ./src

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "src/index.js"]