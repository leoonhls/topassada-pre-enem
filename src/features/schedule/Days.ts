export const days = ["segunda", "terça", "quarta", "quinta", "sexta"] as const;
export type Day = (typeof days)[number];

export const periods = {
  firstPeriod: "19:00-19:40",
  secondPeriod: "19:40-20:20",
  thirdPeriod: "20:40-21:20",
  fourthPeriod: "21:20-22:00",
} as const;
export type Period = (typeof periods)[keyof typeof periods];

export const getCurrentDay = (selectedDate: Date) => {
  const dayOfWeek = selectedDate.getDay(); // 0 = domingo, 1 = segunda, etc.

  const dayMap = {
    1: "segunda",
    2: "terça",
    3: "quarta",
    4: "quinta",
    5: "sexta",
  };

  return dayMap[dayOfWeek as keyof typeof dayMap] || null;
};
