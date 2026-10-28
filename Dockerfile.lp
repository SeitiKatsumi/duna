FROM node:24-alpine AS build
ARG SITE
ARG BASE_PATH
WORKDIR /app
COPY ${SITE}/package.json ${SITE}/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY deploy/runtime.ts /deploy/runtime.ts
COPY ${SITE}/ ./
ENV NEXT_TELEMETRY_DISABLED=1 DUNA_SELF_HOSTED=1
RUN npx next build --webpack

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 DUNA_SELF_HOSTED=1 PORT=3000 HOSTNAME=0.0.0.0 DUNA_DB_PATH=/data/leads.sqlite DUNA_MIGRATION=drizzle/schema.sql
COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/app/.next/static
COPY --from=build /app/public /app/app/public
COPY --from=build /app/drizzle/*.sql /app/app/drizzle/schema.sql
EXPOSE 3000
WORKDIR /app/app
CMD ["node", "server.js"]
