#!/bin/bash
# Script de instalación automatizado para AWS EC2
# Uso: bash setup_aws.sh

set -e  # Exit on error

echo "🚀 Iniciando setup de Dentisteam Bot en AWS EC2..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Actualizar paquetes
echo -e "${BLUE}[1/5] Actualizando paquetes...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js
echo -e "${BLUE}[2/5] Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar dependencias de Chrome
echo -e "${BLUE}[3/5] Instalando Chromium y dependencias...${NC}"
sudo apt install -y chromium-browser libxss1 libgconf-2-4 libx11-6 libx11-xcb1 libxcb1 git

# 4. Instalar PM2 globalmente
echo -e "${BLUE}[4/5] Instalando PM2...${NC}"
sudo npm install -g pm2

# 5. Instalar dependencias del proyecto
echo -e "${BLUE}[5/5] Instalando dependencias del proyecto...${NC}"
npm install

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "NODE_ENV=production" > .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
fi

# Resumen
echo ""
echo -e "${GREEN}✅ Setup completado exitosamente!${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Inicia el bot: pm2 start ecosystem.config.js"
echo "2. Verifica estado: pm2 status"
echo "3. Ver logs: pm2 logs dentisteam-bot"
echo ""
echo "Versiones instaladas:"
node --version
npm --version
pm2 --version
