# ✅ CAMBIOS REALIZADOS - Preparación para AWS EC2

## 📋 Resumen

Tu bot Dentisteam está **listo para AWS EC2**. Google Sheets está **pausado** y los datos se guardan localmente.

---

## ✨ Cambios Implementados

### 1. **Google Sheets Pausado** ⏸️
**Archivo**: `utils/storage.js`
- Google Sheets ahora está desactivado
- Las citas se guardan solo en `citas.json` localmente
- Cuando reactives: descomenta las líneas en `utils/storage.js` líneas 25-31

```javascript
// Cómo reactivar después:
if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    appendCitaRow(newCita)
        .then(() => console.log('✅ Cita enviada a Google Sheets'))
        .catch((error) => console.error('⚠️ Error:', error.message));
}
```

### 2. **Config Actualizada para AWS** ⚙️
**Archivo**: `config.js`
- Removida ruta hardcodeada de Edge (C:\Program Files...)
- Ahora usa Chromium del sistema en AWS
- Agregados argumentos de seguridad para sandbox

### 3. **PM2 Configurado** 🔄
**Archivo**: `ecosystem.config.js`
- PM2 mantendrá el bot corriendo 24/7
- Auto-reinicia si se cae
- Logs automáticos en `logs/` directorio
- Memoria máxima: 500MB

### 4. **NPM Scripts Nuevos** 📦
**Archivo**: `package.json`
```bash
npm run pm2:start      # Iniciar bot con PM2
npm run pm2:stop       # Parar bot
npm run pm2:restart    # Reiniciar bot
npm run pm2:logs       # Ver logs
```

### 5. **Documentación Completa** 📚
- ✅ **DEPLOYMENT_AWS_EC2.md** - Guía paso a paso detallada
- ✅ **AWS_QUICK_START.md** - Resumen rápido para prisa
- ✅ **README_FULL.md** - Documentación completa del proyecto
- ✅ **setup_aws.sh** - Script de instalación automática
- ✅ **.env.example** - Template de variables de entorno

### 6. **Estructura de Logs** 📁
- Directorio `/logs` creado para guardar logs de PM2

---

## 🚀 Pasos para Lanzar en AWS EC2

### Paso 1: Crear Instancia AWS
1. Ve a https://console.aws.amazon.com/
2. EC2 → Lanzar instancia
3. **Recomendaciones**:
   - AMI: Ubuntu 22.04 LTS (Tier gratuito)
   - Tipo: t2.micro (Tier gratuito)
   - Storage: 20GB
   - Security: Abre puerto 22 (SSH)

### Paso 2: Conectar por SSH
```bash
chmod 400 tu-llave.pem
ssh -i tu-llave.pem ubuntu@TU-IP-EC2
```

### Paso 3: Setup Automático (Opción Rápida)
```bash
# Descargar proyecto
git clone TU-REPO botabril && cd botabril

# Ejecutar setup automático
bash setup_aws.sh

# Crear archivo .env
echo "NODE_ENV=production" > .env

# Iniciar
pm2 start ecosystem.config.js
pm2 save
```

### Paso 4: Verificar que está Corriendo
```bash
pm2 status
pm2 logs dentisteam-bot
```

---

## 📱 Ahora Tu Prima Puede Probar

El bot estará corriendo 24/7 en la nube. Las citas se guardan en:
```
/home/ubuntu/botabril/citas.json
```

Para descargar citas:
```bash
scp -i tu-llave.pem ubuntu@TU-IP-EC2:~/botabril/citas.json ./citas_backup.json
```

---

## 🔄 Reactivar Google Sheets (Cuando Quieras)

1. **Editar** `utils/storage.js` - descomenta líneas 25-31
2. **Obtener credenciales** de Google Cloud Console
3. **Agregar al .env**:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id
   GOOGLE_SHEETS_CREDENTIALS=/path/to/credentials.json
   ```
4. **Reiniciar**:
   ```bash
   pm2 restart dentisteam-bot
   ```

---

## 📊 Estructura de Archivos Nuevos

```
botabril/
├── DEPLOYMENT_AWS_EC2.md      ← Guía detallada
├── AWS_QUICK_START.md         ← Resumen rápido
├── README_FULL.md             ← Documentación completa
├── setup_aws.sh               ← Script automático
├── ecosystem.config.js        ← Config PM2
├── .env.example               ← Template env
├── logs/                       ← Directorio para logs
└── [resto de archivos sin cambios]
```

---

## 💡 Comandos Útiles AWS

```bash
# Ver estado
pm2 status

# Ver logs vivos
pm2 logs dentisteam-bot

# Reiniciar
pm2 restart dentisteam-bot

# Parar
pm2 stop dentisteam-bot

# Recursos
pm2 monit

# Ver procesos
ps aux | grep node
```

---

## ✅ Checklist Final

- ✔️ Google Sheets pausado
- ✔️ Config actualizada para AWS
- ✔️ PM2 configurado
- ✔️ Scripts NPM listos
- ✔️ Documentación completa
- ✔️ Setup automático disponible
- ✔️ Listo para 24/7 en la nube

---

## 🎯 Próximas Acciones

1. **Crea instancia AWS EC2** (5 minutos)
2. **Conéctate por SSH** (1 minuto)
3. **Ejecuta `bash setup_aws.sh`** (3 minutos)
4. **Inicia bot con PM2** (1 minuto)
5. **¡Comparte IP con tu prima!** ✅

**Tiempo total estimado**: 15-20 minutos

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Bot no inicia | `pm2 logs dentisteam-bot --err` |
| Chromium error | `sudo apt install libxss1 libgconf-2-4` |
| Se cae constantemente | Verifica internet, revisa logs |
| Quiero ver citas | `cat citas.json` |
| Descargar citas | `scp -i llave.pem ubuntu@IP:~/botabril/citas.json ./` |

---

**Estado del Proyecto**: 🟢 LISTO PARA PRODUCCIÓN

Todos los archivos están en tu carpeta `/botabril`. Simplemente:
1. Comparte el código al servidor AWS
2. Ejecuta `setup_aws.sh`
3. Inicia con PM2
4. ¡Listo!

🚀 **¡A volar en la nube!**
