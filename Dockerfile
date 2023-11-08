FROM docker.io/oven/bun

RUN mkdir /shortener
WORKDIR /shortener

COPY ./package.json ./
COPY ./bun.lockb ./

RUN bun install

COPY . .
COPY ./.env.example ./.env

RUN bun run build

EXPOSE 3000

ENTRYPOINT [ "bun", "./build/index.js"]