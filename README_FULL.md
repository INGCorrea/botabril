# Dentisteam Bot - WhatsApp Appointment Scheduler

Asistente de WhatsApp para agendar citas dentales automaticamente.

## 📋 Características

- ✅ **Flujo completo de citas**: Nombre → Teléfono → Síntomas → Fecha
- 📁 **Almacenamiento local**: Citas guardadas en JSON
- ☁️ **Pausable**: Google Sheets integrado pero pausado por defecto
- 🚀 **Listo para AWS**: Configurado para EC2 con PM2
- 📱 **WhatsApp Web**: Usa WhatsApp Web Client

---

## 🛠️ Tecnologías

- **Node.js 18+**
- **whatsapp-web.js** - Cliente de WhatsApp Web
- **dotenv** - Manejo de variables de entorno
- **PM2** - Process manager para AWS
- **Google Sheets API** (opcional/pausado)

---

## 📦 Instalación Local

```bash
# Clonar/descargar proyecto
cd botabril

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Iniciar bot
npm start
```

---

## 🚀 Deployment en AWS EC2

### Opción 1: Setup Automático (Recomendado)
```bash
# En tu servidor EC2:
bash setup_aws.sh
pm2 start ecosystem.config.js
pm2 save
```

### Opción 2: Setup Manual
Ver [DEPLOYMENT_AWS_EC2.md](./DEPLOYMENT_AWS_EC2.md) para instrucciones detalladas.

### Opción 3: Setup Rápido
Ver [AWS_QUICK_START.md](./AWS_QUICK_START.md) para resumen rápido.

---

## 📊 Estructura de Datos

### Cita Guardada
```json
{
  "id": 1234567890,
  "timestamp": "2024-05-03T10:30:00.000Z",
  "nombre": "Juan Pérez",
  "telefono": "+52 123 456 7890",
  "sintomas": "Dolor en la muela inferior derecha",
  "fecha": "Próximo lunes a las 10:00"
}
```

---

## 🎮 Comandos en Producción (AWS)

```bash
# Ver estado del bot
pm2 status

# Ver logs en vivo
pm2 logs dentisteam-bot

# Reiniciar bot
pm2 restart dentisteam-bot

# Parar bot
pm2 stop dentisteam-bot

# Ver recursos (CPU, memoria)
pm2 monit
```

---

## 🔧 Configuración

### Variables de Entorno (`.env`)
```
NODE_ENV=production
PORT=3000

# PAUSADO - Descomentar para activar Google Sheets:
# GOOGLE_SHEETS_SPREADSHEET_ID=tu_id
# GOOGLE_SHEETS_CREDENTIALS=/path/to/creds.json
```

---

## 📱 Comandos del Bot en WhatsApp

| Comando | Descripción |
|---------|------------|
| `1` o `cita` | Iniciar flujo de agendar cita |
| `2` o `info` | Información general de la clínica |
| `3` o `horarios` | Horarios y ubicación |
| `4` o `contacto` | Información de contacto |
| `menu` | Ver menú de opciones |
| `cancelar` | Cancelar flujo actual |

---

## 📂 Estructura de Directorios

```
botabril/
├── index.js                    # Punto de entrada principal
├── config.js                   # Configuración central
├── citas.json                  # Base de datos local
├── handlers/
│   └── messageHandler.js       # Lógica de mensajes
├── utils/
│   ├── googleSheets.js         # Integración GSheets (pausado)
│   ├── qrGenerator.js          # Generador de QR
│   ├── storage.js              # Almacenamiento de citas
│   └── validators.js           # Validadores de datos
├── ecosystem.config.js         # Configuración PM2
├── .env.example                # Template variables entorno
├── DEPLOYMENT_AWS_EC2.md       # Guía detallada AWS
├── AWS_QUICK_START.md          # Setup rápido
└── setup_aws.sh                # Script setup automático
```

---

## ⚙️ Google Sheets (Pausado)

Actualmente pausado para simplificar el deployment. Para reactivar:

1. **Editar** `utils/storage.js` y descomentar las líneas de `appendCitaRow()`
2. **Obtener credenciales** de Google Cloud Console
3. **Configurar variables de entorno**:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=tu_id
   GOOGLE_SHEETS_CREDENTIALS=/path/to/credentials.json
   ```
4. **Reiniciar bot**: `pm2 restart dentisteam-bot`

---

## 🐛 Troubleshooting

### Bot no inicia en AWS
```bash
# Ver logs de error
pm2 logs dentisteam-bot --err

# Reinstalar dependencias
npm ci
```

### Problemas con Chromium
```bash
# Instalar librerías faltantes
sudo apt install -y libxss1 libgconf-2-4
```

### Bot se desconecta constantemente
- Verifica conexión a internet
- Aumenta timeout en `index.js`
- Revisa logs: `pm2 logs dentisteam-bot`

---

## 💰 Costos AWS (Estimado)

- **EC2 t2.micro**: $0/mes (Tier gratuito, 12 meses)
- **Almacenamiento**: ~$1/mes (20GB)
- **Bandwidth**: Depende del tráfico

⚠️ Después de 12 meses, verifica precios en AWS Console.

---

## 📞 Soporte

Para problemas:
1. Revisa los logs: `pm2 logs dentisteam-bot`
2. Verifica variables de entorno: `cat .env`
3. Reinicia bot: `pm2 restart dentisteam-bot`

---

## 📝 Notas

- Las citas se guardan automáticamente en `citas.json`
- El bot mantiene sesiones de usuarios en memoria
- QR se muestra solo la primera vez (escanea para vincular)
- Bot está preparado para 24/7 en EC2

---

**Versión**: 1.1.0  
**Última actualización**: 2024-05-03  
**Estado**: ✅ Listo para AWS EC2
