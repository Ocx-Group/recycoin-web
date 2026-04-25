# Usa una imagen de Node para construir la app
FROM node:22-alpine AS build

# Configura el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de Angular y elimina la caché de npm
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copia el resto del código
COPY . .

# Construye la aplicación Angular en modo producción
RUN npm run build:prod

# Usa una imagen de Nginx para servir la aplicación
FROM nginx:1.27-alpine

# Copia los archivos de construcción al contenedor de Nginx
COPY --from=build /app/dist/main/browser /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
