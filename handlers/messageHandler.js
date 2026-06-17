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
    normalizeInsurance
} = require('../utils/validators');
const { t, detectLanguage } = require('../utils/i18n');
const { getIntent, isSingleLetter } = require('../utils/intents');

const usuarios = {};

const FLUJO_PASOS = {
    NOMBRE: 'nombre',
    TELEFONO: 'telefono',
    SEGURO: 'seguro',
    SINTOMAS: 'sintomas',
    FECHA: 'fecha'
};

const isMediaMessage = (msg) => msg.hasMedia || msg.type !== 'chat';

const isGroupOrBroadcast = (msg) =>
    msg.from.includes('@broadcast') ||
    msg.from.includes('@newsletter') ||
    msg.from.includes('@g.us');

const reply = async (msg, lang, key, ...args) => {
    await msg.reply(t(lang, key, ...args));
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
    await reply(msg, lang, 'menu');
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
        await reply(msg, lang, 'citaNombreInvalido');
        return;
    }
    user.datos.nombre = msg.body.trim();
    user.paso = FLUJO_PASOS.TELEFONO;
    await reply(msg, lang, 'citaTelefono');
};

const procesarTelefono = async (msg, user) => {
    const { lang } = user;
    if (!validatePhone(msg.body)) {
        await reply(msg, lang, 'citaTelefonoInvalido');
        return;
    }
    user.datos.telefono = msg.body.trim();
    user.paso = FLUJO_PASOS.SEGURO;
    await reply(msg, lang, 'citaSeguro');
};

const procesarSeguro = async (msg, user) => {
    const { lang } = user;
    if (!validateInsurance(msg.body)) {
        await reply(msg, lang, 'citaSeguroInvalido');
        return;
    }
    user.datos.seguro = normalizeInsurance(msg.body, lang);
    user.paso = FLUJO_PASOS.SINTOMAS;
    await reply(msg, lang, 'citaSintomas');
};

const procesarSintomas = async (msg, user) => {
    const { lang } = user;
    if (!validateSymptoms(msg.body)) {
        await reply(msg, lang, 'citaSintomasInvalido');
        return;
    }
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

    await reply(msg, lang, 'citaResumen', user.datos);

    try {
        saveCita({ ...user.datos, idioma: lang });
        console.log('✨ NUEVA CITA REGISTRADA:', user.datos);
    } catch (error) {
        console.error('⚠️  Cita registrada pero con error al guardar:', error);
    }

    delete usuarios[chatID];
};

const handleIdleMessage = async (msg, chatID, texto) => {
    const lang = detectLanguage(msg.body || '');
    const intent = getIntent(texto);

    if (intent === 'cancelar') {
        await reply(msg, lang, 'noEntiendo');
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
        if (msg.fromMe) return;
        if (isGroupOrBroadcast(msg)) return;

        const chatID = msg.from;
        const texto = msg.body ? msg.body.toLowerCase().trim() : '';

        // Permitir cambio explícito de idioma escribiendo 'es' o 'en'
        if (texto === 'es' || texto === 'en') {
            usuarios[chatID] = usuarios[chatID] || { paso: null, datos: {}, lang: texto };
            usuarios[chatID].lang = texto;
            await reply(msg, texto, 'idiomaCambiado');
            await enviarMenu(msg, texto);
            return;
        }

        if (isMediaMessage(msg) && usuarios[chatID]) {
            const lang = getLang(msg, chatID);
            await reply(msg, lang, 'soloTexto');
            return;
        }

        if (usuarios[chatID] && getIntent(texto) === 'cancelar') {
            await cancelarFlujo(msg, chatID);
            return;
        }

        if (!usuarios[chatID]) {
            await handleIdleMessage(msg, chatID, texto);
            return;
        }

        const user = usuarios[chatID];
        if (!user) return;

        switch (user.paso) {
            case FLUJO_PASOS.NOMBRE:
                await procesarNombre(msg, user);
                break;
            case FLUJO_PASOS.TELEFONO:
                await procesarTelefono(msg, user);
                break;
            case FLUJO_PASOS.SEGURO:
                await procesarSeguro(msg, user);
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
        const lang = detectLanguage(msg.body || '');
        await reply(msg, lang, 'error');
    }
};

module.exports = {
    handleMessage,
    getActiveUsers: () => Object.keys(usuarios).length
};
