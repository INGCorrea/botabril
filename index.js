/**
 * Bot de Agendar Citas - Dentisteam
 * WhatsApp Web Client con manejo robusto de sesiones y validación
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');
const { handleMessage, getActiveUsers, setBotStartTime } = require('./handlers/messageHandler');
const { generateQRImage, deleteQRImage } = require('./utils/qrGenerator');

// Inicializar cliente
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: config.puppeteer
});

// Evento: Mostrar QR
client.on('qr', (qr) => {
    generateQRImage(qr).catch(error => {
        console.error('❌ Error con QR:', error);
    });
});

// Evento: Bot conectado
client.on('ready', () => {
    console.log('\n✅ BOT DE DENTISTEAM CONECTADO');
    console.log('🔄 Esperando pacientes...\n');
    setBotStartTime(Date.now()); // Registrar hora de inicio para ignorar mensajes anteriores
});

// Evento: Mensaje recibido
client.on('message_create', handleMessage);

// Evento: Error
client.on('error', (error) => {
    console.error('❌ Error en cliente:', error.message);
});

// Evento: Desconexión
client.on('disconnected', (reason) => {
    console.log('⚠️  Bot desconectado:', reason);
    deleteQRImage();
});

// Inicializar
client.initialize().catch(error => {
    console.error('❌ Error inicializando bot:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Desconectando bot...');
    deleteQRImage();
    client.destroy();
    process.exit(0);
});

// Mostrar estado periodicamente
setInterval(() => {
    const users = getActiveUsers();
    if (users > 0) {
        console.log(`📊 Usuarios en proceso: ${users}`);
    }
}, 30000);