import {
  CollectionReference,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MultiValue, SingleValue } from "react-select";
import Select from "react-select";
import { capitalizeWords } from "../../utils/stringUtils";

export interface Option {
  value: string;
  label: string;
}

interface Props {
  collection: CollectionReference | null;
  collections?: CollectionReference[];
  onSelect?: (value: Option | Option[] | null) => void;
  required?: boolean;
  isMulti?: boolean;
  placeholder?: string;
}

export function SelectSearchDB({
  collection,
  collections,
  onSelect,
  required = false,
  isMulti = false,
  placeholder = "Pesquisar...",
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [value, setValue] = useState<SingleValue<Option> | MultiValue<Option>>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Cache em memória
  const cache = useRef<Map<string, Option[]>>(new Map());

  const fetchOptions = useCallback(
    async (term: string) => {
      if (term.length < 2) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);

        const searchTerm = term.toLowerCase();
        const searchTermEnd = searchTerm + "\uf8ff"; // Caractere de fim para range query

        if (collections && collections.length > 0) {
          // Verifica cache primeiro

          // Busca em múltiplas coleções
          const allOptions: Option[] = [];
          for (const coll of collections) {
            const cacheKey = `${coll.id}:${term.toLowerCase()}`;
            if (cache.current.has(cacheKey)) {
              setOptions(cache.current.get(cacheKey)!);
              return;
            }

            const q = query(
              coll,
              where("name", ">=", searchTerm),
              where("name", "<=", searchTermEnd),
              where("active", "==", true),
              orderBy("name")
            );

            const snapshot = await getDocs(q);

            const optionsFromColl = snapshot.docs.map((doc) => ({
              value: doc.id,
              label: capitalizeWords(doc.data().name),
            }));
            allOptions.push(...optionsFromColl);
            cache.current.set(cacheKey, allOptions);
          }
          setOptions(allOptions);

          return;
        }
        if (collection) {
          // Verifica cache primeiro
          const cacheKey = `${collection.id}:${term.toLowerCase()}`;
          if (cache.current.has(cacheKey)) {
            setOptions(cache.current.get(cacheKey)!);
            return;
          }

          // Cria query com filtro server-side
          const q = query(
            collection,
            where("name", ">=", searchTerm),
            where("name", "<=", searchTermEnd),
            where("active", "==", true),
            orderBy("name")
          );

          const snapshot = await getDocs(q);
          const newOptions = snapshot.docs.map((doc) => ({
            value: doc.id,
            label: capitalizeWords(doc.data().name),
          }));

          // Atualiza cache
          cache.current.set(cacheKey, newOptions);
          setOptions(newOptions);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoading(false);
      }
    },
    [collection]
  );
  // Debounce para evitar muitas requisições
  const debouncedFetch = useRef(
    debounce((term: string) => fetchOptions(term), 300)
  ).current;

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    debouncedFetch(newValue);
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
      isLoading={loading}
      required={required}
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
      styles={{
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999, // Garante que o dropdown fique acima do dialog
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
