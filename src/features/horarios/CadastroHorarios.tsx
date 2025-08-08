import { useCallback, useEffect, useState } from "react";
import { DIAS_SEMANA, DiaSemana, HorarioAula, Materia } from "./horarios";
import {
  atualizarHorario,
  criarHorario,
  deletarHorario,
  obterHorarios,
  obterMaterias,
  obterProfessores,
} from "./horariosService";
import { Professor } from "../user/User";
import { Label } from "@/components/ui/label";
import { SelectSearchDB } from "@/components/common/SelectSearchDB";
import { ScheduleDay } from "../schedule/Schedule";
import { FormField } from "@/components/common/FormField";
import { professorsCollection } from "@/firebase/config";

const CadastroHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioAula[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  const [scheduleDay, setScheduleDay] = useState<ScheduleDay>(
    {} as ScheduleDay
  );

  // Form state
  const [formData, setFormData] = useState({
    professorId: "",
    materiaId: "",
    diaSemana: "segunda" as DiaSemana,
    horaInicio: "",
    horaFim: "",
    sala: "",
  });

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [horariosData, professoresData, materiasData] = await Promise.all([
        obterHorarios(),
        obterProfessores(),
        obterMaterias(),
      ]);
      setHorarios(horariosData);
      setProfessores(professoresData);
      setMaterias(materiasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErro("Erro ao carregar horários");
    } finally {
      setCarregando(false);
    }
  };

  const limparForm = () => {
    setFormData({
      professorId: "",
      materiaId: "",
      diaSemana: "segunda",
      horaInicio: "",
      horaFim: "",
      sala: "",
    });
    setEditando(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (
      !formData.professorId ||
      !formData.materiaId ||
      !formData.horaInicio ||
      !formData.horaFim
    ) {
      setErro("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.horaInicio >= formData.horaFim) {
      setErro("Hora de início deve ser anterior à hora de fim");
      return;
    }

    try {
      if (editando) {
        await atualizarHorario(editando, formData);
      } else {
        await criarHorario(formData);
      }

      limparForm();
      await carregarDados();
    } catch (error) {
      console.error("Erro ao salvar horário:", error);
      setErro("Erro ao salvar horário");
    }
  };

  const handleEditar = (horario: HorarioAula) => {
    setFormData({
      professorId: horario.professorId,
      materiaId: horario.materiaId,
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFim: horario.horaFim,
      sala: horario.sala || "",
    });
    setEditando(horario.id);
  };

  const handleDeletar = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este horário?")) {
      try {
        await deletarHorario(id);
        await carregarDados();
      } catch (error) {
        console.error("Erro ao deletar horário:", error);
        setErro("Erro ao deletar horário");
      }
    }
  };

  // Filtrar matérias do professor selecionado
  const materiasDisponiveis = formData.professorId
    ? materias.filter((materia) => {
        const professor = professores.find(
          (p) => p.id === formData.professorId
        );
        return professor?.subjectsIds.includes(materia.id);
      })
    : [];

  const handleSelectChange = useCallback(
    (field: keyof typeof scheduleDay, selected: any, isMulti = false) => {
      if (isMulti) {
        setScheduleDay((prev) => ({
          ...prev,
          [field]: Array.isArray(selected)
            ? selected.map((item) => item.value)
            : [],
        }));
      } else {
        setScheduleDay((prev) => ({
          ...prev,
          [field]: selected && !Array.isArray(selected) ? selected.value : "",
        }));
      }
    },
    []
  );

  useEffect(() => {
    carregarDados();
  }, []);

  // Limpar matéria quando professor muda
  useEffect(() => {
    if (formData.professorId && !editando) {
      const professor = professores.find((p) => p.id === formData.professorId);
      if (professor && !professor.subjectsIds.includes(formData.materiaId)) {
        setFormData((prev) => ({ ...prev, materiaId: "" }));
      }
    }
  }, [formData.professorId, professores, formData.materiaId, editando]);

  if (carregando) {
    return <div style={{ padding: "20px" }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Cadastro de Horários</h2>

      {erro && (
        <div
          style={{
            color: "red",
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "4px",
          }}>
          {erro}
          <button
            onClick={() => setErro(null)}
            style={{
              marginLeft: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}>
            ✕
          </button>
        </div>
      )}

      {/* Verificações antes de permitir cadastro */}
      {professores.length === 0 && (
        <div
          style={{
            color: "orange",
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid orange",
            borderRadius: "4px",
          }}>
          ⚠️ É necessário cadastrar pelo menos um professor antes de criar
          horários.
        </div>
      )}

      {materias.length === 0 && (
        <div
          style={{
            color: "orange",
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid orange",
            borderRadius: "4px",
          }}>
          ⚠️ É necessário cadastrar pelo menos uma matéria antes de criar
          horários.
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
        <h3>{editando ? "Editar Horário" : "Novo Horário"}</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
          }}>
          <FormField label="Professor" colSpan="">
            <SelectSearchDB
              collection={professorsCollection}
              onSelect={(selected) =>
                handleSelectChange("professorId", selected)
              }
              required
            />
          </FormField>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}>
              Matéria *
            </label>
            <select
              value={formData.materiaId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, materiaId: e.target.value }))
              }
              required
              disabled={
                !formData.professorId || materiasDisponiveis.length === 0
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}>
              <option value="">Selecione uma matéria</option>
              {materiasDisponiveis.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.nome}
                </option>
              ))}
            </select>
            {formData.professorId && materiasDisponiveis.length === 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  margin: "4px 0 0 0",
                }}>
                Este professor não tem matérias atribuídas
              </p>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}>
              Dia da Semana *
            </label>
            <select
              value={formData.diaSemana}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  diaSemana: e.target.value as DiaSemana,
                }))
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}>
              {Object.entries(DIAS_SEMANA).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}>
              Hora de Início *
            </label>
            <input
              type="time"
              value={formData.horaInicio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, horaInicio: e.target.value }))
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

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}>
              Hora de Fim *
            </label>
            <input
              type="time"
              value={formData.horaFim}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, horaFim: e.target.value }))
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

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}>
              Sala
            </label>
            <input
              type="text"
              value={formData.sala}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sala: e.target.value }))
              }
              placeholder="Ex: Sala 101"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={professores.length === 0 || materias.length === 0}
            style={{
              backgroundColor:
                professores.length === 0 || materias.length === 0
                  ? "#ccc"
                  : "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor:
                professores.length === 0 || materias.length === 0
                  ? "not-allowed"
                  : "pointer",
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

      {/* Lista de Horários */}
      <h3>Horários Cadastrados</h3>
      {horarios.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
            }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}>
                  Dia
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}>
                  Horário
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}>
                  Matéria
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}>
                  Professor
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}>
                  Sala
                </th>
                <th
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    textAlign: "left",
                  }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario) => {
                const professor = professores.find(
                  (p) => p.id === horario.professorId
                );
                const materia = materias.find(
                  (m) => m.id === horario.materiaId
                );

                return (
                  <tr key={horario.id}>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {DIAS_SEMANA[horario.diaSemana]}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {horario.horaInicio} - {horario.horaFim}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {materia ? (
                        <span
                          style={{
                            backgroundColor: materia.cor,
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}>
                          {materia.nome}
                        </span>
                      ) : (
                        <span style={{ color: "#999" }}>
                          Matéria não encontrada
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {professor?.name || "Professor não encontrado"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {horario.sala || "-"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => handleEditar(horario)}
                          style={{
                            backgroundColor: "#2196F3",
                            color: "white",
                            padding: "4px 8px",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletar(horario.id)}
                          style={{
                            backgroundColor: "#F44336",
                            color: "white",
                            padding: "4px 8px",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}>
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: "#666" }}>Nenhum horário cadastrado ainda.</p>
      )}
    </div>
  );
};

export default CadastroHorarios;
