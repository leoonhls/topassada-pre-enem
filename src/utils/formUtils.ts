// Utilitários para formulários de transações

export function generateDueDate(installmentNumber: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30 * installmentNumber);
  return date;
}

export function updateInstallmentPercentage(
  prev: Array<{ id: string; percentage: number; value: number; dueDate: Date }>,
  index: number,
  newPercentage: number,
  totalValue: number
) {
  const newList = [...prev];
  const clampedPercentage = Math.min(100, Math.max(0, newPercentage));
  const roundedPercentage = parseFloat(clampedPercentage.toFixed(2));
  newList[index].percentage = roundedPercentage;
  newList[index].value = (roundedPercentage / 100) * totalValue;
  return newList;
}

export function updateInstallmentDate(
  prev: Array<{ id: string; percentage: number; value: number; dueDate: Date }>,
  index: number,
  newDate: Date
) {
  const newList = [...prev];
  newList[index].dueDate = newDate;
  return newList;
}

export function handleSelectChange<T extends object>(
  setter: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  selected: any,
  isMulti = false
) {
  if (isMulti) {
    setter((prev) => ({
      ...prev,
      [field]: Array.isArray(selected)
        ? selected.map((item: any) => item.value)
        : [],
    }));
  } else {
    setter((prev) => ({
      ...prev,
      [field]: selected && !Array.isArray(selected) ? selected.value : "",
    }));
  }
}
