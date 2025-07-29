import { useEffect, useState } from "react";
import Select from "react-select";

interface Option {
  value: string; // sigla do estado, ex: 'MG'
  label: string; // nome do estado, ex: 'Minas Gerais'
}

interface Props {
  onSelect?: (value: Option | null) => void;
  required?: boolean;
  placeholder?: string;
  value?: string;
  isDisabled?: boolean;
}

export function SelectUfBR({
  onSelect,
  required = false,
  placeholder = "Selecione o estado...",
  value: valueProp,
  isDisabled,
}: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<Option | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://brasilapi.com.br/api/ibge/uf/v1")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sorted = data
            .map((uf: any) => ({
              value: uf.sigla,
              label: uf.sigla, // <-- Apenas a sigla
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
          setOptions(sorted);
        } else {
          setOptions([]);
        }
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (valueProp && options.length > 0) {
      const selected = options.find((opt) => opt.value === valueProp) || null;
      setValue(selected);
    } else if (!valueProp) {
      setValue(null);
    }
  }, [valueProp, options]);

  const handleChange = (selected: Option | null) => {
    setValue(selected);
    onSelect?.(selected);
  };

  return (
    <Select
      isDisabled={isDisabled}
      value={value}
      onChange={handleChange}
      options={options}
      isLoading={loading}
      isClearable
      placeholder={placeholder}
      required={required}
      className="text-sm rounded-lg bg-gray-800 border-gray-600 text-white"
      classNamePrefix="select"
      menuPortalTarget={
        typeof window !== "undefined" ? document.body : undefined
      }
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        container: (base) => ({
          ...base,
          minWidth: "fit-content",
          whiteSpace: "nowrap",
        }),
        control: (base, state) => ({
          ...base,
          boxShadow: "none",
          backgroundColor: "#1f2937",
          borderColor: state.isFocused ? "#6b7280" : "#4b5563",
          minWidth: "fit-content",
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: "#1f2937",
          borderColor: "#4b5563",
        }),
        option: (base, state) => ({
          ...base,
          fontSize: 14,
          backgroundColor: state.isFocused ? "#374151" : "#1f2937",
          color: state.isFocused ? "white" : "gray",
          "&:hover": {
            backgroundColor: "#374151",
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
