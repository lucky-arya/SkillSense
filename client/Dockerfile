# ── Stage 1: Build shared types ─────────────────────────────
FROM node:20-alpine AS shared-build
WORKDIR /app/shared
COPY shared/package.json shared/tsconfig.json ./
COPY shared/src ./src
RUN npm install && npm run build

# ── Stage 2: Build client ──────────────────────────────────
FROM node:20-alpine AS client-build
WORKDIR /app
COPY client/package.json client/tsconfig.json client/vite.config.ts ./client/
COPY client/tailwind.config.js client/postcss.config.js ./client/
COPY --from=shared-build /app/shared ./shared
RUN cd client && npm install
COPY client/src ./client/src
COPY client/index.html ./client/
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN cd client && npm run build

# ── Stage 3: Serve with nginx ─────────────────────────────
FROM nginx:alpine AS client
COPY --from=client-build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
