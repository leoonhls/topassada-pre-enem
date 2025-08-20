import { useFirestoreCollection } from "@/hooks/useFirestoreCollection";
import { DaySchedule } from "./DaySchedule";
import {
  where,
  Timestamp,
  collection,
  query,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// Interface para versões de horário com campos temporais
interface ScheduleVersion {
  id: string;
  subjectId: string;
  teacherId: string;
  validFrom: Timestamp;
  validUntil?: Timestamp;
}

export function useOptimizedSchedules() {
  const { fetchItems } = useFirestoreCollection<DaySchedule>({
    collectionName: "schedules",
    defaultFilters: [],
  });

  /**
   * Versão otimizada server-side usando subcoleções
   * Para máxima eficiência, considere reestruturar como:
   *
   * schedules/{dayId}/versions/{versionId}
   * - validFrom: Timestamp
   * - validUntil: Timestamp | null
   * - timeSlots: {...}
   */
  const fetchScheduleOptimized = async (selectedDate?: Date) => {
    const targetDate = selectedDate || new Date();
    const targetTimestamp = Timestamp.fromDate(targetDate);

    try {
      // Estratégia 1: Query server-side se a estrutura permitir
      // Se os schedules tiverem validFrom/validUntil no nível raiz:
      const response = await fetchItems();

      // Filtro client-side apenas para arrays internos (mínimo processamento)
      const items = response.items.map((schedule) => {
        const { timeSlots } = schedule;

        // Se timeSlots for estrutura de arrays com validação temporal
        const getValidSlot = (slotArray: any) => {
          if (!Array.isArray(slotArray)) return slotArray;

          // Busca binária ou filtro otimizado para encontrar versão válida
          const validSlots = slotArray.filter((slot) => {
            if (!slot.validFrom) return false;

            const validFrom = slot.validFrom.toDate
              ? slot.validFrom.toDate()
              : new Date(slot.validFrom);
            if (targetDate < validFrom) return false;

            if (slot.validUntil) {
              const validUntil = slot.validUntil.toDate
                ? slot.validUntil.toDate()
                : new Date(slot.validUntil);
              return targetDate < validUntil;
            }

            return true;
          });

          // Retorna o mais recente (última versão válida)
          return validSlots.length > 0
            ? validSlots[validSlots.length - 1]
            : slotArray[0];
        };

        return {
          ...schedule,
          timeSlots: {
            firstPeriod: getValidSlot(timeSlots.firstPeriod),
            secondPeriod: getValidSlot(timeSlots.secondPeriod),
            break: timeSlots.break,
            thirdPeriod: getValidSlot(timeSlots.thirdPeriod),
            fourthPeriod: getValidSlot(timeSlots.fourthPeriod),
          },
        };
      });

      return { ...response, items };
    } catch (error) {
      console.warn("Fallback para query simples:", error);
      // Fallback para query simples
      return fetchScheduleAsync(selectedDate);
    }
  };

  /**
   * Versão para subcoleções (máxima otimização)
   * Estrutura recomendada: schedules/{dayId}/timeSlots/{periodId}/versions/{versionId}
   */
  const fetchFromSubcollections = async (selectedDate?: Date) => {
    const targetDate = selectedDate || new Date();
    const targetTimestamp = Timestamp.fromDate(targetDate);

    const schedules: DaySchedule[] = [];
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    for (const dayId of daysOfWeek) {
      try {
        // Query para cada período com filtro server-side
        const periodsData: any = {};
        const periods = [
          "firstPeriod",
          "secondPeriod",
          "thirdPeriod",
          "fourthPeriod",
        ];

        for (const period of periods) {
          const versionsRef = collection(
            db,
            `schedules/${dayId}/timeSlots/${period}/versions`
          );
          const versionsQuery = query(
            versionsRef,
            where("validFrom", "<=", targetTimestamp),
            orderBy("validFrom", "desc") // Mais recente primeiro
          );

          const versionsSnapshot = await getDocs(versionsQuery);
          const validVersions = versionsSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((version: any) => {
              if (version.validUntil) {
                return (
                  targetTimestamp.toMillis() < version.validUntil.toMillis()
                );
              }
              return true; // Válido indefinidamente
            });

          periodsData[period] = validVersions[0] || null; // Mais recente válido
        }

        if (Object.values(periodsData).some(Boolean)) {
          schedules.push({
            id: dayId as any,
            timeSlots: {
              firstPeriod: periodsData.firstPeriod,
              secondPeriod: periodsData.secondPeriod,
              break: { type: "interval" },
              thirdPeriod: periodsData.thirdPeriod,
              fourthPeriod: periodsData.fourthPeriod,
            },
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar ${dayId}:`, error);
      }
    }

    return {
      items: schedules,
      total: schedules.length,
      hasMore: false,
      lastDoc: null,
      collSize: schedules.length,
    };
  };

  // Função original como fallback
  const fetchScheduleAsync = async (selectedDate?: Date) => {
    const response = await fetchItems();
    const targetDate = selectedDate || new Date();

    const getValidItem = (value: any, targetDate: Date) => {
      if (!Array.isArray(value)) return value;

      const validItems = value.filter((item) => {
        if (!item.validFrom) return false;

        const validFrom = item.validFrom.toDate
          ? item.validFrom.toDate()
          : new Date(item.validFrom);
        const isAfterValidFrom = targetDate >= validFrom;

        if (!item.validUntil) return isAfterValidFrom;

        const validUntil = item.validUntil.toDate
          ? item.validUntil.toDate()
          : new Date(item.validUntil);
        const isBeforeValidUntil = targetDate < validUntil;

        return isAfterValidFrom && isBeforeValidUntil;
      });

      return validItems.length > 0
        ? validItems[validItems.length - 1]
        : value[value.length - 1];
    };

    const items = response.items.map((schedule) => {
      const { timeSlots } = schedule;
      return {
        ...schedule,
        timeSlots: {
          firstPeriod: getValidItem(timeSlots.firstPeriod, targetDate),
          secondPeriod: getValidItem(timeSlots.secondPeriod, targetDate),
          break: timeSlots.break,
          thirdPeriod: getValidItem(timeSlots.thirdPeriod, targetDate),
          fourthPeriod: getValidItem(timeSlots.fourthPeriod, targetDate),
        },
      };
    });
    return { ...response, items };
  };

  return {
    fetchScheduleAsync,
    fetchScheduleOptimized,
    fetchFromSubcollections,
  };
}
