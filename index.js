const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Lo ponemos en true para que no te estorbe la ventana
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    }
});

// Nuestra base de datos temporal en memoria
const usuarios = {};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ BOT DE DENTISTEAM CONECTADO. Esperando pacientes...');
});

client.on('message_create', async (msg) => {
    // Filtro para ignorar grupos, canales y estados
    if (msg.from.includes('@broadcast') || msg.from.includes('@newsletter') || msg.from.includes('@g.us')) return;

    const chatID = msg.from;
    const texto = msg.body ? msg.body.toLowerCase().trim() : "";

    // 1. FILTRO: Si mandan stickers o imágenes durante el proceso, pedir texto
    if ((msg.hasMedia || msg.type !== 'chat') && usuarios[chatID]) {
        return msg.reply('Ups, por ahora solo puedo procesar texto. 😅 Por favor, escríbelo.');
    }

    // 2. INICIO DEL FLUJO
    if (texto === 'hola' || texto === 'cita' || texto === 'test') {
        usuarios[chatID] = { paso: 'nombre', datos: {} };
        await msg.reply('🦷 ¡Hola! Soy el asistente de Dentisteam.\n\nPara agendar tu cita, dime tu **nombre completo**:');
        return;
    }

    // 3. PROCESO DE PREGUNTAS (ESTADOS)
    const user = usuarios[chatID];

    if (user) {
        switch (user.paso) {
            case 'nombre':
                user.datos.nombre = msg.body;
                user.paso = 'telefono';
                await msg.reply('Perfecto. Ahora, ¿a qué **número de teléfono** podemos contactarte?');
                break;

            case 'telefono':
                user.datos.telefono = msg.body;
                user.paso = 'sintomas';
                await msg.reply('Entendido. Cuéntanos brevemente, **¿qué te duele o cuál es el motivo de tu consulta?**');
                break;

            case 'sintomas':
                user.datos.sintomas = msg.body;
                user.paso = 'fecha';
                await msg.reply('¿Qué **día y hora** te gustaría tu cita? (Sujeto a disponibilidad)');
                break;

            case 'fecha':
                user.datos.fecha = msg.body;
                // RESUMEN FINAL
                const resumen = `✅ *Cita Solicitada*\n\n` +
                                `👤 *Nombre:* ${user.datos.nombre}\n` +
                                `📞 *Teléfono:* ${user.datos.telefono}\n` +
                                `🦷 *Motivo:* ${user.datos.sintomas}\n` +
                                `📅 *Fecha/Hora:* ${user.datos.fecha}\n\n` +
                                `Gracias. En breve nuestra recepción confirmará tu espacio. 🙏`;
                
                await msg.reply(resumen);
                
                // Aquí imprimimos en consola para que tú lo veas (luego lo mandamos a Excel)
                console.log(`✨ NUEVA CITA REGISTRADA:`, user.datos);
                
                // Borramos al usuario de la memoria para que pueda empezar de nuevo si quiere
                delete usuarios[chatID];
                break;
        }
    }
});

client.initialize();