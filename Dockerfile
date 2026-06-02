FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json ./
RUN npm install --production

# Copiar código do bot
COPY server.js ./
COPY doug-exe/ ./doug-exe/

# Porta do servidor
EXPOSE 3000

CMD ["node", "server.js"]
