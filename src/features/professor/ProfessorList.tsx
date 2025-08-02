import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfessors } from "./useProfessors";
import { Professor } from "./Professor";
import ProfessorCard from "./ProfessorCard";

export const ProfessorsList = memo(() => {
  // Hooks para gerenciar filtros e paginação

  // Estados para dados e carregamento
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [collSize, setCollSize] = useState("");

  const { fetchProfessorAsync } = useProfessors();

  // Handler para remoção de item
  const handleRemove = useCallback((id: string) => {
    setProfessors((prev) => prev.filter((professor) => professor.id !== id));
  }, []);

  // Função para carregar os dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchProfessorAsync();

      setCollSize(response.collSize.toString());
      setProfessors(response.items);
    } catch (error) {
      console.error(error);
      toast.warning("Erro ao carregar professores");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega dados iniciais ou quando filtros mudam
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div
        className={`mt-4 space-y-4 transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}>
        {professors.map((professor) => (
          <ProfessorCard key={professor.id} professor={professor} />
        ))}
      </div>

      {/* Indicador de Carregamento */}
      {loading && (
        <div className="mt-4 text-center text-gray-400">Carregando...</div>
      )}
    </div>
  );
});
