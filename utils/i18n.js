/**
 * Mensajes bilingües del bot (ES / EN)
 */

const MENU_OPTIONS = {
    es: [
        '1. Agendar cita',
        '2. Información de la clínica',
        '3. Horarios y ubicación',
        '4. Contacto'
    ],
    en: [
        '1. Book appointment',
        '2. Clinic information',
        '3. Hours & location',
        '4. Contact'
    ]
};

const messages = {
    es: {
        menu: () =>
            '📋 *Bienvenido a Dentisteam*\n\n' +
            'Elige una opción escribiendo el número o el texto:\n\n' +
            MENU_OPTIONS.es.join('\n') +
            '\n\n💬 También puedes escribir *"cita"* para agendar o *"menu"* en cualquier momento.\n' +
            '🌐 Puedes escribir en español o inglés.',

        infoClinica: () =>
            '🏥 *Dentisteam — Tu clínica dental en Tijuana*\n\n' +
            '• Odontología general, estética y emergencias\n' +
            '• Implantes, All-on-4, diseño de sonrisa, ortodoncia e Invisalign\n' +
            '• Atención personalizada — te cuidamos como familia\n' +
            '• Aceptamos seguros *PPO de USA* 🇺🇸\n\n' +
            '📍 *Dirección:*\n' +
            'Av. Río Tijuana 606, Revolución, 22015 Tijuana, B.C.\n' +
            'https://maps.app.goo.gl/SMjA3rF9ptzk6LneA\n\n' +
            '🕒 *Horarios:*\n' +
            'Lun–Vie 9:00 – 18:00 | Sáb 9:00 – 14:00\n\n' +
            '📞 *Teléfono / WhatsApp:* +52 663 196 9295\n' +
            '🌐 *Web:* https://dentisteam.com/\n' +
            '📸 *Instagram:* https://www.instagram.com/dentisteam/\n\n' +
            '¿Qué deseas hacer?\n' +
            '• *1* o *cita* → Agendar\n' +
            '• Cualquier letra → Ver menú',

        citaInicio: () =>
            '🦷 *¡Perfecto! Vamos a agendar tu cita.*\n\n' +
            'Por favor, escribe tu *nombre completo*:',

        citaNombreInvalido: () =>
            '❌ Ingresa un *nombre completo* válido (mínimo 3 letras, solo letras).',

        citaTelefono: () =>
            '✅ Gracias. ¿A qué *número de teléfono* podemos contactarte?\n' +
            '_(Incluye lada si es de USA 🇺🇸 o México 🇲🇽)_',

        citaTelefonoInvalido: () =>
            '❌ Ingresa un número de teléfono válido (mínimo 7 dígitos).',

        citaSeguro: () =>
            '🛡️ ¿Cuentas con *seguro dental*?\n\n' +
            'Ejemplos: *Delta Dental PPO*, *MetLife*, *Seguro IMSS*, etc.\n' +
            'Si no tienes, escribe *ninguno*.',

        citaSeguroInvalido: () =>
            '❌ Indica tu seguro dental o escribe *ninguno* si no tienes.',

        citaSintomas: () =>
            '🦷 Cuéntanos brevemente: *¿cuál es el motivo de tu consulta?*\n' +
            '_(dolor, limpieza, implante, urgencia, etc.)_',

        citaSintomasInvalido: () =>
            '❌ Describe el motivo con más detalle (entre 5 y 500 caracteres).',

        citaFecha: () =>
            '📅 ¿Qué *día y hora* te gustaría tu cita?\n' +
            'Ej: *próximo lunes a las 10:00* o *15/06/2026*',

        citaFechaInvalida: () =>
            '❌ Ingresa una fecha u horario válido (ej: próximo lunes 10:00, 15/06/2026).',

        citaResumen: (datos) =>
            '✅ *¡Cita solicitada con éxito!*\n\n' +
            `👤 *Nombre:* ${datos.nombre}\n` +
            `📞 *Teléfono:* ${datos.telefono}\n` +
            `🛡️ *Seguro:* ${datos.seguro}\n` +
            `🦷 *Motivo:* ${datos.sintomas}\n` +
            `📅 *Fecha/Hora:* ${datos.fecha}\n\n` +
            'Nuestro equipo de recepción te contactará pronto para *confirmar tu espacio*. 🙏\n\n' +
            'Escribe *menu* si necesitas algo más.',

        noEntiendo: () =>
            '🤔 No entendí ese mensaje.\n\n' +
            'Prueba con:\n' +
            '• *menu* → Ver opciones\n' +
            '• *1* o *cita* → Agendar cita\n' +
            '• *cancelar* → Reiniciar\n\n' +
            '🌐 You can also write in English: *menu*, *appointment*, *cancel*',

        cancelar: () =>
            '✅ Proceso cancelado.\n\n' +
            'Escribe *menu* para ver opciones o *cita* para agendar de nuevo.',

        soloTexto: () =>
            '📎 Por ahora solo puedo procesar *texto*. Por favor, escríbelo. 😊',

        error: () =>
            '⚠️ Ocurrió un error. Intenta de nuevo en un momento.',

        saludo: () =>
            '👋 ¡Hola! Soy el asistente virtual de *Dentisteam*.\n\n' +
            '¿En qué puedo ayudarte hoy?'
    },

    en: {
        menu: () =>
            '📋 *Welcome to Dentisteam*\n\n' +
            'Choose an option by typing the number or text:\n\n' +
            MENU_OPTIONS.en.join('\n') +
            '\n\n💬 You can also type *"appointment"* to book or *"menu"* anytime.\n' +
            '🌐 You can write in English or Spanish.',

        infoClinica: () =>
            '🏥 *Dentisteam — Your dental clinic in Tijuana*\n\n' +
            '• General, cosmetic & emergency dentistry\n' +
            '• Implants, All-on-4, smile design, braces & Invisalign\n' +
            '• Personalized care — we treat you like family\n' +
            '• We accept *US PPO dental insurance* 🇺🇸\n\n' +
            '📍 *Address:*\n' +
            '606 Av. Río Tijuana, Revolución, 22015 Tijuana, B.C., Mexico\n' +
            'https://maps.app.goo.gl/SMjA3rF9ptzk6LneA\n\n' +
            '🕒 *Hours:*\n' +
            'Mon–Fri 9:00 AM – 6:00 PM | Sat 9:00 AM – 2:00 PM\n\n' +
            '📞 *Phone / WhatsApp:* +52 663 196 9295\n' +
            '🌐 *Website:* https://dentisteam.com/\n' +
            '📸 *Instagram:* https://www.instagram.com/dentisteam/\n\n' +
            'What would you like to do?\n' +
            '• *1* or *appointment* → Book\n' +
            '• Any letter → Show menu',

        citaInicio: () =>
            '🦷 *Great! Let\'s book your appointment.*\n\n' +
            'Please type your *full name*:',

        citaNombreInvalido: () =>
            '❌ Please enter a valid *full name* (at least 3 letters).',

        citaTelefono: () =>
            '✅ Thanks. What *phone number* can we reach you at?\n' +
            '_(Include country code for US 🇺🇸 or Mexico 🇲🇽)_',

        citaTelefonoInvalido: () =>
            '❌ Please enter a valid phone number (at least 7 digits).',

        citaSeguro: () =>
            '🛡️ Do you have *dental insurance*?\n\n' +
            'Examples: *Delta Dental PPO*, *MetLife*, *Mexican insurance*, etc.\n' +
            'If none, type *none*.',

        citaSeguroInvalido: () =>
            '❌ Please enter your insurance provider or type *none*.',

        citaSintomas: () =>
            '🦷 Briefly tell us: *what is the reason for your visit?*\n' +
            '_(pain, cleaning, implant, emergency, etc.)_',

        citaSintomasInvalido: () =>
            '❌ Please describe the reason in more detail (5–500 characters).',

        citaFecha: () =>
            '📅 What *day and time* would you prefer?\n' +
            'E.g. *next Monday at 10:00 AM* or *06/15/2026*',

        citaFechaInvalida: () =>
            '❌ Please enter a valid date or time (e.g. next Monday 10 AM, 06/15/2026).',

        citaResumen: (datos) =>
            '✅ *Appointment request received!*\n\n' +
            `👤 *Name:* ${datos.nombre}\n` +
            `📞 *Phone:* ${datos.telefono}\n` +
            `🛡️ *Insurance:* ${datos.seguro}\n` +
            `🦷 *Reason:* ${datos.sintomas}\n` +
            `📅 *Date/Time:* ${datos.fecha}\n\n` +
            'Our front desk will contact you soon to *confirm your slot*. 🙏\n\n' +
            'Type *menu* if you need anything else.',

        noEntiendo: () =>
            '🤔 I didn\'t understand that message.\n\n' +
            'Try:\n' +
            '• *menu* → See options\n' +
            '• *1* or *appointment* → Book appointment\n' +
            '• *cancel* → Restart\n\n' +
            '🌐 También puedes escribir en español: *menu*, *cita*, *cancelar*',

        cancelar: () =>
            '✅ Process cancelled.\n\n' +
            'Type *menu* for options or *appointment* to book again.',

        soloTexto: () =>
            '📎 I can only process *text* for now. Please type it out. 😊',

        error: () =>
            '⚠️ Something went wrong. Please try again in a moment.',

        saludo: () =>
            '👋 Hi! I\'m the *Dentisteam* virtual assistant.\n\n' +
            'How can I help you today?'
    }
};
    
    // Mensaje de confirmación al cambiar idioma
    messages.es.idiomaCambiado = () => '✅ Idioma establecido a Español. Escribe *menu* para ver opciones.';
    messages.en.idiomaCambiado = () => '✅ Language set to English. Type *menu* to see options.';

const ENGLISH_HINTS = /\b(hello|hi|hey|menu|appointment|book|schedule|info|information|hours|location|where|contact|phone|cancel|insurance|help|yes|no|none|thanks|thank)\b/i;

const detectLanguage = (text) => {
    if (!text || !text.trim()) return 'es';
    return ENGLISH_HINTS.test(text) ? 'en' : 'es';
};

const t = (lang, key, ...args) => {
    const locale = messages[lang] || messages.es;
    const fn = locale[key];
    return typeof fn === 'function' ? fn(...args) : fn;
};

module.exports = { t, detectLanguage, MENU_OPTIONS };
