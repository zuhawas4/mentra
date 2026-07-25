/** Mentra brand tokens — shared across web, extension, mobile, desktop */
export const mentraTokens = {
  background: "#F7F7FB",
  surface: "#FFFFFF",
  ink: "#20202A",
  muted: "#7D7E91",
  border: "#E9E9F1",
  primary: "#5142D8",
  primaryDark: "#382AB5",
  primarySoft: "#F0EEFF",
  success: "#18775A",
  successSoft: "#E6F7F0",
  amber: "#D67820",
  amberSoft: "#FFF2E5",
  danger: "#C43C3C",
  dangerSoft: "#FDECEC",
} as const;

export const boardColors = [
  { id: "violet", value: "#5142D8", label: "Violet" },
  { id: "blue", value: "#2F6FED", label: "Blue" },
  { id: "green", value: "#18775A", label: "Green" },
  { id: "orange", value: "#D67820", label: "Orange" },
  { id: "black", value: "#20202A", label: "Black" },
] as const;

export const strokeWidths = [2, 4, 6, 10] as const;
