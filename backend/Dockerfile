FROM node:18

WORKDIR /backend

COPY . .

RUN rm -rf node_modules

RUN  npm i -g @nestjs/cli

EXPOSE 3001

RUN npm install

RUN IP_ADDR=$(ip route show | grep default | awk '{print $3}')

CMD ["npm", "run", "start:dev"]


