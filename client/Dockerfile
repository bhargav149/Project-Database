FROM node:15.5.0

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i lucide-react

RUN npm i axios

COPY . .

EXPOSE 3000

CMD ["npm", "start"]