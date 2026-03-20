/**
 * Capitaliza a primeira letra de cada palavra em uma string
 * @param str - String para capitalizar
 * @returns String com todas as primeiras letras capitalizadas
 */
export const capitalizeWords = (str: string | undefined | null): string => {
  if (!str) return "";

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Capitaliza apenas a primeira letra da string
 * @param str - String para capitalizar
 * @returns String com primeira letra capitalizada
 */
export const capitalizeFirstLetter = (
  str: string | undefined | null,
): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getPreferredName = (
  nome: string | undefined | null,
  nomeSocial: string | undefined | null,
): string => {
  if (nomeSocial && nomeSocial.trim().length > 0) {
    return nomeSocial;
  }
  if (!nome) return "";
  return nome;
};
