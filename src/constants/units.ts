export const UNITS = [
  { value: "saco", label: "Saco" },
  { value: "bag", label: "Bag" },
  { value: "kg", label: "Kg" },
];

export const PRODUCTION = [
  { value: "prod1", label: "Produção 1" },
  { value: "prod2", label: "Produção 2" },
  { value: "prod3", label: "Produção 3" },
];

export const getUnitByValue = (value: string) => {
  return UNITS.find((unit) => unit.value === value);
};
