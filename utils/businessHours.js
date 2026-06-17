/**
 * Validación de horarios de atención
 * Tijuana: UTC-7 (MST/PDT)
 */

const BUSINESS_HOURS = {
  0: null,           // Domingo: cerrado
  1: [9, 18],        // Lunes: 9:00 - 18:00
  2: [9, 18],        // Martes: 9:00 - 18:00
  3: [9, 18],        // Miércoles: 9:00 - 18:00
  4: [9, 18],        // Jueves: 9:00 - 18:00
  5: [9, 18],        // Viernes: 9:00 - 18:00
  6: [9, 14]         // Sábado: 9:00 - 14:00
};

const getTijuanaTime = () => {
  const now = new Date();
  // Tijuana está en UTC-8 (PST) o UTC-7 (PDT)
  // Usamos directamente la conversión manual
  const tijuanaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  return tijuanaDate;
};

const isWithinBusinessHours = () => {
  const tijuanaTime = getTijuanaTime();
  const dayOfWeek = tijuanaTime.getDay();
  const hour = tijuanaTime.getHours();

  const hours = BUSINESS_HOURS[dayOfWeek];

  // Si no hay horario para este día (cerrado), retornar false
  if (!hours) return false;

  const [openHour, closeHour] = hours;
  return hour >= openHour && hour < closeHour;
};

const getNextOpeningTime = () => {
  const tijuanaTime = getTijuanaTime();
  const dayOfWeek = tijuanaTime.getDay();
  const hour = tijuanaTime.getHours();

  // Si estamos en horario, no hay "próxima apertura"
  if (isWithinBusinessHours()) return null;

  // Búscar el próximo día con horario
  for (let i = 1; i <= 7; i++) {
    const nextDay = (dayOfWeek + i) % 7;
    const hours = BUSINESS_HOURS[nextDay];
    if (hours) {
      const [openHour] = hours;
      const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][nextDay];
      return `${dayName} a las ${openHour}:00`;
    }
  }

  return 'mañana';
};

module.exports = {
  isWithinBusinessHours,
  getNextOpeningTime,
  getTijuanaTime,
  BUSINESS_HOURS
};
