FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY server.js ./
COPY public ./public
CMD ["node", "server.js"]
