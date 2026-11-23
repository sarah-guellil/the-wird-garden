// El personaje de la usuaria: opciones disponibles y cómo se guarda.

export type HairStyle = "long" | "bob" | "bun" | "curly";
export type Accessory = "none" | "daisy" | "rose" | "bow";

export type AvatarLook = {
  hijab: boolean;
  skin: string;
  hijabColor: string;
  dress: string;
  hair: HairStyle;
  hairColor: string;
  scarf: string; // pañuelo al cuello, solo sin hijab
  accessory: Accessory;
};

export const SKINS = ["#F7DFCF", "#EFCBB0", "#DDAA85", "#C68B62", "#9E6A47", "#6F4A33"];
export const HIJAB_COLORS = ["#F6DDE3", "#D98BA0", "#CFE3CB", "#C9D7EE", "#E7DCF3", "#F3E6C9", "#FFFFFF", "#3D2B33"];
export const DRESS_COLORS = ["#CFE3CB", "#F6DDE3", "#C9D7EE", "#E7DCF3", "#F3E6C9", "#9C7A97"];
export const HAIR_COLORS = ["#2B1D17", "#5A3A28", "#8A5A3B", "#C68E5A", "#E2C08D", "#A5413A"];
export const HAIR_STYLES: HairStyle[] = ["long", "bob", "bun", "curly"];
export const ACCESSORIES: Accessory[] = ["none", "daisy", "rose", "bow"];

export const DEFAULT_LOOK: AvatarLook = {
  hijab: true,
  skin: SKINS[1],
  hijabColor: HIJAB_COLORS[1],
  dress: DRESS_COLORS[4],
  hair: "long",
  hairColor: HAIR_COLORS[1],
  scarf: HIJAB_COLORS[0],
  accessory: "daisy",
};

export const AVATAR_STORAGE_KEY = "twg-avatar";

// Oscurece un color: shade("#ffffff", 0.9) → un gris muy claro. Sirve para bordes y sombras.
export function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (value: number) => Math.round(value * factor);
  return `rgb(${channel(n >> 16)}, ${channel((n >> 8) & 255)}, ${channel(n & 255)})`;
}