import type { NasaCategory } from "./types";

export const NASA_CATEGORIES: NasaCategory[] = [
  { id: "earth", label: "Earth", icon: "🌍" },
  { id: "ocean", label: "Ocean", icon: "🌊" },
  { id: "moon", label: "Moon", icon: "🌙" },
  { id: "space_weather", label: "Space Weather", icon: "☀️" },
  { id: "space", label: "Space", icon: "🌌" },
  { id: "satellites", label: "Satellites", icon: "🛰️" },
  { id: "earth_at_night", label: "Earth at Night", icon: "🌃" },
  { id: "earth_science", label: "Earth Science", icon: "🌱" },
];

export function getCategory(id: string): NasaCategory | undefined {
  return NASA_CATEGORIES.find((c) => c.id === id);
}
