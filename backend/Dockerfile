# Build from the MONOREPO ROOT: docker build -f backend/Dockerfile .
# (needed so the npm workspace can resolve the sibling `shared` package)

FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
RUN npm ci

COPY shared/ shared/
COPY backend/ backend/
RUN npm run build --workspace shared \
 && npm run build --workspace backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/backend/dist ./dist
COPY --from=build /repo/backend/package.json ./package.json
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/shared/dist ./node_modules/@teamboard/shared/dist
COPY --from=build /repo/shared/package.json ./node_modules/@teamboard/shared/package.json

EXPOSE 4000
CMD ["node", "dist/main.js"]
