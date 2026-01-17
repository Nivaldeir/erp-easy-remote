/**
 * Formata uma data para o formato brasileiro (dd/mm/yyyy)
 * @param date - Data a ser formatada (Date ou null/undefined)
 * @returns String formatada ou "-" se a data for null/undefined
 */
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata uma data para o formato brasileiro com hora (dd/mm/yyyy HH:mm)
 * @param date - Data a ser formatada (Date ou null/undefined)
 * @returns String formatada ou "-" se a data for null/undefined
 */
export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "-";
  
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

