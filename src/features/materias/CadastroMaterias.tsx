import React, { useState, useEffect } from "react";
import {
  criarMateria,
  obterMaterias,
  atualizarMateria,
  deletarMateria,
} from "../horarios/horariosService";
import type { Materia } from "../horarios/horarios";

const CadastroMaterias: React.FC = () => {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#2196F3",
    cargaHoraria: 0,
  });

  // Cores predefinidas para facilitar a escolha
  const coresPredefinidas = [
    "#2196F3", // Azul
    "#4CAF50", // Verde
    "#FF9800", // Laranja
    "#F44336", // Vermelho
    "#9C27B0", // Roxo
    "#607D8B", // Azul Acinzentado
    "#795548", // Marrom
    "#E91E63", // Rosa
    "#009688", // Teal
    "#FF5722", // Laranja Escuro
    "#3F51B5", // Índigo
    "#8BC34A", // Verde Claro
  ];

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const materiasData = await obterMaterias();
      setMaterias(materiasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar matérias");
    } finally {
      setCarregando(false);
    }
  };

  const limparForm = () => {
    setFormData({
      nome: "",
      cor: "#2196F3",
      cargaHoraria: 0,
    });
    setEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editando) {
        await atualizarMateria(editando, formData);
      } else {
        await criarMateria(formData);
      }

      limparForm();
      await carregarDados();
    } catch (error) {
      console.error("Erro ao salvar matéria:", error);
      setErro("Erro ao salvar matéria");
    }
  };

  const handleEditar = (materia: Materia) => {
    setFormData({
      nome: materia.nome,
      cor: materia.cor,
      cargaHoraria: materia.cargaHoraria,
    });
    setEditando(materia.id);
  };

  const handleDeletar = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta matéria?")) {
      try {
        await deletarMateria(id);
        await carregarDados();
      } catch (error) {
        console.error("Erro ao deletar matéria:", error);
        setErro("Erro ao deletar matéria");
      }
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (carregando) {
    return <div className="p-5 text-center">Carregando...</div>;
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Cadastro de Matérias
      </h2>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-5 flex items-center justify-between">
          <span>{erro}</span>
          <button
            onClick={() => setErro(null)}
            className="ml-3 text-red-600 hover:text-red-800 font-bold text-lg">
            ✕
          </button>
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="border border-gray-300 p-5 rounded-lg mb-8 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          {editando ? "Editar Matéria" : "Nova Matéria"}
        </h3>

        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700">
            Nome da Matéria *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nome: e.target.value }))
            }
            required
            placeholder="Ex: Matemática, Português, etc."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700">
            Cor (para identificação visual)
          </label>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="color"
              value={formData.cor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cor: e.target.value }))
              }
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <span
              className="px-3 py-2 rounded font-bold text-white"
              style={{ backgroundColor: formData.cor }}>
              {formData.nome || "Preview"}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Cores sugeridas:</p>
            <div className="flex flex-wrap gap-1">
              {coresPredefinidas.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, cor }))}
                  className={`w-8 h-8 rounded cursor-pointer border-2 ${
                    formData.cor === cor ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: cor }}
                  title={cor}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold text-gray-700">
            Carga Horária (horas por semana)
          </label>
          <input
            type="number"
            min="0"
            max="40"
            value={formData.cargaHoraria}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                cargaHoraria: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded font-medium transition-colors">
            {editando ? "Atualizar" : "Cadastrar"}
          </button>

          {editando && (
            <button
              type="button"
              onClick={limparForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded font-medium transition-colors">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de Matérias */}
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Matérias Cadastradas
      </h3>
      {materias.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((materia) => (
            <div
              key={materia.id}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div
                className="text-white p-4 font-bold text-lg"
                style={{ backgroundColor: materia.cor }}>
                {materia.nome}
              </div>

              <div className="p-4">
                <p className="mb-2 text-gray-600">
                  <strong>Carga Horária:</strong> {materia.cargaHoraria}h/semana
                </p>
                <p className="mb-4 text-gray-600 text-sm">
                  <strong>Cor:</strong> {materia.cor}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(materia)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(materia.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma matéria cadastrada ainda.</p>
      )}
    </div>
  );
};

export default CadastroMaterias;
