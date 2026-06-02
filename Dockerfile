FROM node:20.6-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js ./
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
