
# other images
FROM node

# dir as container-root
WORKDIR /root

# cash-copied files from project to image
COPY package.json .

# instructions to compilling
RUN npm install

# other-copied files from project to image
COPY . .

# docker-environment declaration
# ENV PORT 12121

# setting inside-port for container
EXPOSE $PORT

# path to appending data through multiple containers
# VOLUME [ "/root/data" ]

# commands to each container run
CMD [ "npm", "run", "start:prod" ]
