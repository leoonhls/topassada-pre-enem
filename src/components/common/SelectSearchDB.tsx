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
  controlledValue?: string;
}

export function SelectSearchDB({
  collection,
  collections,
  onSelect,
  required = false,
  isMulti = false,
  placeholder = "Pesquisar...",
  controlledValue,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [allOptions, setAllOptions] = useState<Option[]>([]); // Armazena todas as opções
  const [options, setOptions] = useState<Option[]>([]);
  const [value, setValue] = useState<SingleValue<Option> | MultiValue<Option>>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (controlledValue === "") {
      setValue(null);
      if (onSelect) onSelect(null);
    }
  }, [controlledValue, onSelect]);

  // Cache em memória
  const cache = useRef<Map<string, Option[]>>(new Map());

  const fetchOptions = useCallback(
    async (term: string) => {
      try {
        setLoading(true);

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

            const q = query(coll, where("active", "==", true), orderBy("name"));

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

  // Busca todas as opções ao montar
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        let fetched: Option[] = [];
        if (collections && collections.length > 0) {
          for (const coll of collections) {
            const q = query(coll, where("active", "==", true), orderBy("name"));
            const snapshot = await getDocs(q);
            const optionsFromColl = snapshot.docs.map((doc) => ({
              value: doc.id,
              label: capitalizeWords(doc.data().name),
            }));
            fetched.push(...optionsFromColl);
          }
        } else if (collection) {
          const q = query(
            collection,
            where("active", "==", true),
            orderBy("name")
          );
          const snapshot = await getDocs(q);
          fetched = snapshot.docs.map((doc) => ({
            value: doc.id,
            label: capitalizeWords(doc.data().name),
          }));
        }
        setAllOptions(fetched);
        setOptions(fetched);
      } catch (error) {
        console.error("Error fetching all options:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [collection, collections]);

  // Filtra as opções no client-side, ignorando maiúsculas/minúsculas
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (newValue.length === 0) {
      setOptions(allOptions);
    } else {
      setOptions(
        allOptions.filter((opt) =>
          opt.label.toLowerCase().includes(newValue.toLowerCase())
        )
      );
    }
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
      value={controlledValue ? { value: "", label: controlledValue } : value}
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
      classNamePrefix="select"
      styles={{
        menu: (base) => ({
          ...base,
          zIndex: 2147483647, // Máximo z-index possível para ficar acima do dialog
        }),
      }}
    />
  );
}
