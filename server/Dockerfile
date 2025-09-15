FROM ghcr.io/puppeteer/puppeteer:24.1.1

USER root

# Install only what you really need (ffmpeg for media processing)
RUN apt-get update \
    && apt-get install -y ffmpeg procps \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/* /tmp/* \
    && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
    && chmod +x /usr/sbin/wait-for-it.sh

# Puppeteer already works with the bundled Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["node", "server.js"]
