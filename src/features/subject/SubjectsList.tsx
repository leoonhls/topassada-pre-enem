import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubjects } from "./useSubject";
import { Subject } from "./Subject";
import SubjectCard from "./SubjectCard";

export const SubjectsList = memo(() => {
  // Hooks para gerenciar filtros e paginação

  // Estados para dados e carregamento
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [collSize, setCollSize] = useState("");

  const { fetchSubjectAsync } = useSubjects();

  // Handler para remoção de item
  const handleRemove = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  }, []);

  // Função para carregar os dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchSubjectAsync();

      setCollSize(response.collSize.toString());
      setSubjects(response.items);
    } catch (error) {
      console.error(error);
      toast.warning("Erro ao carregar subjectes");
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
      {/* Lista de Compras */}
      <div
        className={`flex flex-wrap gap-3 transition-opacity duration-200 ${
          loading ? "opacity-50" : "opacity-100"
        }`}>
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>

      {/* Indicador de Carregamento */}
      {loading && (
        <div className="mt-4 text-center text-gray-400">Carregando...</div>
      )}
    </div>
  );
});
