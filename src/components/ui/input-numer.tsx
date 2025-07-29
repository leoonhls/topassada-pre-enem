// Converte string de moeda pt-BR para float
export function parseCurrencyToFloat(value: string): number {
  const numeric = value
    .replace(/[^\d,]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  return parseFloat(numeric) || 0;
}
export const currencyMask = (e: string) => {
  e = e.replace(/\D/g, ""); // Remove não-dígitos

  if (!e) {
    e = "";
    return e;
  }

  // Converte para número e divide por 100 para considerar centavos
  const numericValue = parseInt(e) / 100;

  // Formata usando o Intl.NumberFormat
  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  e = formatter.format(numericValue);
  return e;
};

export const justNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;
  value = value.replace(/\D/g, "");
  e.target.value = value;
  return e;
};
