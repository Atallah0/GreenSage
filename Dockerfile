FROM node:16-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Set a default value for MONGO_URI during the build
ARG MONGO_URI="mongodb://localhost:27017/default"

# Set environment variable to the provided or default value
ENV MONGO_URI=${MONGO_URI}

CMD [ "npm", "start" ]
