FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY package.json package-lock.json* ./
RUN npm install --production || npm install --only=production

# Copy backend source only
COPY src ./src

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "src/index.js"]