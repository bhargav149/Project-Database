# not being used rn; meant for vt container deployment
FROM node:15.5.0

WORKDIR /client/app

COPY package.json .

RUN npm install

RUN npm i lucide-react

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

FROM node

WORKDIR /server/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "app.js"]