# 🚀 RESUMEN RÁPIDO - Deploy en AWS EC2

## ✅ Ya completado en tu máquina:
- ✔️ Google Sheets **pausado** (datos se guardan en `citas.json`)
- ✔️ Configuración actualizada para AWS
- ✔️ PM2 configurado para mantener el bot corriendo
- ✔️ Variables de entorno templated

---

## 📋 Pasos a Ejecutar en AWS EC2

### 1️⃣ Conexión SSH
```bash
ssh -i tu-llave.pem ubuntu@TU-IP-EC2
```

### 2️⃣ Setup Rápido (copiar y pegar todo)
```bash
# Instalar todo de una vez
sudo apt update && sudo apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
sudo apt install -y nodejs chromium-browser git && \
sudo npm install -g pm2

# Descargar proyecto
mkdir -p ~/bots && cd ~/bots && \
git clone TU-REPOSITORIO-URL botabril && \
cd botabril && npm install
```

### 3️⃣ Crear archivo `.env`
```bash
echo "NODE_ENV=production" > .env
```

### 4️⃣ Iniciar Bot
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🎯 Verificar que está Corriendo
```bash
pm2 status
pm2 logs dentisteam-bot
```

---

## 📱 ¡Tu Prima Puede Probar!
El bot estará corriendo 24/7. Las citas se guardan en:
- `/home/ubuntu/bots/botabril/citas.json`

Para descargar las citas a tu computadora:
```bash
scp -i tu-llave.pem ubuntu@TU-IP-EC2:~/bots/botabril/citas.json ./
```

---

## 🔄 Reactivar Google Sheets (Después)
Cuando ya no quieras pausarlo:
1. Edita `utils/storage.js` y descomenta las líneas de Google Sheets
2. Añade variables de entorno: `GOOGLE_SHEETS_SPREADSHEET_ID` y `GOOGLE_SHEETS_CREDENTIALS`
3. Ejecuta: `pm2 restart dentisteam-bot`

---

## 💡 Comandos Útiles
```bash
pm2 logs dentisteam-bot              # Ver logs en vivo
pm2 restart dentisteam-bot            # Reiniciar bot
pm2 stop dentisteam-bot               # Parar bot
pm2 delete dentisteam-bot             # Eliminar de PM2
pm2 monit                              # Ver recursos (CPU/RAM)
```

---

**¿Algo no funciona?** Revisa los logs: `pm2 logs dentisteam-bot` 🔍
