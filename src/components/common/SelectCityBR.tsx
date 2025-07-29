import { useEffect, useState } from "react";
import Select from "react-select";

interface Option {
  value: string;
  label: string;
  latitude?: number;
  longitude?: number;
  codigo_ibge?: string;
}

interface Props {
  uf: string; // sigla do estado, ex: 'MG'
  onSelect?: (value: Option | null) => void;
  required?: boolean;
  placeholder?: string;
  value?: string;
  isDisabled?: boolean;
}

export function SelectCityBR({
  uf,
  onSelect,
  required = false,
  placeholder = "Selecione a cidade...",
  value: valueProp,
  isDisabled,
}: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<Option | null>(null);

  useEffect(() => {
    if (!uf) {
      setOptions([]);
      setValue(null);
      return;
    }
    setLoading(true);
    fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${uf}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOptions(
            data.map((city: any) => ({
              value: city.nome,
              label: city.nome,
              codigo_ibge: city.codigo_ibge,
            }))
          );
        } else {
          setOptions([]);
        }
      })
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [uf]);

  useEffect(() => {
    if (valueProp && options.length > 0) {
      const selected = options.find((opt) => opt.value === valueProp) || null;
      setValue(selected);
    } else if (!valueProp) {
      setValue(null);
    }
  }, [valueProp, options]);

  const handleChange = async (selected: Option | null) => {
    setValue(selected);
    if (selected) {
      // Busca coordenadas pelo nome da cidade e UF
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          selected.label
        )}&state=${encodeURIComponent(uf)}&country=Brasil&format=json`
      );
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        onSelect?.({
          ...selected,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
        return;
      }
      // Se não encontrar, retorna sem coordenadas
      onSelect?.(selected);
    } else {
      onSelect?.(null);
    }
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      isDisabled={isDisabled}
      options={options}
      isLoading={loading}
      isClearable
      placeholder={placeholder}
      required={required}
      className="text-sm rounded-lg w-full bg-gray-800 border-gray-600 text-white"
      classNamePrefix="select"
      menuPortalTarget={
        typeof window !== "undefined" ? document.body : undefined
      }
      noOptionsMessage={() => "Selecione a UF"}
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        control: (base, state) => ({
          ...base,
          boxShadow: "none",
          backgroundColor: "#1f2937",
          borderColor: state.isFocused ? "#6b7280" : "#4b5563",
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
