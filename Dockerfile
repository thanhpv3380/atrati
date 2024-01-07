FROM node:18.16.0-alpine

WORKDIR /app
COPY package.json .

RUN npm i
COPY src/ /app/src

CMD [ "node", "src/index.js" ]
