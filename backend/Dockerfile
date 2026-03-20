FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Copy schema.sql to dist directory
COPY src/db/schema.sql dist/db/

EXPOSE 3001

CMD ["npm", "start"]
