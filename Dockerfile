# build stage
FROM node:lts-alpine as build-stage

WORKDIR /app

COPY package*.json ./
COPY .babelrc ./
COPY postinstall.js ./
RUN npm install

COPY . .

RUN npm run build

# production stage
FROM alpine:3.18

ENV GID 1000
ENV UID 1000
ENV PORT 8060
ENV SUBFOLDER "/_"
ENV INIT_ASSETS 1

RUN addgroup -S lighttpd -g ${GID} && adduser -D -S -u ${UID} lighttpd lighttpd && \
    apk add -U --no-cache lighttpd

WORKDIR /www

COPY lighttpd.conf /lighttpd.conf
COPY entrypoint.sh /entrypoint.sh
COPY --from=build-stage --chown=${UID}:${GID} /app/dist /www/
COPY --from=build-stage --chown=${UID}:${GID} /app/dist/assets /www/default-assets

USER ${UID}:${GID}

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

EXPOSE ${PORT}

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
