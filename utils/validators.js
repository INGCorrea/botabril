/**
 * Validadores para datos de citas
 */

const NONE_RESPONSES = new Set([
    'no', 'ninguno', 'ninguna', 'sin seguro', 'no tengo', 'no tengo seguro',
    'none', 'n/a', 'na', 'no insurance', 'sin', 'nope', 'nah'
]);

const validatePhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]{7,}$/;
    return phoneRegex.test(phone.trim());
};

const validateDate = (dateStr) => {
    const dateRegex = /^[\d\-\/\s.,:]+|[a-záéíóúñ\s]+$/i;
    return dateStr.trim().length >= 5 && dateRegex.test(dateStr);
};

const validateName = (name) => {
    const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s'.-]{3,}$/;
    const trimmed = name.trim();
    return nameRegex.test(trimmed) && /[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(trimmed);
};

const validateSymptoms = (symptoms) => {
    const len = symptoms.trim().length;
    return len >= 5 && len <= 500;
};

const validateInsurance = (insurance) => {
    const trimmed = insurance.trim();
    if (trimmed.length < 2) return false;
    return true;
};

const normalizeInsurance = (insurance, lang = 'es') => {
    const key = insurance.trim().toLowerCase();
    if (NONE_RESPONSES.has(key)) {
        return lang === 'en' ? 'None' : 'Ninguno';
    }
    return insurance.trim();
};

module.exports = {
    validatePhone,
    validateDate,
    validateName,
    validateSymptoms,
    validateInsurance,
    normalizeInsurance,
    NONE_RESPONSES
};
