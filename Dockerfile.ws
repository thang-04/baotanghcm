FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY ws-server.js ./
COPY server ./server
COPY src/lib/roomFourSpatial.json ./src/lib/roomFourSpatial.json
EXPOSE 3001
CMD ["node", "ws-server.js"]
