FROM oven/bun AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY . .

CMD ["bun", "run", "src/index.ts"]
