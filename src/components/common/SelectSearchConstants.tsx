import { useState } from "react";
import type { MultiValue, SingleValue } from "react-select";
import Select from "react-select";

export interface Option {
  value: string | number;
  label: string;
}

interface Props {
  options: Option[];
  onSelect?: (value: Option | Option[] | null) => void;
  required?: boolean;
  isMulti?: boolean;
  placeholder?: string;
}

export function SelectSearchConstants({
  options,
  onSelect,
  required = false,
  isMulti = false,
  placeholder = "Pesquisar...",
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState<SingleValue<Option> | MultiValue<Option>>(
    null,
  );

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const handleChange = (newValue: SingleValue<Option> | MultiValue<Option>) => {
    setValue(newValue);
    if (onSelect) {
      if (isMulti) {
        onSelect(newValue as Option[]);
      } else {
        onSelect(newValue as Option);
      }
    }
  };

  return (
    <Select
      inputValue={inputValue}
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={options}
      isMulti={isMulti}
      isClearable
      placeholder={placeholder}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 2
          ? "Digite pelo menos 2 caracteres..."
          : "Nenhum resultado encontrado"
      }
      className="text-sm rounded-lg w-full bg-card border-border text-foreground"
      classNamePrefix="select"
      menuPortalTarget={
        typeof window !== "undefined" ? document.body : undefined
      }
      required={required}
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 99999, // Valor ainda maior para garantir que fique acima do dialog
          pointerEvents: "auto", // Garante que os eventos do mouse funcionem
        }),
      }}
    />
  );
}
