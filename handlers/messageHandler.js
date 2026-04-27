/**
 * Manejador de mensajes del bot
 */

const { saveCita } = require('../utils/storage');
const { 
    validatePhone, 
    validateDate, 
    validateName, 
    validateSymptoms 
} = require('../utils/validators');

// Estado en memoria (sesiones de usuarios)
const usuarios = {};

const FLUJO_PASOS = {
    NOMBRE: 'nombre',
    TELEFONO: 'telefono',
    SINTOMAS: 'sintomas',
    FECHA: 'fecha'
};

const isMediaMessage = (msg) => {
    return msg.hasMedia || msg.type !== 'chat';
};

const isGroupOrBroadcast = (msg) => {
    return msg.from.includes('@broadcast') || 
           msg.from.includes('@newsletter') || 
           msg.from.includes('@g.us');
};

const iniciarFlujo = async (msg, chatID) => {
    usuarios[chatID] = { paso: FLUJO_PASOS.NOMBRE, datos: {} };
    await msg.reply(
        '🦷 ¡Hola! Soy el asistente de Dentisteam.\n\n' +
        'Para agendar tu cita, dime tu **nombre completo**:'
    );
};

const procesarNombre = async (msg, user) => {
    if (!validateName(msg.body)) {
        await msg.reply('❌ Por favor, ingresa un nombre válido (mínimo 3 caracteres)');
        return;
    }
    user.datos.nombre = msg.body.trim();
    user.paso = FLUJO_PASOS.TELEFONO;
    await msg.reply('Perfecto. Ahora, ¿a qué *número de teléfono* podemos contactarte?');
};

const procesarTelefono = async (msg, user) => {
    if (!validatePhone(msg.body)) {
        await msg.reply('❌ Por favor, ingresa un número de teléfono válido.');
        return;
    }
    user.datos.telefono = msg.body.trim();
    user.paso = FLUJO_PASOS.SINTOMAS;
    await msg.reply('Entendido. Cuéntanos brevemente, **¿qué te duele o cuál es el motivo de tu consulta?**');
};

const procesarSintomas = async (msg, user) => {
    if (!validateSymptoms(msg.body)) {
        await msg.reply('❌ Por favor, describe tus síntomas con más detalle (5-500 caracteres)');
        return;
    }
    user.datos.sintomas = msg.body.trim();
    user.paso = FLUJO_PASOS.FECHA;
    await msg.reply('¿Qué **día y hora** te gustaría tu cita? (ej: próximo lunes a las 10:00)');
};

const procesarFecha = async (msg, user, chatID) => {
    if (!validateDate(msg.body)) {
        await msg.reply('❌ Por favor, ingresa una fecha válida (ej: 2024-04-27, 27/04/2024)');
        return;
    }
    user.datos.fecha = msg.body.trim();
    
    const resumen = 
        `✅ *Cita Solicitada*\n\n` +
        `👤 *Nombre:* ${user.datos.nombre}\n` +
        `📞 *Teléfono:* ${user.datos.telefono}\n` +
        `🦷 *Motivo:* ${user.datos.sintomas}\n` +
        `📅 *Fecha/Hora:* ${user.datos.fecha}\n\n` +
        `Gracias. En breve nuestra recepción confirmará tu espacio. 🙏`;
    
    await msg.reply(resumen);
    
    // Guardar en archivo
    try {
        saveCita(user.datos);
        console.log('✨ NUEVA CITA REGISTRADA:', user.datos);
    } catch (error) {
        console.error('⚠️  Cita registrada pero con error al guardar:', error);
    }
    
    // Limpiar sesión
    delete usuarios[chatID];
};

const handleMessage = async (msg) => {
    try {
        // Ignorar grupos y broadcasts
        if (isGroupOrBroadcast(msg)) return;

        // Ignorar media si hay usuario en proceso
        if (isMediaMessage(msg) && usuarios[msg.from]) {
            await msg.reply('Ups, por ahora solo puedo procesar texto. 😅 Por favor, escríbelo.');
            return;
        }

        const chatID = msg.from;
        const texto = msg.body ? msg.body.toLowerCase().trim() : "";

        // Palabras clave para iniciar
        if (['hola', 'cita', 'test', 'agendar'].includes(texto)) {
            await iniciarFlujo(msg, chatID);
            return;
        }

        // Procesar flujo existente
        const user = usuarios[chatID];
        if (!user) return;

        switch (user.paso) {
            case FLUJO_PASOS.NOMBRE:
                await procesarNombre(msg, user);
                break;
            case FLUJO_PASOS.TELEFONO:
                await procesarTelefono(msg, user);
                break;
            case FLUJO_PASOS.SINTOMAS:
                await procesarSintomas(msg, user);
                break;
            case FLUJO_PASOS.FECHA:
                await procesarFecha(msg, user, chatID);
                break;
        }
    } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
        await msg.reply('⚠️  Ocurrió un error. Por favor, intenta de nuevo más tarde.');
    }
};

module.exports = {
    handleMessage,
    getActiveUsers: () => Object.keys(usuarios).length
};
