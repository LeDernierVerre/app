FROM node:24.16.0-alpine AS build
WORKDIR /app

RUN corepack enable

# Copy package.json and your lockfile
COPY package.json package-lock.yaml ./

# Install dependencies
RUN npm i

# Copy the entire project
COPY . ./

# Build the project
RUN pnpm run build

FROM node:24.16.0-alpine
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "/app/server/index.mjs"]