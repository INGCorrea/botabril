# 🚀 Guía de Deployment en AWS EC2

## Requisitos Previos
- Cuenta de AWS
- Terminal/SSH acceso a tu máquina EC2
- Bot listo en el repositorio (ya lo está)

---

## Paso 1: Crear Instancia EC2 en AWS

1. Ve a [AWS Console](https://console.aws.amazon.com/)
2. Busca **EC2** y selecciona "Lanzar instancia"
3. Configuración recomendada:
   - **AMI**: Ubuntu 22.04 LTS (Tier gratuito)
   - **Tipo**: t2.micro (Tier gratuito)
   - **Almacenamiento**: 20 GB (suficiente)
   - **Security Group**: Abre puerto 22 (SSH) para ti

4. Descarga el archivo `.pem` de la llave privada (guárdalo seguro)
5. Anota la **IP pública** de tu instancia (ej: `54.123.45.67`)

---

## Paso 2: Conectar a tu Servidor EC2

```bash
# Dale permisos a tu llave
chmod 400 tu-llave.pem

# Conéctate al servidor
ssh -i tu-llave.pem ubuntu@54.123.45.67
```

---

## Paso 3: Preparar el Servidor

Una vez conectado al servidor, ejecuta:

```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar dependencias de Chrome/Chromium
sudo apt install -y chromium-browser chromium-chromedriver

# Instalar Git
sudo apt install -y git

# Instalar PM2 (para mantener el bot corriendo)
sudo npm install -g pm2

# Verificar instalaciones
node --version   # v18.x.x
npm --version    # 9.x.x
pm2 --version    # 5.x.x
```

---

## Paso 4: Descargar tu Proyecto

```bash
# Crear directorio para el bot
mkdir -p ~/bots && cd ~/bots

# Clonar tu repositorio (o copiar los archivos)
git clone <tu-repositorio-url>
cd botabril

# Instalar dependencias
npm install
```

---

## Paso 5: Configurar Variables de Entorno

```bash
# Crear archivo .env en el servidor
nano .env
```

Copia y pega lo siguiente:

```
NODE_ENV=production
PORT=3000
```

Presiona:
- `Ctrl + O` para guardar
- `Enter` para confirmar
- `Ctrl + X` para salir

---

## Paso 6: Iniciar el Bot con PM2

```bash
# Iniciar el bot
pm2 start index.js --name "dentisteam-bot"

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs dentisteam-bot

# (Opcional) Hacer que PM2 inicie automáticamente al reiniciar
pm2 startup
pm2 save
```

---

## Paso 7: Sincronizar Citas con tu Computadora

Las citas se guardan en `citas.json`. Para descargarlas:

```bash
# Desde tu computadora local:
scp -i tu-llave.pem ubuntu@54.123.45.67:~/bots/botabril/citas.json ./citas_backup.json
```

O usa el archivo `citas.json` directamente en el servidor para consultar.

---

## Comandos Útiles para Gestionar el Bot

```bash
# Ver estado del bot
pm2 status

# Ver logs
pm2 logs dentisteam-bot

# Reiniciar el bot
pm2 restart dentisteam-bot

# Detener el bot
pm2 stop dentisteam-bot

# Eliminar del gestor PM2
pm2 delete dentisteam-bot

# Ver recursos (CPU, memoria)
pm2 monit
```

---

## Troubleshooting

### El bot no inicia o aparecen errores
```bash
# Ver logs detallados
pm2 logs dentisteam-bot --err

# Verificar que Node y npm están instalados
node --version
npm --version
```

### Problemas con Chromium/Puppeteer
```bash
# Instalar librerías adicionales
sudo apt install -y libxss1 libgconf-2-4 libx11-6 libx11-xcb1 libxcb1
```

### El bot se desconecta constantemente
- Aumenta el timeout en `config.js`
- Verifica la conexión a internet del servidor
- Revisa que tengas suficiente RAM

---

## Próximos Pasos

1. **Comparte el IP de tu servidor**: Tu prima puede comunicarse con el bot ahora
2. **Recibe feedback**: Las citas se guardan en `citas.json`
3. **Reactivar Google Sheets** (cuando ya no quieras pausado):
   - Descomenta las líneas en `utils/storage.js`
   - Añade variables de entorno necesarias

---

## Costos Estimados (AWS)

- **EC2 t2.micro**: $0/mes (Tier gratuito, 12 meses)
- **Almacenamiento**: ~$1/mes (20GB, Tier gratuito parcial)
- **Bandwidth**: Depende del tráfico

⚠️ **Nota**: El tier gratuito es solo los primeros 12 meses. Después verifica los precios.

---

## Detener y Limpiar

Cuando termines de probar:

```bash
# Detener el bot
pm2 stop dentisteam-bot

# Parar la instancia EC2 desde AWS Console
# (No la elimines aún, puedes reiniciarla después)
```

---

**¿Preguntas?** Revisa los logs con `pm2 logs dentisteam-bot` y chequea tu conexión SSH. 🚀
