export const days = ["segunda", "terça", "quarta", "quinta", "sexta"] as const;
export type Day = (typeof days)[number];
