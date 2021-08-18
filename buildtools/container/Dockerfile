FROM node:14.17.3

# Install dependencies: curl, git, jq, python2 and jre8.
RUN apt-get update && \
    apt-get install -y curl git jq python openjdk-8-jre-headless

# Install npm at 6.14.13.
RUN npm install --global npm@6.14.13

# Install hub
RUN curl -fsSL --output hub.tgz https://github.com/github/hub/releases/download/v2.11.2/hub-linux-amd64-2.11.2.tgz
RUN tar --strip-components=2 -C /usr/bin -xf hub.tgz hub-linux-amd64-2.11.2/bin/hub

# Install the lastest Chrome stable version.
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install
