import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { toast } from "sonner";

/**
 * Atualiza o timeSlot de um dia/período criando uma nova versão e fechando a anterior
 * @param dayId Dia da semana (ex: 'quarta')
 * @param period Período (ex: 'firstPeriod')
 * @param subjectId Novo id da matéria
 * @param teacherId Novo id do professor
 * @param today Data/hora da alteração
 */
export async function updateTimeSlotVersion(
  dayId: string,
  period: string,
  subjectId: string,
  teacherId: string,
  today: Date
) {
  const versionsRef = collection(
    db,
    `schedules/${dayId}/timeSlots/${period}/versions`
  );
  const nowTimestamp = Timestamp.fromDate(today);

  // Busca a versão atual (a mais recente sem validUntil)
  const q = query(
    versionsRef,
    where("validFrom", "<=", nowTimestamp),
    orderBy("validFrom", "desc")
  );
  const snapshot = await getDocs(q);
  const currentVersionDoc = snapshot.docs.find((doc) => {
    const data = doc.data();
    return !data.validUntil;
  });

  // Atualiza a versão anterior para fechar o período, se necessário
  if (currentVersionDoc) {
    const data = currentVersionDoc.data();
    if (!data.validUntil) {
      try {
        await updateDoc(currentVersionDoc.ref, {
          validUntil: nowTimestamp,
        });
      } catch (e) {
        // Se o documento não existe mais, ignora
        console.warn("Falha ao atualizar versão anterior do timeSlot:", e);
      }
    }
  }

  // Cria nova versão
  await addDoc(versionsRef, {
    subjectId,
    teacherId,
    validFrom: nowTimestamp,
    validUntil: null,
  });
  toast.success("Horário alterado com sucesso!");
}
