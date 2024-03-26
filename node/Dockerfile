# define version of Node
FROM node:16
# create app directory
WORKDIR /usr/src/app
# install app dependencies
COPY package*.json ./
RUN npm install
# bundle app's source code
COPY . .
# expose app on port
EXPOSE 8080
# command to run app
CMD [ "node", "server.js" ]
