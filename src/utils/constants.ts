import { DistanceUnit, ProfileLevel, ThemeMode, WeightUnit } from "../types/models";

export const APP_NAME = "IronTrack Fitness";
export const DEFAULT_THEME: ThemeMode = "dark";
export const DEFAULT_ACCENT_COLOR = "#ff6b2c";

export const accentColorOptions = [
  "#ff6b2c",
  "#3ddc97",
  "#18a0fb",
  "#ffd166",
  "#ef476f",
];

export const profileGoalOptions = [
  "Ganar masa muscular",
  "Perder grasa",
  "Mejorar condición física",
  "Mantenerme activo",
];

export const profileLevelOptions: Array<{ label: string; value: ProfileLevel }> = [
  { label: "Principiante", value: "beginner" },
  { label: "Intermedio", value: "intermediate" },
  { label: "Avanzado", value: "advanced" },
];

export const weightUnitOptions: Array<{ label: string; value: WeightUnit }> = [
  { label: "kg", value: "kg" },
  { label: "lb", value: "lb" },
];

export const distanceUnitOptions: Array<{ label: string; value: DistanceUnit }> = [
  { label: "km", value: "km" },
  { label: "mi", value: "mi" },
];

export const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: "Oscuro", value: "dark" },
];

export const initialEquipmentSeed = [
  { name: "Cinta de correr", category: "Cardio", notes: "Trabajo aeróbico y calentamiento." },
  { name: "Bicicleta estática", category: "Cardio", notes: "Sesiones de cardio moderado." },
  { name: "Bandas elásticas", category: "Accesorios", notes: "Movilidad, activación y resistencia." },
  { name: "Mancuernas", category: "Peso libre", notes: "Trabajo unilateral y auxiliar." },
  { name: "Máquina de poleas", category: "Polea", notes: "Ejercicios guiados y accesorios." },
  { name: "Remo bajo en polea", category: "Polea", notes: "Trabajo de espalda." },
  { name: "Press banca", category: "Banco", notes: "Press horizontal." },
  { name: "Banco multifunción", category: "Banco", notes: "Incluye trabajo de cuádriceps y femoral." },
  { name: "Barra de dominadas", category: "Calistenia", notes: "Trabajo de tracción." },
  { name: "Barra Z", category: "Peso libre", notes: "Curl y extensiones." },
  { name: "Pesas/discos", category: "Peso libre", notes: "Carga progresiva." },
  { name: "Saco de boxeo", category: "Boxeo", notes: "Trabajo por rondas y técnica." },
  { name: "Cuerda para tríceps", category: "Polea", notes: "Accesorio de aislamiento." },
  { name: "Agarres de polea", category: "Polea", notes: "Varios agarres intercambiables." },
  { name: "Esterilla", category: "Suelo", notes: "Core, movilidad y estiramientos." },
  { name: "Espejo grande", category: "Entorno", notes: "Control postural y técnica." },
];

