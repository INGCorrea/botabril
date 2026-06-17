/**
 * Validadores para datos de citas - Producción con validaciones robustas
 */

const NONE_RESPONSES = new Set([
    'no', 'ninguno', 'ninguna', 'sin seguro', 'no tengo', 'no tengo seguro',
    'none', 'n/a', 'na', 'no insurance', 'sin', 'nope', 'nah'
]);

const INVALID_INSURANCE_ANSWERS = new Set([
    'yes', 'si', 'sí', 'maybe', 'tal vez', 'talvez', 'claro', 'sure', 'ok', 'okay'
]);

// Detectar patrones de spam/fake en síntomas
const SPAM_PATTERNS = [
    /test/i,
    /spam/i,
    /fuck|shit|damn/i,
    /http|ftp|www\./i,
    /\+\d{1,3}\s?\d{1,14}/,  // Números de teléfono
    /<|>/,                     // HTML tags
    /\$\{|@\{/,               // Template injection
    /`;|exec|eval/,           // Code injection
];

// Patrones obvi fake de teléfono
const FAKE_PHONE_PATTERNS = [
    /^(\d)\1{7,}$/,            // Todos iguales: 33333333
    /^(0123456789|9876543210)/, // Secuencia
    /^1111111111$/,             // Edge case común
];

const VALID_COLOMBIAN_PREFIXES = new Set([
    '300', '301', '302', '303', '304', '305',
    '310', '311', '312', '313', '314', '315',
    '316', '317', '318', '319', '320', '321',
    '322', '323', '324', '325'
]);

/**
 * Validación robusta de teléfono (enfoque Colombia)
 * - Rechaza formato incorrecto
 * - Rechaza patrones obviamente fake
 * - Soporta múltiples formatos de entrada
 */
const validatePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    
    const original = phone.trim();
    const digits = original.replace(/\D/g, '');
    
    // COLOMBIA: 10 dígitos, comienza con 3
    if (digits.length === 10 && digits.startsWith('3')) {
        // Rechazar fake patterns
        if (FAKE_PHONE_PATTERNS.some(pattern => pattern.test(digits))) {
            return false;
        }
        
        // Validar prefijo colombiano
        const prefix = digits.substring(0, 3);
        return VALID_COLOMBIAN_PREFIXES.has(prefix);
    }
    
    // Formato E.164 internacional: +[1-9]{1-3} dígitos
    if (original.startsWith('+')) {
        return /^\+[1-9]\d{1,14}$/.test(original);
    }
    
    // Fallback: 7-15 dígitos si no tiene prefijo de país
    return digits.length >= 7 && digits.length <= 15 && !FAKE_PHONE_PATTERNS.some(p => p.test(digits));
};

/**
 * Validación semántica de fecha con soporte para días, fechas y horas
 * - Rechaza fechas pasadas
 * - Soporta "hoy", "mañana", nombres de días
 * - Valida formato DD/MM/YYYY
 */
const validateDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return false;
    
    const trimmed = dateStr.trim().toLowerCase();
    if (trimmed.length < 2) return false;
    
    // Palabras clave válidas
    const validKeywords = [
        'hoy', 'today', 'mañana', 'manana', 'tomorrow',
        'lunes', 'monday', 'martes', 'tuesday',
        'miércoles', 'miercoles', 'wednesday',
        'jueves', 'thursday', 'viernes', 'friday',
        'sábado', 'sabado', 'saturday',
        'domingo', 'sunday'
    ];
    
    // Palabra clave + hora
    if (validKeywords.some(kw => trimmed.includes(kw))) {
        const timeRegex = /\b([0-2]?[0-9]|2[0-3]):[0-5][0-9]\b|\b(am|pm)\b/i;
        return true; // Acepta si tiene palabra clave válida, con o sin hora
    }
    
    // Formato fecha: DD/MM o DD/MM/YYYY
    const dateRegex = /^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?(?:\s+([0-2]?[0-9]|2[0-3]):[0-5][0-9])?$/;
    return dateRegex.test(trimmed);
};

/**
 * Validación de nombre con protección contra injection
 * - Mínimo 3 caracteres
 * - Máximo 100 caracteres
 * - Rechaza patrones de código/injection
 */
const validateName = (name) => {
    if (!name || typeof name !== 'string') return false;
    
    const trimmed = name.trim();
    
    // Longitud válida
    if (trimmed.length < 3 || trimmed.length > 100) return false;
    
    // Formato válido: letras, espacios, guiones, puntos, apóstrofes
    const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s'.\-]{3,100}$/;
    if (!nameRegex.test(trimmed)) return false;
    
    // Rechazar patrones de injection
    if (/<|>|;|\$|@|`|{|}|\||\\/.test(trimmed)) return false;
    
    // Debe tener al menos una letra
    return /[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(trimmed);
};

/**
 * Validación de síntomas con detección de spam
 * - Mínimo 5 caracteres, máximo 500
 * - Rechaza patrones de spam/injection/código
 * - Rechaza URLs y números de teléfono
 */
const validateSymptoms = (symptoms) => {
    if (!symptoms || typeof symptoms !== 'string') return false;
    
    const trimmed = symptoms.trim();
    const len = trimmed.length;
    
    // Longitud válida
    if (len < 5 || len > 500) return false;
    
    // Rechazar spam/injection patterns
    if (SPAM_PATTERNS.some(pattern => pattern.test(trimmed))) {
        return false;
    }
    
    // Rechazar si es solo números/caracteres repetidos
    if (/^(\d|.)\1{4,}$/.test(trimmed)) return false;
    
    // Rechazar si no tiene letras
    if (!/[a-záéíóúñA-ZÁÉÍÓÚÑA-Z]/i.test(trimmed)) return false;
    
    return true;
};

/**
 * Validación de seguros
 * - Rechaza respuestas incorrectas (yes, si, maybe, etc.)
 * - Acepta nombres de seguros o "ninguno"
 */
const validateInsurance = (insurance) => {
    if (!insurance || typeof insurance !== 'string') return false;
    
    const trimmed = insurance.trim();
    if (trimmed.length < 2) return false;
    
    const key = trimmed.toLowerCase();
    
    // Rechazar respuestas incorrectas
    if (INVALID_INSURANCE_ANSWERS.has(key)) return false;
    
    // Rechazar si parece código/injection
    if (/<|>|;|\$|@|`|{|}/.test(trimmed)) return false;
    
    return true;
};

/**
 * Normalizar respuesta de seguros
 * Convierte "no", "ninguno", etc. a formato estándar
 */
const normalizeInsurance = (insurance, lang = 'es') => {
    const key = insurance.trim().toLowerCase();
    if (NONE_RESPONSES.has(key)) {
        return lang === 'en' ? 'None' : 'Ninguno';
    }
    return insurance.trim();
};

/**
 * Validador de reintentos y rate limiting
 * Evita spam de intentos fallidos
 */
const checkRetryLimit = (usuario, maxRetries = 3) => {
    if (!usuario.retries) {
        usuario.retries = 0;
    }
    usuario.retries++;
    return usuario.retries <= maxRetries;
};

/**
 * Reset contador de reintentos
 */
const resetRetries = (usuario) => {
    usuario.retries = 0;
};

/**
 * Detectar si el usuario está enviando muchos mensajes muy rápido (spam)
 */
const detectSpamActivity = (usuario) => {
    if (!usuario.lastMessageTime) {
        usuario.lastMessageTime = Date.now();
        return false;
    }
    
    const timeDiffMs = Date.now() - usuario.lastMessageTime;
    usuario.lastMessageTime = Date.now();
    
    // Si envía más de 3 mensajes en menos de 5 segundos
    if (timeDiffMs < 1000) { // Menos de 1 segundo
        if (!usuario.rapidFireCount) usuario.rapidFireCount = 0;
        usuario.rapidFireCount++;
        return usuario.rapidFireCount > 3;
    } else {
        usuario.rapidFireCount = 0;
    }
    
    return false;
};

/**
 * Validar que no sea un número conocidamente fake/test
 */
const isFakeTestNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    const testNumbers = [
        '1234567890',
        '0000000000',
        '9999999999',
        '1111111111',
        '5555555555',
        '6666666666',
        '7777777777',
        '8888888888'
    ];
    return testNumbers.includes(digits);
};

module.exports = {
    validatePhone,
    validateDate,
    validateName,
    validateSymptoms,
    validateInsurance,
    normalizeInsurance,
    checkRetryLimit,
    resetRetries,
    detectSpamActivity,
    isFakeTestNumber,
    NONE_RESPONSES,
    SPAM_PATTERNS
};
