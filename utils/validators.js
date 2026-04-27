/**
 * Validadores para datos de citas
 */

const validatePhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]{7,}$/;
    return phoneRegex.test(phone.trim());
};

const validateDate = (dateStr) => {
    // Acepta formatos como "2024-04-27", "27/04/2024", "27 de abril", etc.
    const dateRegex = /^[\d\-\/\s]+|[a-záéíóú\s]+$/i;
    return dateStr.trim().length >= 5 && dateRegex.test(dateStr);
};

const validateName = (name) => {
    const nameRegex = /^[a-záéíóúñ\s]{3,}$/i;
    return nameRegex.test(name.trim());
};

const validateSymptoms = (symptoms) => {
    return symptoms.trim().length >= 5 && symptoms.trim().length <= 500;
};

module.exports = {
    validatePhone,
    validateDate,
    validateName,
    validateSymptoms
};
