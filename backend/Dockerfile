FROM node:18-alpine

WORKDIR /app

# Instalar dependências primeiro (aproveitar cache do Docker)
COPY package*.json ./
RUN npm ci --only=production

# Copiar código-fonte
COPY src/ ./src/

# Usuário não-root por segurança
RUN addgroup -g 1001 -S nodejs && adduser -S clinica -u 1001
USER clinica

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "src/server.js"]
