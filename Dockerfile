FROM node:6

# Create app directory
RUN mkdir -p /opt/landscapes

# Copy app source
COPY . /opt/landscapes

# Install app dependencies
RUN cd /opt/landscapes/ && npm install --quiet && npm cache clean && chmod +x config_ip.sh

# Set environment vars
ENV MONGO_SEED true

# Package the app
RUN cd /opt/landscapes/ && npm run build && npm run package

# Set work dir
WORKDIR /opt/landscapes/dist

EXPOSE 8080

CMD [ "npm", "run", "prod" ]
