# Build from the MONOREPO ROOT: docker build -f frontend/Dockerfile .
# (needed so the npm workspace can resolve the sibling `shared` package)

FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY frontend/package.json frontend/
RUN npm ci

COPY shared/ shared/
COPY frontend/ frontend/

# Vite inlines VITE_* vars at BUILD time, not runtime — they must be build args,
# not container environment variables, or the compiled bundle won't see them.
ARG VITE_API_URL
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_API_URL=$VITE_API_URL \
    VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME \
    VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET

RUN npm run build --workspace shared \
 && npm run build --workspace frontend

FROM nginx:alpine AS runtime
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
