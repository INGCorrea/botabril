/**
 * Detección de intenciones bilingüe (ES / EN)
 */

const matchesAny = (texto, keywords) => keywords.includes(texto);

const INTENTS = {
    menu: [
        'menu', 'menú', 'opciones', 'options', 'help', 'ayuda', 'start'
    ],
    saludo: [
        'hola', 'hello', 'hi', 'hey', 'buenas', 'buenos dias', 'buenos días',
        'good morning', 'good afternoon', 'good evening'
    ],
    cita: [
        '1', 'cita', 'agendar', 'agendar cita', 'appointment', 'book',
        'book appointment', 'schedule', 'schedule appointment', 'reservar'
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
