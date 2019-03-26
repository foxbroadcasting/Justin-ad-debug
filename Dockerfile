FROM node:11.12-slim

# Add source code and install project
WORKDIR /opt/app
COPY . /opt/app
RUN npm install

CMD ["node", "index.js"]
