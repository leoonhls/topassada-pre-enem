import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLessons } from "./useLessons";
import { Lesson } from "./Lesson";
import LessonCard from "./LessonCard";

export const LessonsList = memo(() => {
  // Hooks para gerenciar filtros e paginação

  // Estados para dados e carregamento
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [collSize, setCollSize] = useState("");

  const { fetchLessonAsync } = useLessons();

  // Handler para remoção de item
  const handleRemove = useCallback((id: string) => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
  }, []);

  // Função para carregar os dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchLessonAsync();

      setCollSize(response.collSize.toString());
      setLessons(response.items);
    } catch (error) {
      console.error(error);
      toast.warning("Erro ao carregar lessones");
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
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>

      {/* Indicador de Carregamento */}
      {loading && (
        <div className="mt-4 text-center text-gray-400">Carregando...</div>
      )}
    </div>
  );
});
