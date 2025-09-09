FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 5050
CMD ["node", "index.js"]
