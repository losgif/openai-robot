# 使用 alpine 镜像作为基础镜像，因为它很小
FROM node:18-alpine

# 安装pnpm
RUN npm install -g pnpm

# 在容器中创建一个 app 目录作为工作区
WORKDIR /app

# 将 package.json 和 pnpm-lock.yaml （如果存在）复制到工作区
COPY package*.json pnpm-lock.yaml ./

# 运行 pnpm install 安装依赖项
ENV npm_config_user=root
RUN pnpm install

# 将应用程序的源代码复制到容器中的工作区
COPY . .

# 容器将在端口9000上运行node应用程序
EXPOSE 9000

RUN pnpm run build

# 使用npm start 运行应用程序
CMD ["pnpm", "start:prod"]
