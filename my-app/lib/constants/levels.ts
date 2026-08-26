export const PLAYER_LEVELS = [
  { value: 1, label: "มือใหม่" },
  { value: 2, label: "BG" },
  { value: 3, label: "N" },
  { value: 4, label: "S" },
  { value: 5, label: "P" },
  { value: 6, label: "P+" },
] as const;

export function levelLabel(level: number | null): string {
  return PLAYER_LEVELS.find((item) => item.value === level)?.label ?? "-";
}
