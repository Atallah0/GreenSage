FROM node:16-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5000

ENV MONGO_URI="mongodb+srv://Atallah:Atallah@groceriescluster.q9vzhun.mongodb.net/Gorceriesdb?retryWrites=true&w=majority&appName=AtlasApp"

CMD [ "npm", "start" ]
