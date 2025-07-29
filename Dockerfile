# --- Étape 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build

# --- Étape 2: Production ---
FROM node:18-alpine

WORKDIR /app

# Copie les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 👇 AJOUTEZ CES DEUX LIGNES
# Copie le fichier de documentation
COPY --from=builder /app/swagger.yaml ./
# Crée le dossier pour les uploads d'images
RUN mkdir -p uploads

# Expose le port sur lequel l'application va tourner
EXPOSE 3000

# La commande pour démarrer l'application
CMD ["node", "dist/server.js"]