import React, { useState, useEffect } from "react";
import {
  criarProfessor,
  obterProfessores,
  atualizarProfessor,
  deletarProfessor,
  obterMaterias,
} from "../horarios/horariosService";
import type { Professor, Materia } from "../horarios/horarios";

const CadastroProfessores: React.FC = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    materias: [] as string[],
  });

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [professoresData, materiasData] = await Promise.all([
        obterProfessores(),
        obterMaterias(),
      ]);
      setProfessores(professoresData);
      setMaterias(materiasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar professores");
    } finally {
      setCarregando(false);
    }
  };

  const limparForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      materias: [],
    });
    setEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editando) {
        await atualizarProfessor(editando, formData);
      } else {
        await criarProfessor(formData);
      }

      limparForm();
      await carregarDados();
    } catch (error) {
      console.error("Erro ao salvar professor:", error);
      setErro("Erro ao salvar professor");
    }
  };

  const handleEditar = (professor: Professor) => {
    setFormData({
      nome: professor.nome,
      email: professor.email,
      telefone: professor.telefone || "",
      materias: professor.materias,
    });
    setEditando(professor.id);
  };

  const handleDeletar = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este professor?")) {
      try {
        await deletarProfessor(id);
        await carregarDados();
      } catch (error) {
        console.error("Erro ao deletar professor:", error);
        setErro("Erro ao deletar professor");
      }
    }
  };

  const handleMateriaChange = (materiaId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      materias: checked
        ? [...prev.materias, materiaId]
        : prev.materias.filter((id) => id !== materiaId),
    }));
  };

  useEffect(() => {
    carregarDados();
  }, []);

  if (carregando) {
    return <div style={{ padding: "20px" }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Cadastro de Professores</h2>

      {erro && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          {erro}
          <button onClick={() => setErro(null)} style={{ marginLeft: "10px" }}>
            ✕
          </button>
        </div>
      )}

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          backgroundColor: "#f9f9f9",
        }}>
        <h3>{editando ? "Editar Professor" : "Novo Professor"}</h3>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}>
            Nome *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nome: e.target.value }))
            }
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}>
            Telefone
          </label>
          <input
            type="tel"
            value={formData.telefone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, telefone: e.target.value }))
            }
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}>
            Matérias que leciona
          </label>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              backgroundColor: "white",
              maxHeight: "150px",
              overflowY: "auto",
            }}>
            {materias.length > 0 ? (
              materias.map((materia) => (
                <label
                  key={materia.id}
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    cursor: "pointer",
                  }}>
                  <input
                    type="checkbox"
                    checked={formData.materias.includes(materia.id)}
                    onChange={(e) =>
                      handleMateriaChange(materia.id, e.target.checked)
                    }
                    style={{ marginRight: "8px" }}
                  />
                  <span style={{ color: materia.cor, fontWeight: "bold" }}>
                    {materia.nome}
                  </span>
                </label>
              ))
            ) : (
              <p style={{ color: "#666", margin: 0 }}>
                Nenhuma matéria cadastrada. Cadastre matérias primeiro.
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}>
            {editando ? "Atualizar" : "Cadastrar"}
          </button>

          {editando && (
            <button
              type="button"
              onClick={limparForm}
              style={{
                backgroundColor: "#666",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de Professores */}
      <h3>Professores Cadastrados</h3>
      {professores.length > 0 ? (
        <div style={{ display: "grid", gap: "15px" }}>
          {professores.map((professor) => (
            <div
              key={professor.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "white",
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 8px 0" }}>{professor.nome}</h4>
                  <p style={{ margin: "4px 0", color: "#666" }}>
                    <strong>Email:</strong> {professor.email}
                  </p>
                  {professor.telefone && (
                    <p style={{ margin: "4px 0", color: "#666" }}>
                      <strong>Telefone:</strong> {professor.telefone}
                    </p>
                  )}
                  <div style={{ marginTop: "8px" }}>
                    <strong>Matérias:</strong>
                    <div style={{ marginTop: "4px" }}>
                      {professor.materias.length > 0 ? (
                        professor.materias.map((materiaId) => {
                          const materia = materias.find(
                            (m) => m.id === materiaId
                          );
                          return materia ? (
                            <span
                              key={materiaId}
                              style={{
                                display: "inline-block",
                                backgroundColor: materia.cor,
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                marginRight: "4px",
                                marginBottom: "4px",
                              }}>
                              {materia.nome}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span style={{ color: "#999" }}>
                          Nenhuma matéria atribuída
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEditar(professor)}
                    style={{
                      backgroundColor: "#2196F3",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(professor.id)}
                    style={{
                      backgroundColor: "#F44336",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}>
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#666" }}>Nenhum professor cadastrado ainda.</p>
      )}
    </div>
  );
};

export default CadastroProfessores;
