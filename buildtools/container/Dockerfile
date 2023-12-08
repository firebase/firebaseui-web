FROM ubuntu:latest

# Install dependencies: curl, git, jq, python2 and jre8.
RUN apt-get update && \
    apt-get install -y curl git jq python-is-python3 openjdk-11-jre-headless nodejs npm wget

# Print Node version and npm version
RUN node -v
RUN npm -v

# Install hub
RUN curl -fsSL --output hub.tgz https://github.com/github/hub/releases/download/v2.11.2/hub-linux-amd64-2.11.2.tgz
RUN tar --strip-components=2 -C /usr/bin -xf hub.tgz hub-linux-amd64-2.11.2/bin/hub

# Install the lastest Chrome stable version.
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install

# Pin Chrome v119 because we're pinning this version in CI.
# TODO: Install the lastest Chrome stable version once we unpin chrome version in CI.
RUN wget https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/119.0.6045.105/linux64/chrome-linux64.zip
RUN dpkg -i google-chrome-stable_119.0.6045.105_amd64.deb; apt-get -fy install
