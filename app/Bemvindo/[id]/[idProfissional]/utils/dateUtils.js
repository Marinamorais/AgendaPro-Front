/**
 * @module utils/dateUtils
 * @description Funções utilitárias para manipulação de datas na agenda.
 */

/**
 * Gera um array de objetos Date para os 7 dias da semana com base em uma data de referência.
 * A semana começa na Segunda-feira.
 * @param {Date} currentDate - A data de referência (qualquer dia da semana desejada).
 * @returns {Date[]} Um array com os 7 objetos Date da semana.
 */
export const getWeekDays = (currentDate) => {
  const date = new Date(currentDate);
  // O cálculo abaixo ajusta a data para a Segunda-feira da semana atual.
  // getDay() retorna 0 para Domingo, 1 para Segunda, ..., 6 para Sábado.
  const dayOfWeek = date.getDay();
  const difference = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Se for domingo (0), volta 6 dias. Senão, volta para a segunda (1).
  
  const monday = new Date(date.setDate(difference));

  // Cria um array com as 7 datas da semana a partir da Segunda-feira.
  return Array.from({ length: 7 }).map((_, i) => {
    const weekDay = new Date(monday);
    weekDay.setDate(monday.getDate() + i);
    return weekDay;
  });
};

/**
 * Gera uma lista de horários em intervalos definidos.
 * (Função exemplo, pode ser expandida no futuro se necessário)
 * @param {string} start - Horário de início (ex: "08:00").
 * @param {string} end - Horário de fim (ex: "20:00").
 * @param {number} interval - Intervalo em minutos.
 * @returns {string[]} Um array de horários formatados.
 */
export const generateTimeSlots = (start = "08:00", end = "20:00") => {
  const slots = [];
  for (let i = parseInt(start); i <= parseInt(end); i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};