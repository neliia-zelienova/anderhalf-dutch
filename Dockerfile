FROM ghcr.io/pnpm/pnpm:11 AS base
RUN pnpm runtime set node 24 -g

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --store-dir /var/cache/pnpm --frozen-lockfile
RUN pnpm turbo run --filter=api build
RUN pnpm deploy --filter=api --prod /prod/api --ignore-scripts

FROM node:24-slim AS api
ENV NODE_ENV=production
USER node
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 3000
CMD [ "node", "dist/main.js" ]