/**
 * Detección de intenciones bilingüe (ES / EN)
 */

const matchesAny = (texto, keywords) =>
    keywords.some((keyword) => {
        if (typeof keyword === 'string') {
            return texto === keyword || texto.includes(keyword);
        }
        return keyword.test(texto);
    });

const INTENTS = {
    menu: [
        'menu', 'menú', 'opciones', 'options', 'help', 'ayuda', 'start'
    ],
    saludo: [
        'hola', 'hello', 'hi', 'hey', 'buenas', 'buenos dias', 'buenos días',
        'good morning', 'good afternoon', 'good evening', 'ok', 'okay', 'vale', 'listo'
    ],
    cita: [
        '1', 'cita', 'agendar', 'agendar cita', 'appointment', 'book',
        'book appointment', 'schedule', 'schedule appointment', 'reservar'
    ],
    manual: [
        'asesor', 'recepcion', 'recepción', 'habla con asesor', 'pasa con asesor',
        'habla con recepción', 'habla con recepcion', 'habla con alguien',
        'desactivar bot', 'desactiva bot', 'detener bot', 'detente', 'para el bot',
        'no contestes', 'deja de contestar', 'deja de responder', 'no respondas',
        'no contestes mas', 'no respondas mas',
        'stop bot', 'please stop bot', 'pause bot', 'hold on',
        'let reception talk', 'let the receptionist talk', 'talk to receptionist',
        'talk to agent', 'handoff', 'transfer to agent', 'transfer to receptionist',
        'do not answer', "don't answer", 'do not respond', "don't respond", 'stop responding',
        'please stop', 'please do not answer'
    ],
    suspicious: [
        /\bhermos[ao]s?\b/i,
        /\bguap[ao]s?\b/i,
        /\bsexy\b/i,
        /\bhot\b/i,
        /\bfoto?s?\b/i,
        /\bpic(?:s)?\b/i,
        /\binstagram\b/i,
        /\bsnapchat\b/i,
        /\btiktok\b/i,
        /\bonlyfans\b/i,
        /\bbelleza\b/i,
        /\blinda\b/i,
        /\blindo\b/i,
        /\bpreciosa\b/i,
        /\bprecioso\b/i,
        /\bcurvas\b/i,
        /\btetas\b/i,
        /\bpecho\b/i,
        /\bque hermos[ao]s?\b/i,
        /\bque guap[ao]s?\b/i,
        /\bcomo estas\b/i,
        /\bhola guap[ao]?\b/i,
        /\bque linda\b/i,
        /\bque lindo\b/i
    ],
    precio: [
        'precio', 'cost', 'costo', 'cuanto', 'cuánto', 'valor', 'valoracion', 'cotizacion'
    ],
    faq: [
        '5', 'faq', 'preguntas', 'preguntas frecuentes', 'preguntasfrecuentes', 'frequently', 'faqs'
    ],
    info: [
        '2', 'información', 'informacion', 'info', 'information', 'clinica',
        'clínica', 'clinic', 'about', 'acerca', 'servicios', 'services',
        'clinica general', 'informacion general'
    ],
    horarios: [
        '3', 'horarios', 'horario', 'ubicación', 'ubicacion', 'dónde', 'donde',
        'hours', 'location', 'address', 'direccion', 'dirección', 'where',
        'ubicacion y horarios', 'open', 'abierto'
    ],
    contacto: [
        '4', 'contacto', 'contact', 'teléfono', 'telefono', 'phone',
        'whatsapp', 'llamar', 'call', 'email', 'correo'
    ],
    cancelar: [
        'cancelar', 'cancel', 'salir', 'exit', 'reiniciar', 'restart',
        'borrar', 'stop', 'quit'
    ]
};

const getIntent = (texto) => {
    const normalizado = texto.toLowerCase().trim();

    for (const [intent, keywords] of Object.entries(INTENTS)) {
        if (matchesAny(normalizado, keywords)) {
            return intent;
        }
    }

    return null;
};

const isSingleLetter = (texto) =>
    texto.length === 1 && /^[a-záéíóúñ]$/i.test(texto);

module.exports = { getIntent, isSingleLetter, INTENTS };
