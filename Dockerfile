FROM node:16.3.0-alpine

ENV BIND_PORT=8080
ENV CORE_URL="http://localhost:5000"

WORKDIR /app

COPY package.json .

RUN npm i

ADD src/ ./src
ADD tsconfig.json ./

RUN npm run tsc

CMD [ "npm", "run", "start_lite" ]