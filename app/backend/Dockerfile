FROM node:18-alpine

WORKDIR /app

COPY package*.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]