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
    null
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
      className="text-sm rounded-lg w-full bg-gray-800 border-gray-600 text-white"
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
        control: (base, state) => ({
          ...base,

          boxShadow: "none", // Remove the focus ring
          "&:focus": {
            boxShadow: "none", // Remove the focus ring when focused
            borderColor: "#6b7280", // Keep the same border color when focused
          },
          "&:hover": {
            boxShadow: "none", // Remove the focus ring when focused
            borderColor: "#6b7280", // Keep the same border color when focused
          },

          backgroundColor: "#1f2937", // bg-gray-800
          borderColor: state.isFocused ? "#6b7280" : "#4b5563", // border-gray-500 on hover
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "#1f2937", // bg-gray-800
          borderColor: "#4b5563", // border-gray-600
          pointerEvents: "auto", // Garante que os eventos do mouse funcionem
        }),
        option: (base, state) => ({
          ...base,
          fontSize: 14,
          backgroundColor: state.isFocused ? "#374151" : "#1f2937", // bg-gray-700 when focused, bg-gray-800 default
          color: state.isFocused ? "white" : "gray",
          "&:hover": {
            backgroundColor: "#374151", // bg-gray-700
          },
        }),
        singleValue: (base) => ({
          ...base,
          color: "white",
        }),
        input: (base) => ({
          ...base,
          color: "white",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#374151", // bg-gray-700
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "white",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "white",
          "&:hover": {
            backgroundColor: "#4b5563", // bg-gray-600
            color: "white",
          },
        }),
        loadingMessage: (base) => ({
          ...base,
          color: "white",
        }),
        noOptionsMessage: (base) => ({
          ...base,
          fontSize: 14,
          color: "white",
        }),
      }}
    />
  );
}
