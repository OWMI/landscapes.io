FROM node:6

# Create app directory
RUN mkdir -p /opt/landscapes

# Copy app source
COPY . /opt/landscapes

# Install app dependencies
RUN cd /opt/landscapes/ && npm install --quiet && npm cache clean

# Set environment vars
ENV MONGO_SEED true
ENV PUBLIC_IP 0.0.0.0

# Package the app
RUN cd /opt/landscapes/ && npm run build && npm run package

# Set work dir
WORKDIR /opt/landscapes/dist

EXPOSE 8080

CMD [ "npm", "run", "prod" ]
