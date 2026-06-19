/**
 * Manejador de mensajes del bot — bilingüe ES/EN
 */

const { saveCita } = require('../utils/storage');
const {
    validatePhone,
    validateDate,
    validateName,
    validateSymptoms,
    validateInsurance,
    normalizeInsurance,
    checkRetryLimit,
    resetRetries,
    detectSpamActivity,
    isFakeTestNumber
} = require('../utils/validators');
const { t, detectLanguage } = require('../utils/i18n');
const { getIntent, isSingleLetter } = require('../utils/intents');
const { isWithinBusinessHours, getNextOpeningTime } = require('../utils/businessHours');

const usuarios = {};

const FLUJO_PASOS = {
    NOMBRE: 'nombre',
    NECESIDAD: 'necesidad',
    TELEFONO: 'telefono',
    SEGURO: 'seguro',
    FECHA_NAC: 'fecha_nac',
    MEMBER_ID: 'member_id',
    SINTOMAS: 'sintomas',
    FECHA: 'fecha',
    ESPERANDO_CONFIRMACION_CITA: 'esperando_confirmacion_cita' // Estado para confirmar cita
};

const isMediaMessage = (msg) => msg.hasMedia || msg.type !== 'chat';

const isGroupOrBroadcast = (msg) =>
    msg.from.includes('@broadcast') ||
    msg.from.includes('@newsletter') ||
    msg.from.includes('@g.us');

const reply = async (msg, lang, key, ...args) => {
    await msg.reply(t(lang, key, ...args));
};

const getMenuList = (lang) => {
    const isEn = lang === 'en';
    return {
        buttonText: isEn ? 'Choose an option' : 'Elige una opción',
        description: isEn ?
            'Tap the option you want to continue.' :
            'Toca la opción que deseas para continuar.',
        title: isEn ? 'Dentisteam Menu' : 'Menú Dentisteam',
        sections: [
            {
                title: isEn ? 'Main options' : 'Opciones principales',
                rows: [
                    {
                        title: isEn ? 'Book appointment' : 'Agendar cita',
                        description: isEn ? 'Start your appointment flow' : 'Comenzar agendar cita',
                        id: 'cita'
                    },
                    {
                        title: isEn ? 'Clinic information' : 'Información de la clínica',
                        description: isEn ? 'See address, hours and services' : 'Ver dirección, horarios y servicios',
                        id: 'info'
                    },
                    {
                        title: isEn ? 'Hours & location' : 'Horarios y ubicación',
                        description: isEn ? 'Get clinic hours and map link' : 'Ver horarios y mapa',
                        id: 'horarios'
                    },
                    {
                        title: isEn ? 'Contact' : 'Contacto',
                        description: isEn ? 'Phone and WhatsApp information' : 'Teléfono y WhatsApp',
                        id: 'contacto'
                    },
                    {
                        title: isEn ? 'FAQs' : 'Preguntas frecuentes',
                        description: isEn ? 'Common questions and answers' : 'Preguntas comunes y respuestas',
                        id: 'faq'
                    }
                ]
            }
        ]
    };
};

const sendMenuList = async (msg, lang) => {
    const listMessage = getMenuList(lang);
    try {
        await msg.reply(listMessage);
    } catch (error) {
        await reply(msg, lang, 'menu');
    }
};

const getLang = (msg, chatID) => {
    if (usuarios[chatID]?.lang) return usuarios[chatID].lang;
    return detectLanguage(msg.body || '');
};

const iniciarFlujo = async (msg, chatID, lang) => {
    usuarios[chatID] = { paso: FLUJO_PASOS.NOMBRE, datos: {}, lang };
    await reply(msg, lang, 'citaInicio');
};

const enviarMenu = async (msg, lang) => {
    await sendMenuList(msg, lang);
};
const enviarInfoClinica = async (msg, lang) => {
    await reply(msg, lang, 'infoClinica');
};

const cancelarFlujo = async (msg, chatID) => {
    const lang = usuarios[chatID]?.lang || detectLanguage(msg.body || '');
    delete usuarios[chatID];
    await reply(msg, lang, 'cancelar');
};

const procesarNombre = async (msg, user) => {
    const { lang } = user;
    if (!validateName(msg.body)) {
        if (!checkRetryLimit(user, 3)) {
            await reply(msg, lang, 'error');
            user.paused = true;  // Pause flow after too many retries
            return;
        }
        await reply(msg, lang, 'citaNombreInvalido');
        return;
    }
    resetRetries(user);
    user.datos.nombre = msg.body.trim();
    user.paso = FLUJO_PASOS.NECESIDAD;
    await reply(msg, lang, 'askNeed');
};

const procesarNecesidad = async (msg, user) => {
    const { lang } = user;
    const texto = (msg.body || '').toLowerCase();
    const isPain = /dolor|pain|urgencia|urgent/.test(texto);
    if (isPain) {
        user.datos.prioridad = true;
        await reply(msg, lang, 'prioridad');
    }
    user.paso = FLUJO_PASOS.TELEFONO;
    await reply(msg, lang, 'citaTelefono');
};

const procesarTelefono = async (msg, user) => {
    const { lang } = user;
    const phoneStr = msg.body.trim();
    
    // Check for fake/test numbers
    if (isFakeTestNumber(phoneStr)) {
        await reply(msg, lang, 'citaTelefonoInvalido');
        user.paused = true;  // Pause suspicious activity
        return;
    }
    
    if (!validatePhone(phoneStr)) {
        if (!checkRetryLimit(user, 3)) {
            await reply(msg, lang, 'error');
            user.paused = true;  // Pause after retries
            return;
        }
        await reply(msg, lang, 'citaTelefonoInvalido');
        return;
    }
    resetRetries(user);
    user.datos.telefono = phoneStr;
    user.paso = FLUJO_PASOS.SEGURO;
    await reply(msg, lang, 'citaSeguro');
};

const procesarSeguro = async (msg, user) => {
    const { lang } = user;
    if (!validateInsurance(msg.body)) {
        if (!checkRetryLimit(user, 3)) {
            await reply(msg, lang, 'error');
            user.paused = true;  // Pause after retries
            return;
        }
        await reply(msg, lang, 'citaSeguroInvalido');
        return;
    }
    resetRetries(user);
    user.datos.seguro = normalizeInsurance(msg.body, lang);
    if (user.datos.seguro && user.datos.seguro.toLowerCase() !== 'ninguno' && user.datos.seguro.toLowerCase() !== 'none') {
        user.paso = FLUJO_PASOS.FECHA_NAC;
        await reply(msg, lang, 'askDob');
        return;
    }
    user.paso = FLUJO_PASOS.SINTOMAS;
    await reply(msg, lang, 'citaSintomas');
};

const procesarFechaNac = async (msg, user) => {
    const { lang } = user;
    // Accept any non-empty value for DOB (can be improved with validation)
    if (!msg.body || !msg.body.trim()) {
        await reply(msg, lang, 'askDob');
        return;
    }
    user.datos.fecha_nac = msg.body.trim();
    user.paso = FLUJO_PASOS.MEMBER_ID;
    await reply(msg, lang, 'askMemberId');
};

const procesarMemberId = async (msg, user) => {
    const { lang } = user;
    user.datos.member_id = msg.body ? msg.body.trim() : '';
    user.paso = FLUJO_PASOS.SINTOMAS;
    await reply(msg, lang, 'citaSintomas');
};

const procesarSintomas = async (msg, user) => {
    const { lang } = user;
    if (!validateSymptoms(msg.body)) {
        if (!checkRetryLimit(user, 3)) {
            await reply(msg, lang, 'error');
            user.paused = true;  // Pause after retries
            return;
        }
        await reply(msg, lang, 'citaSintomasInvalido');
        return;
    }
    resetRetries(user);
    user.datos.sintomas = msg.body.trim();
    user.paso = FLUJO_PASOS.FECHA;
    await reply(msg, lang, 'citaFecha');
};

const procesarFecha = async (msg, user, chatID) => {
    const { lang } = user;
    if (!validateDate(msg.body)) {
        await reply(msg, lang, 'citaFechaInvalida');
        return;
    }
    
    user.datos.fecha = msg.body.trim();
    user.datos.timestamp = new Date().toISOString();
    user.paso = FLUJO_PASOS.ESPERANDO_CONFIRMACION_CITA;
    await reply(msg, lang, 'citaConfirmar', user.datos);
};

// Nueva función para manejar la confirmación de cita
const procesarConfirmacionCita = async (msg, user, chatID) => {
    const { lang } = user;
    const texto = msg.body.toLowerCase().trim();
    
    // Opción 1: Confirmar cita
    if (texto.includes('1') || texto.includes('confirmar') || texto.includes('confirm')) {
        await reply(msg, lang, 'citaConfirmada', user.datos);
        try {
            saveCita({ ...user.datos, idioma: lang });
            console.log('✨ NUEVA CITA REGISTRADA:', user.datos);
        } catch (error) {
            console.error('⚠️  Cita registrada pero con error al guardar:', error);
        }
        delete usuarios[chatID];
        return;
    }
    
    // Opción 2: Ingresar otra fecha y hora
    if (texto.includes('2') || texto.includes('otra fecha') || texto.includes('otra hora') || 
        texto.includes('another date') || texto.includes('another time')) {
        user.paso = FLUJO_PASOS.FECHA;
        await reply(msg, lang, 'citaFecha');
        return;
    }
    
    // Opción 3: Hablar con recepción (pausar el bot)
    if (texto.includes('3') || texto.includes('hablar con recepcion') || texto.includes('hablar con recepción') ||
        texto.includes('talk to reception')) {
        user.paused = true;
        await reply(msg, lang, 'manual');
        return;
    }
    
    // Si no es ninguna opción, volver a preguntar
    await reply(msg, lang, 'citaConfirmar', user.datos);
};

const handleIdleMessage = async (msg, chatID, texto) => {
    const lang = detectLanguage(msg.body || '');
    const intent = getIntent(texto);
    const isOpen = isWithinBusinessHours();

    console.log('🔄 handleIdleMessage:');
    console.log('   - Intent:', intent);
    console.log('   - Is open:', isOpen);

    if (intent === 'cancelar') {
        await cancelarFlujo(msg, chatID);
        return;
    }

    if (intent === 'saludo') {
        await reply(msg, lang, 'saludo');
        await enviarMenu(msg, lang);
        return;
    }

    if (!intent && (texto === '' || isSingleLetter(texto))) {
        await enviarMenu(msg, lang);
        return;
    }

    if (intent === 'menu') {
        await enviarMenu(msg, lang);
        return;
    }

    if (intent === 'precio') {
        await reply(msg, lang, 'precioNo');
        return;
    }

    if (intent === 'faq') {
        await reply(msg, lang, 'faq');
        return;
    }

    if (intent === 'cita') {
        await iniciarFlujo(msg, chatID, lang);
        return;
    }

    if (intent === 'info' || intent === 'horarios' || intent === 'contacto') {
        await enviarInfoClinica(msg, lang);
        return;
    }

    await reply(msg, lang, 'noEntiendo');
};

const handleMessage = async (msg) => {
    try {
        // 1. Ignorar mensajes de mí mismo
        if (msg.fromMe) return;
        
        // 2. Ignorar grupos y broadcasts
        if (isGroupOrBroadcast(msg)) return;
        
        // 3. IGNORAR MENSJES ANTIGUOS (más de 1 minuto)
        const msgTimestamp = msg.timestamp * 1000; // Convertir a ms
        const nowTimestamp = Date.now();
        const timeDiff = nowTimestamp - msgTimestamp;
        const ONE_MINUTE = 60 * 1000;
        
        if (timeDiff > ONE_MINUTE) {
            console.log(`⏭️ Ignorando mensaje antiguo (${Math.floor(timeDiff / 1000)} segundos atrás)`);
            return;
        }

        const chatID = msg.from;
        const texto = msg.body ? msg.body.toLowerCase().trim() : '';
        const intent = getIntent(texto);
        const lang = getLang(msg, chatID);
        const isOpen = isWithinBusinessHours();
        
        // LOGS DE DEPURACIÓN
        console.log('🔍 Nuevo mensaje:');
        console.log('   - Texto:', texto);
        console.log('   - Intent detectado:', intent);
        console.log('   - Está en horario de atención:', isOpen);
        console.log('   - Usuario existe:', !!usuarios[chatID]);
        console.log('   - Usuario está pausado:', usuarios[chatID]?.paused);

        // Detectar spam activity (rapid-fire messages)
        if (usuarios[chatID] && detectSpamActivity(usuarios[chatID])) {
            usuarios[chatID].paused = true;
            await reply(msg, lang, 'spam');
            return;
        }

        const suspiciousShort = ['de', 'q', 'k', 'xq', 'eh', 'ya', 'ay', 'ah', 'a'];
        if (intent === 'suspicious' || (!intent && suspiciousShort.includes(texto))) {
            usuarios[chatID] = usuarios[chatID] || { paso: null, datos: {}, lang };
            usuarios[chatID].paused = true;
            await reply(msg, lang, 'suspicious');
            return;
        }

        // Permitir cambio explícito de idioma
        if (texto === 'es' || texto === 'en' || texto === 'us' || texto === 'mx') {
            const selected = (texto === 'us' ? 'en' : (texto === 'mx' ? 'es' : texto));
            usuarios[chatID] = usuarios[chatID] || { paso: null, datos: {}, lang: selected };
            usuarios[chatID].lang = selected;
            await reply(msg, selected, 'idiomaCambiado');
            await enviarMenu(msg, selected);
            return;
        }

        if (usuarios[chatID]?.paused) {
            if (intent === 'menu' || intent === 'cita' || intent === 'cancelar') {
                usuarios[chatID].paused = false;
            } else {
                return;
            }
        }

        if (isMediaMessage(msg)) {
            if (usuarios[chatID]) {
                await reply(msg, lang, 'soloTexto');
            }
            return;
        }

        if (intent === 'manual') {
            usuarios[chatID] = usuarios[chatID] || { paso: null, datos: {}, lang };
            usuarios[chatID].paused = true;
            await reply(msg, lang, 'manual');
            return;
        }

        if (usuarios[chatID] && intent === 'cancelar') {
            await cancelarFlujo(msg, chatID);
            return;
        }

        // Si el usuario no está en un flujo, manejar como mensaje idle
        const user = usuarios[chatID];
        if (!user || user.paso === null) {
            await handleIdleMessage(msg, chatID, texto);
            // Solo crear el usuario si hay un intent válido para iniciar un flujo después
            if (intent && !usuarios[chatID]) {
                usuarios[chatID] = { paso: null, datos: {}, lang };
            }
            return;
        }

        // El usuario está en un flujo, procesar paso
        switch (user.paso) {
            case FLUJO_PASOS.NOMBRE:
                await procesarNombre(msg, user);
                break;
            case FLUJO_PASOS.NECESIDAD:
                await procesarNecesidad(msg, user);
                break;
            case FLUJO_PASOS.TELEFONO:
                await procesarTelefono(msg, user);
                break;
            case FLUJO_PASOS.SEGURO:
                await procesarSeguro(msg, user);
                break;
            case FLUJO_PASOS.FECHA_NAC:
                await procesarFechaNac(msg, user);
                break;
            case FLUJO_PASOS.MEMBER_ID:
                await procesarMemberId(msg, user);
                break;
            case FLUJO_PASOS.SINTOMAS:
                await procesarSintomas(msg, user);
                break;
            case FLUJO_PASOS.FECHA:
                await procesarFecha(msg, user, chatID);
                break;
            case FLUJO_PASOS.ESPERANDO_CONFIRMACION_CITA:
                await procesarConfirmacionCita(msg, user, chatID);
                break;
        }
    } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
        const lang = detectLanguage(msg.body || '');
        await reply(msg, lang, 'error');
    }
};

module.exports = {
    handleMessage,
    getActiveUsers: () => Object.keys(usuarios).length
};
