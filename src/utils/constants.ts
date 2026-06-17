import {
  DistanceUnit,
  ExerciseType,
  ProfileLevel,
  ThemeMode,
  WeightUnit,
} from "../types/models";

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

export const exerciseTypeOptions: Array<{ label: string; value: ExerciseType }> = [
  { label: "Fuerza", value: "fuerza" },
  { label: "Cardio", value: "cardio" },
  { label: "Boxeo", value: "boxeo" },
  { label: "Movilidad", value: "movilidad" },
  { label: "Abdomen", value: "abdomen" },
];

export const initialExerciseSeed = [
  {
    name: "Press banca",
    muscleGroup: "Pecho",
    type: "fuerza" as const,
    defaultRestSeconds: 90,
    description: "Press horizontal básico con banco y carga libre.",
    technicalNotes: "Mantén escápulas retraídas y pies firmes.",
    executionTips: "Baja controlando la barra y empuja en línea estable.",
    equipmentNames: ["Press banca", "Pesas/discos"],
  },
  {
    name: "Press banca inclinado",
    muscleGroup: "Pecho",
    type: "fuerza" as const,
    defaultRestSeconds: 90,
    description: "Variante inclinada para enfatizar la parte superior del pecho.",
    technicalNotes: "Ajusta el respaldo y evita elevar hombros.",
    executionTips: "Mantén antebrazos verticales en la parte media del recorrido.",
    equipmentNames: ["Banco multifunción", "Pesas/discos"],
  },
  {
    name: "Aperturas con mancuernas",
    muscleGroup: "Pecho",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Aislamiento del pecho con recorrido amplio.",
    technicalNotes: "Ligerísima flexión de codos durante todo el movimiento.",
    executionTips: "No bajes más de lo que puedas controlar sin dolor.",
    equipmentNames: ["Mancuernas", "Banco multifunción"],
  },
  {
    name: "Cruces en polea",
    muscleGroup: "Pecho",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Trabajo de aducción horizontal con tensión constante.",
    technicalNotes: "Tronco estable y hombros abajo.",
    executionTips: "Junta manos frente al cuerpo sin perder control excéntrico.",
    equipmentNames: ["Máquina de poleas", "Agarres de polea"],
  },
  {
    name: "Dominadas",
    muscleGroup: "Espalda",
    type: "fuerza" as const,
    defaultRestSeconds: 90,
    description: "Ejercicio básico de tracción vertical.",
    technicalNotes: "Evita balanceos y busca rango completo.",
    executionTips: "Piensa en llevar el pecho hacia la barra.",
    equipmentNames: ["Barra de dominadas"],
  },
  {
    name: "Jalón al pecho",
    muscleGroup: "Espalda",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Tracción vertical guiada en polea.",
    technicalNotes: "Pecho abierto y sin tirar con la zona lumbar.",
    executionTips: "Lleva el agarre hacia la parte alta del pecho.",
    equipmentNames: ["Máquina de poleas", "Agarres de polea"],
  },
  {
    name: "Remo bajo en polea",
    muscleGroup: "Espalda",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Remo horizontal guiado para espalda media.",
    technicalNotes: "Columna neutra y pecho alto.",
    executionTips: "Lleva codos atrás sin encoger hombros.",
    equipmentNames: ["Remo bajo en polea"],
  },
  {
    name: "Face pull",
    muscleGroup: "Hombro posterior",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Trabajo de deltoide posterior y estabilidad escapular.",
    technicalNotes: "Codos altos y rotación externa al final.",
    executionTips: "Tira de la cuerda hacia la cara separando extremos.",
    equipmentNames: ["Máquina de poleas", "Cuerda para tríceps"],
  },
  {
    name: "Extensión de cuádriceps",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Aislamiento de cuádriceps en banco multifunción.",
    technicalNotes: "Ajusta el eje de la rodilla con la máquina.",
    executionTips: "Extiende y pausa un instante arriba.",
    equipmentNames: ["Banco multifunción"],
  },
  {
    name: "Curl femoral",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Aislamiento de isquiosurales.",
    technicalNotes: "Evita despegar la cadera del banco.",
    executionTips: "Flexiona con control y baja lentamente.",
    equipmentNames: ["Banco multifunción"],
  },
  {
    name: "Sentadilla con mancuernas",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Patrón básico de rodilla y cadera con carga libre.",
    technicalNotes: "Rodillas alineadas con la punta de los pies.",
    executionTips: "Desciende hasta donde mantengas la espalda estable.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Zancadas",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Trabajo unilateral de piernas y estabilidad.",
    technicalNotes: "Tronco erguido y apoyo estable.",
    executionTips: "Da un paso suficiente para no colapsar la rodilla delantera.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Peso muerto rumano",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 90,
    description: "Bisagra de cadera para glúteo e isquios.",
    technicalNotes: "Espalda neutra y barra pegada al cuerpo.",
    executionTips: "Empuja la cadera atrás y sube apretando glúteos.",
    equipmentNames: ["Barra Z", "Pesas/discos"],
  },
  {
    name: "Press militar con mancuernas",
    muscleGroup: "Hombros",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Empuje vertical para hombros.",
    technicalNotes: "Costillas abajo y glúteos activos.",
    executionTips: "Empuja hacia arriba sin arquear en exceso la espalda.",
    equipmentNames: ["Mancuernas", "Banco multifunción"],
  },
  {
    name: "Elevaciones laterales",
    muscleGroup: "Hombros",
    type: "fuerza" as const,
    defaultRestSeconds: 45,
    description: "Aislamiento de deltoide lateral.",
    technicalNotes: "Codos suaves y hombros relajados.",
    executionTips: "Sube hasta línea de hombros sin impulsarte.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Curl barra Z",
    muscleGroup: "Bíceps",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Curl de bíceps con agarre cómodo.",
    technicalNotes: "Codos cerca del torso y sin balanceo.",
    executionTips: "Sube contrayendo bíceps y baja completo.",
    equipmentNames: ["Barra Z", "Pesas/discos"],
  },
  {
    name: "Curl con mancuernas",
    muscleGroup: "Bíceps",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Curl unilateral o bilateral con recorrido libre.",
    technicalNotes: "Evita mover el hombro para ayudar.",
    executionTips: "Gira la palma arriba al subir si te resulta cómodo.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Jalón con cuerda",
    muscleGroup: "Tríceps",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Extensión de codo en polea para tríceps.",
    technicalNotes: "Codos pegados al cuerpo durante todo el gesto.",
    executionTips: "Separa la cuerda al final para completar la extensión.",
    equipmentNames: ["Máquina de poleas", "Cuerda para tríceps"],
  },
  {
    name: "Plancha",
    muscleGroup: "Core",
    type: "abdomen" as const,
    defaultRestSeconds: 45,
    description: "Trabajo isométrico de core.",
    technicalNotes: "Cadera alineada y abdomen activo.",
    executionTips: "Empuja el suelo con antebrazos y no dejes caer la zona lumbar.",
    equipmentNames: ["Esterilla"],
  },
  {
    name: "Crunch",
    muscleGroup: "Core",
    type: "abdomen" as const,
    defaultRestSeconds: 45,
    description: "Flexión de tronco para abdomen.",
    technicalNotes: "No tires del cuello con las manos.",
    executionTips: "Exhala al subir y baja controlando.",
    equipmentNames: ["Esterilla"],
  },
  {
    name: "Cinta de correr",
    muscleGroup: "Cardio",
    type: "cardio" as const,
    defaultRestSeconds: 30,
    description: "Trabajo aeróbico continuo o por intervalos.",
    technicalNotes: "Mantén una zancada natural y estable.",
    executionTips: "Empieza suave y sube progresivamente ritmo o inclinación.",
    equipmentNames: ["Cinta de correr"],
  },
  {
    name: "Bicicleta estática",
    muscleGroup: "Cardio",
    type: "cardio" as const,
    defaultRestSeconds: 30,
    description: "Cardio de bajo impacto.",
    technicalNotes: "Ajusta altura del sillín antes de empezar.",
    executionTips: "Mantén cadencia constante y hombros relajados.",
    equipmentNames: ["Bicicleta estática"],
  },
  {
    name: "Saco de boxeo",
    muscleGroup: "Boxeo",
    type: "boxeo" as const,
    defaultRestSeconds: 60,
    description: "Trabajo de técnica, potencia y rounds.",
    technicalNotes: "Protege muñecas y mantén guardia activa.",
    executionTips: "Muévete alrededor del saco y combina golpes simples.",
    equipmentNames: ["Saco de boxeo"],
  },
];

export const mediaTypeExtensions = ["gif", "webp", "mp4", "jpg", "jpeg", "png"] as const;

export const workoutDifficultyOptions = [
  "Fácil",
  "Normal",
  "Difícil",
  "Muy difícil",
] as const;

export const workoutDiscomfortOptions = [
  "Sin molestias",
  "Molestia leve",
  "Molestia moderada",
  "Dolor",
] as const;
