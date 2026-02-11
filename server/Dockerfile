# ── Stage 1: Build shared types ─────────────────────────────
FROM node:20-alpine AS shared-build
WORKDIR /app/shared
COPY shared/package.json shared/tsconfig.json ./
COPY shared/src ./src
RUN npm install && npm run build

# ── Stage 2: Build server ──────────────────────────────────
FROM node:20-alpine AS server-build
WORKDIR /app
COPY server/package.json server/tsconfig.json ./server/
COPY --from=shared-build /app/shared ./shared
RUN cd server && npm install
COPY server/src ./server/src
RUN cd server && npm run build

# ── Stage 3: Production server ─────────────────────────────
FROM node:20-alpine AS server
WORKDIR /app
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/node_modules ./node_modules
COPY --from=shared-build /app/shared ./shared
COPY server/package.json ./
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.js"]
