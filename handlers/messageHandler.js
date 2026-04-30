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

const MENU_OPTIONS = [
    '1. Agendar cita',
    '2. Información general de la clínica',
    '3. Horarios y ubicación',
    '4. Contacto'
];

const iniciarFlujo = async (msg, chatID) => {
    usuarios[chatID] = { paso: FLUJO_PASOS.NOMBRE, datos: {} };
    await msg.reply(
        '🦷 ¡Hola! Soy el asistente de Dentisteam.\n\n' +
        'Para agendar tu cita, dime tu **nombre completo**:'
    );
};

const enviarMenu = async (msg) => {
    await msg.reply(
        '📋 Bienvenido a Dentisteam. Elige una opción escribiendo el número o el texto:\n\n' +
        MENU_OPTIONS.join('\n') +
        '\n\nSi quieres agendar una cita, puedes escribir "1" o "cita".'
    );
};

const enviarInfoClinica = async (msg) => {
    await msg.reply(
        '🏥 Información general de Dentisteam:\n\n' +
        '• Clínica especializada en odontología general, estética y emergencia dental.\n' +
        '• Equipo profesional con atención personalizada en un ambiente seguro.\n' +
        '• Servicio de urgencias dentales y controles preventivos.\n\n' +
        '📍 Encuéntranos en Google Maps:\n' +
        'https://maps.app.goo.gl/SMjA3rF9ptzk6LneA\n\n' +
        '🌐 Sitio web:\n' +
        'https://dentisteam.com/\n\n' +
        '📸 Instagram:\n' +
        'https://www.instagram.com/dentisteam/\n\n' +
        '🕒 Horarios: Lunes a Viernes 9:00 - 18:00, Sábados 9:00 - 14:00.\n' +
        '📞 Teléfono: +52 663 196 9295\n\n' +
        'Para continuar, escribe:\n' +
        '1 para agendar cita, 3 para horarios, 4 para contacto o cualquier letra para ver el menú de nuevo.'
    );
};

const responderNoEntiendo = async (msg) => {
    await msg.reply(
        '🤔 No entendí ese mensaje. Si necesitas ayuda, escribe:\n' +
        '• "menu" para ver las opciones\n' +
        '• "1" para agendar cita\n' +
        '• "cancelar" para reiniciar el asistente'
    );
};

const cancelarFlujo = async (msg, chatID) => {
    delete usuarios[chatID];
    await msg.reply('✅ Proceso cancelado. Escribe "menu" para ver las opciones o "cita" para agendar de nuevo.');
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
        // ⚠️ IMPORTANTE: Ignorar mensajes del propio bot (evitar bucles infinitos)
        if (msg.fromMe) return;

        // Ignorar grupos y broadcasts
        if (isGroupOrBroadcast(msg)) return;

        // Ignorar media si hay usuario en proceso
        if (isMediaMessage(msg) && usuarios[msg.from]) {
            await msg.reply('Ups, por ahora solo puedo procesar texto. 😅 Por favor, escríbelo.');
            return;
        }

        const chatID = msg.from;
        const texto = msg.body ? msg.body.toLowerCase().trim() : "";

        // Permitir cancelar en cualquier momento cuando hay flujo activo
        if (usuarios[chatID] && ['cancelar', 'salir', 'reiniciar', 'borrar', 'stop'].includes(texto)) {
            await cancelarFlujo(msg, chatID);
            return;
        }

        // Respuesta rápida a menú y letras sueltas cuando no hay flujo activo
        const esLetraSueltas = texto.length === 1 && /^[a-záéíóúñ]$/i.test(texto);
        if (!usuarios[chatID]) {
            if (texto === '' || ['menu', 'opciones'].includes(texto) || esLetraSueltas) {
                await enviarMenu(msg);
                return;
            }

            if (['1', 'cita', 'agendar', 'agendar cita'].includes(texto)) {
                await iniciarFlujo(msg, chatID);
                return;
            }

            if (['2', 'información', 'informacion', 'info', 'clinica', 'clínica', 'clinica general', 'informacion general'].includes(texto)) {
                await enviarInfoClinica(msg);
                return;
            }

            if (['3', 'horarios', 'ubicación', 'ubicacion', 'dónde', 'donde', 'ubicacion y horarios'].includes(texto)) {
                await enviarInfoClinica(msg);
                return;
            }

            if (['4', 'contacto', 'teléfono', 'telefono', 'whatsapp'].includes(texto)) {
                await enviarInfoClinica(msg);
                return;
            }

            // Si no se reconoce y no hay sesión, enviar respuesta de ayuda
            await responderNoEntiendo(msg);
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
