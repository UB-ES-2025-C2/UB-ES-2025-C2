FROM node:22

WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto (Vite usa 5173 por defecto)
EXPOSE 5173

# Habilitar modo polling para hot-reload dentro de Docker
ENV CHOKIDAR_USEPOLLING=true

# Comando por defecto: correr el servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host"]
