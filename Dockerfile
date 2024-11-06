# Etapa 1: Construcción del proyecto
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json (si existe) para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --silent

# Copiar todo el código fuente al contenedor
COPY . .

# Compilar la aplicación Angular
RUN npm run build --configuration CryptoVault

# Etapa 2: Imagen ligera de producción con servidor web Nginx
FROM nginx:alpine

# Copiar los archivos compilados desde la etapa anterior
COPY --from=build /app/dist/crypto-vault /usr/share/nginx/html

# Copiar tu archivo nginx.conf personalizado
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80 para el servidor web
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
