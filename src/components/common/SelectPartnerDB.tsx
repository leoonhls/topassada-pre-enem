import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { SelectSearchDB } from "@/components/common/SelectSearchDB";
import { suppliersCollection, clientsCollection } from "@/firebase/config";

interface Option {
  value: string;
  label: string;
}

interface SelectPartnerDBProps {
  onSelect: (selected: Option | Option[] | null) => void;
  isMulti?: boolean;
  placeholder?: string;
  required?: boolean;
}

export function SelectPartnerDB({
  onSelect,
  isMulti = false,
  placeholder = "Selecionar",
  required = true,
}: SelectPartnerDBProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      const [suppliersSnap, clientsSnap] = await Promise.all([
        getDocs(suppliersCollection),
        getDocs(clientsCollection),
      ]);
      const suppliers = suppliersSnap.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().name || doc.data().fantasyName || "Fornecedor",
      }));
      const clients = clientsSnap.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().name || doc.data().fantasyName || "Cliente",
      }));
      setOptions([...suppliers, ...clients]);
      setLoading(false);
    }
    fetchPartners();
  }, []);

  return (
    <SelectSearchDB
      collection={null}
      collections={[suppliersCollection, clientsCollection]}
      onSelect={onSelect}
      isMulti={isMulti}
      placeholder={placeholder}
      required={required}
    />
  );
}
