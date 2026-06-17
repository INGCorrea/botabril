/**
 * Mensajes bilingües del bot (ES / EN)
 */

const MENU_OPTIONS = {
    es: [
        '1. Agendar cita',
        '2. Información de la clínica',
        '3. Horarios y ubicación',
        '4. Contacto',
        '5. Preguntas frecuentes'
    ],
    en: [
        '1. Book appointment',
        '2. Clinic information',
        '3. Hours & location',
        '4. Contact',
        '5. FAQs'
    ]
};

const messages = {
    es: {
        menu: () =>
            '📋 *Bienvenido a Dentisteam*\n\n' +
            MENU_OPTIONS.es.join('\n') +
            '\n\n💬 Escribe el número o la palabra correspondiente.\n' +
            'Si prefieres inglés escribe *US*.',

        infoClinica: () =>
            '🏥 *Dentisteam — Tu clínica dental en Tijuana*\n\n' +
            'Tu sonrisa se merece lo mejor. Te guiamos paso a paso para brindarte atención cercana y profesional.\n\n' +
            '• Odontología general, estética y emergencias\n' +
            '• Implantes, All-on-4, diseño de sonrisa, ortodoncia e Invisalign\n' +
            '• Atención personalizada — te cuidamos como familia\n' +
            '• Aceptamos seguros *PPO de USA* 🇺🇸\n\n' +
            '📍 *Dirección:* Av. Río Tijuana 606, Revolución, 22015 Tijuana, B.C.\n' +
            'https://maps.app.goo.gl/SMjA3rF9ptzk6LneA\n\n' +
            '🕒 *Horarios:* Lun–Vie 9:00 – 18:00 | Sáb 9:00 – 14:00\n\n' +
            '📞 *Teléfono / WhatsApp:* +52 663 196 9295\n' +
            '🌐 *Web:* https://dentisteam.com/ | 📸 Instagram: https://www.instagram.com/dentisteam/\n\n' +
            'Para nosotros es importante valorarte para darte un plan y presupuestos correctos.\n' +
            'Si quieres, podemos agendar una valoración donde te explicaremos planes, tratamientos y costos paso a paso.\n\n' +
            '¿Qué deseas hacer?\n' +
            '• *1* o *cita* → Agendar\n' +
            '• *5* o *faq* → Preguntas frecuentes',

        citaInicio: () =>
            '🦷 *¡Perfecto! Vamos a agendar tu cita.*\n\n' +
            'Por favor, escribe tu *nombre completo*:',

        askNeed: () =>
            '¿Qué necesitas?\nEj: dolor / estética / limpieza / urgencia',

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

        precioNo: () =>
            'ℹ️ No damos precios por WhatsApp. Siempre se necesita una valoración para dar un presupuesto correcto. ¿Deseas agendar una valoración (escribe *cita*)?',

        faq: () =>
            '❓ *Preguntas frecuentes*\n\n' +
            '• ¿Aceptan aseguranza de USA? → Sí, PPO. Pedimos datos para revisar cobertura.\n' +
            '• ¿Atienden pacientes de USA? → Sí.\n' +
            '• ¿Dónde están? → En Tijuana, cerca de la frontera.\n' +
            '• ¿Atienden niños? → Sí, con especialista.\n' +
            '• ¿Hacen Invisalign? → Sí.\n' +
            '• ¿Hacen implantes? → Sí.\n' +
            '• ¿Dan precios por Whats? → No, hasta valoración.\n' +
            '• ¿Aceptan tarjeta? → Sí.\n' +
            '• ¿Meses sin intereses? → Sí.\n' +
            '• ¿Cómo agendo? → Por WhatsApp, escribe *cita*.',

        citaSintomas: () =>
            '🦷 Cuéntanos brevemente: *¿cuál es el motivo de tu consulta?*\n' +
            '_(dolor, limpieza, implante, urgencia, etc.)_',

        prioridad: () =>
            '⚠️ Entendido: si es dolor le daremos prioridad inmediata. Por favor proporciona tu número de teléfono.',

        askDob: () =>
            '📅 Por favor indica la *fecha de nacimiento* del paciente (DD/MM/AAAA).',

        askMemberId: () =>
            '🔢 Por favor indica el *Member ID* o número de afiliado del seguro.',

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
            'Escribe *menu* si necesitas algo más.\n' +
            'Muchas gracias por tu respuesta, te contestaremos dentro de nuestro horario de atención: Lun–Vie 9:00 – 18:00 | Sáb 9:00 – 14:00',

        noEntiendo: () =>
            '🤔 No entendí ese mensaje.\n\n' +
            'Prueba con:\n' +
            '• *menu* → Ver opciones\n' +
            '• *1* o *cita* → Agendar cita\n' +
            '• *cancelar* → Reiniciar\n\n' +
            'También puedes consultar las *preguntas frecuentes* escribiendo *faq*; si prefieres, ¿te paso con un asesor?\n\n' +
            '🌐 You can also write in English: *menu*, *appointment*, *cancel*',

        cancelar: () =>
            '✅ Proceso cancelado.\n\n' +
            'Escribe *menu* para ver opciones o *cita* para agendar de nuevo.',

        soloTexto: () =>
            '📎 Por ahora solo puedo procesar *texto*. Por favor, escríbelo. 😊',

        error: () =>
            '⚠️ Ocurrió un error. Intenta de nuevo en un momento.',

        saludo: () =>
            '👋 ¡Hola! Soy Abril, tu asistente. ¿Cómo te ayudo hoy?\n\n' +
            'Escribe *menu* para ver opciones o *US* para inglés.'
    },

    en: {
        menu: () =>
            '📋 *Welcome to Dentisteam*\n\n' +
            'Choose an option by typing the number or text:\n\n' +
            MENU_OPTIONS.en.join('\n') +
            '\n\n💬 You can also type *"appointment"* to book or *"menu"* anytime.\n' +
            'If you prefer Spanish, write *ES* or *MX*.',

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

        askNeed: () =>
            'What do you need?\nE.g. pain / esthetic / cleaning / emergency',

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

        prioridad: () =>
            '⚠️ Understood: if this is pain we will prioritize you. Please provide your phone number.',

        askDob: () =>
            '📅 Please provide the patient\'s date of birth (MM/DD/YYYY).',

        askMemberId: () =>
            '🔢 Please provide the insurance Member ID or affiliate number.',

        precioNo: () =>
            '🧡 For us, providing personalized care is very important; that is why we always share information about plans, treatments and pricing during your valuation appointment. This way we guide you step by step while caring for your smile. Would you like to schedule a valuation? (type *appointment*)',

        faq: () =>
            '❓ *Frequently Asked Questions*\n\n' +
            '• Do you accept US insurance? → Yes, we accept PPO plans. Many patients already have coverage and don\'t know it; we request details to check your case.\n' +
            '• Do you treat US patients? → Yes, we can coordinate if needed.\n' +
            '• Where are you located? → In Tijuana, near the border.\n' +
            '• Do you treat children? → Yes, with a pediatric specialist.\n' +
            '• Do you offer Invisalign? → Yes.\n' +
            '• Do you do implants? → Yes.\n' +
            '• Do you give prices on WhatsApp? → No; to give an accurate plan and estimate we perform a valuation.\n' +
            '• Do you accept cards? → Yes.\n' +
            '• Installments? → Yes, ask about promotions.\n' +
            '• How to book? → Via WhatsApp, type *appointment*.',

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
            'Type *menu* if you need anything else.\n' +
            'Thank you — we will reply within business hours: Mon–Fri 9:00 AM – 6:00 PM | Sat 9:00 AM – 2:00 PM',

        noEntiendo: () =>
            '🤔 I didn\'t understand that message.\n\n' +
            'Try:\n' +
            '• *menu* → See options\n' +
            '• *1* or *appointment* → Book appointment\n' +
            '• *cancel* → Restart\n\n' +
            'You can also check *FAQs* by typing *faq*; if you prefer, shall I transfer you to an advisor?\n\n' +
            '🌐 También puedes escribir en español: *menu*, *cita*, *cancelar*',

        cancelar: () =>
            '✅ Process cancelled.\n\n' +
            'Type *menu* for options or *appointment* to book again.',

        soloTexto: () =>
            '📎 I can only process *text* for now. Please type it out. 😊',

        error: () =>
            '⚠️ Something went wrong. Please try again in a moment.',

        saludo: () =>
            '👋 Hi! I\'m Abril, your Dentisteam assistant. How can I help you today?\n\n' +
            'Type *menu* to see options or *ES* for Spanish.'
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
