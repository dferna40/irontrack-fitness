import {
  AppearanceThemeMode,
  BackgroundMode,
  CardStyle,
  DistanceUnit,
  ExerciseType,
  ProfileLevel,
  TextSize,
  ThemeMode,
  TimerStyle,
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
  "Mejorar condicion fisica",
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

export const appearanceThemeOptions: Array<{ label: string; value: AppearanceThemeMode }> = [
  { label: "Oscuro", value: "dark" },
  { label: "Claro", value: "light" },
  { label: "Automatico", value: "system" },
];

export const cardStyleOptions: Array<{ label: string; value: CardStyle }> = [
  { label: "Compacto", value: "compact" },
  { label: "Normal", value: "normal" },
  { label: "Grande", value: "large" },
];

export const textSizeOptions: Array<{ label: string; value: TextSize }> = [
  { label: "Pequeno", value: "small" },
  { label: "Normal", value: "normal" },
  { label: "Grande", value: "large" },
];

export const timerStyleOptions: Array<{ label: string; value: TimerStyle }> = [
  { label: "Digital", value: "digital" },
  { label: "Circular", value: "circular" },
  { label: "Barra", value: "bar" },
];

export const backgroundModeOptions: Array<{ label: string; value: BackgroundMode }> = [
  { label: "Por defecto", value: "default" },
  { label: "Color solido", value: "solid" },
  { label: "Degradado", value: "gradient" },
  { label: "Imagen", value: "image" },
];

export const backgroundColorOptions = [
  "#0b0f14",
  "#141a22",
  "#1d3557",
  "#264653",
  "#3a0f0f",
  "#1b4332",
];

export const gradientPresetOptions = [
  { label: "Hierro", start: "#0b0f14", end: "#1b2430" },
  { label: "Fuego", start: "#2b0f0f", end: "#ff6b2c" },
  { label: "Acero", start: "#0f1722", end: "#334155" },
  { label: "Bosque", start: "#102a1b", end: "#2d6a4f" },
];

export const initialEquipmentSeed = [
  { name: "Cinta de correr", category: "Cardio", notes: "Trabajo aerobico y calentamiento." },
  { name: "Bicicleta estÃ¡tica", category: "Cardio", notes: "Sesiones de cardio moderado." },
  { name: "Bandas elÃ¡sticas", category: "Accesorios", notes: "Movilidad, activacion y resistencia." },
  { name: "Mancuernas", category: "Peso libre", notes: "Trabajo unilateral y auxiliar." },
  { name: "MÃ¡quina de poleas", category: "Polea", notes: "Ejercicios guiados y accesorios." },
  { name: "Remo bajo en polea", category: "Polea", notes: "Trabajo de espalda." },
  { name: "Press banca", category: "Banco", notes: "Press horizontal." },
  { name: "Banco multifunciÃ³n", category: "Banco", notes: "Incluye trabajo de cuadriceps y femoral." },
  { name: "Barra de dominadas", category: "Calistenia", notes: "Trabajo de traccion." },
  { name: "Barra Z", category: "Peso libre", notes: "Curl y extensiones." },
  { name: "Pesas/discos", category: "Peso libre", notes: "Carga progresiva." },
  { name: "Saco de boxeo", category: "Boxeo", notes: "Trabajo por rondas y tecnica." },
  { name: "Cuerda para trÃ­ceps", category: "Polea", notes: "Accesorio de aislamiento." },
  { name: "Agarres de polea", category: "Polea", notes: "Varios agarres intercambiables." },
  { name: "Esterilla", category: "Suelo", notes: "Core, movilidad y estiramientos." },
  { name: "Espejo grande", category: "Entorno", notes: "Control postural y tecnica." },
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
    muscleGroup: "Pectoral",
    type: "fuerza" as const,
    defaultRestSeconds: 90,
    description: "Press horizontal base para pecho con carga libre.",
    technicalNotes: "Manten escapulas retraidas y apoyo firme.",
    executionTips: "Desciende con control y empuja en linea estable.",
    equipmentNames: ["Press banca", "Pesas/discos"],
  },
  {
    name: "Press banca inclinado",
    muscleGroup: "Pectoral",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Variante inclinada para la parte superior del pecho.",
    technicalNotes: "Ajusta el banco y evita subir hombros.",
    executionTips: "Manten antebrazos verticales y rango controlado.",
    equipmentNames: ["Banco multifunciÃ³n", "Pesas/discos"],
  },
  {
    name: "Aperturas con mancuernas",
    muscleGroup: "Pectoral",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Aislamiento de pecho con recorrido amplio.",
    technicalNotes: "Ligera flexion de codos durante todo el gesto.",
    executionTips: "No bajes mas de lo que puedas controlar.",
    equipmentNames: ["Mancuernas", "Banco multifunciÃ³n"],
  },
  {
    name: "Cruces en polea",
    muscleGroup: "Pectoral",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Trabajo de polea para pecho con tension continua.",
    technicalNotes: "Tronco estable y hombros abajo.",
    executionTips: "Cierra al frente y vuelve lento en la negativa.",
    equipmentNames: ["MÃ¡quina de poleas", "Agarres de polea"],
  },
  {
    name: "Jalón al pecho",
    muscleGroup: "Dorsal",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Traccion vertical guiada para espalda.",
    technicalNotes: "Pecho abierto y lumbar estable.",
    executionTips: "Lleva el agarre hacia la parte alta del pecho.",
    equipmentNames: ["MÃ¡quina de poleas", "Agarres de polea"],
  },
  {
    name: "Remo bajo en polea",
    muscleGroup: "Dorsal",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Remo horizontal guiado para espalda media y dorsal.",
    technicalNotes: "Columna neutra y pecho alto.",
    executionTips: "Lleva codos atras sin encoger hombros.",
    equipmentNames: ["Remo bajo en polea"],
  },
  {
    name: "Remo con mancuerna",
    muscleGroup: "Dorsal",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Remo unilateral con mancuerna.",
    technicalNotes: "Apoya el tronco y evita girarte al subir.",
    executionTips: "Tira con el codo hacia atras y controla la bajada.",
    equipmentNames: ["Mancuernas", "Banco multifunciÃ³n"],
  },
  {
    name: "Dominadas",
    muscleGroup: "Dorsal",
    type: "fuerza" as const,
    defaultRestSeconds: 90,
    description: "Traccion vertical basica con peso corporal.",
    technicalNotes: "Evita balanceos y busca rango completo.",
    executionTips: "Piensa en llevar el pecho hacia la barra.",
    equipmentNames: ["Barra de dominadas"],
  },
  {
    name: "Extensión de cuádriceps",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Aislamiento de cuadriceps en banco multifuncion.",
    technicalNotes: "Ajusta el eje de rodilla antes de empezar.",
    executionTips: "Extiende, pausa arriba y baja lento.",
    equipmentNames: ["Banco multifunciÃ³n"],
  },
  {
    name: "Curl femoral en polea baja",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Trabajo de femoral con polea baja.",
    technicalNotes: "Mantente estable y evita compensar con la cadera.",
    executionTips: "Flexiona con control y vuelve lento.",
    equipmentNames: ["MÃ¡quina de poleas", "Agarres de polea"],
  },
  {
    name: "Sentadilla con mancuernas",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 90,
    description: "Patron basico de sentadilla con carga libre.",
    technicalNotes: "Rodillas alineadas y tronco estable.",
    executionTips: "Desciende con control y sube apretando gluteos.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Elevacion de gemelos",
    muscleGroup: "Piernas",
    type: "fuerza" as const,
    defaultRestSeconds: 45,
    description: "Trabajo directo de gemelos con carga opcional.",
    technicalNotes: "Busca rango completo y evita rebotes.",
    executionTips: "Sube fuerte, pausa arriba y baja lento.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Press Arnold con mancuernas",
    muscleGroup: "Hombros",
    type: "fuerza" as const,
    defaultRestSeconds: 75,
    description: "Press de hombros con rotacion natural.",
    technicalNotes: "No arquees en exceso la espalda al empujar.",
    executionTips: "Sube en linea estable y controla la bajada.",
    equipmentNames: ["Mancuernas", "Banco multifunciÃ³n"],
  },
  {
    name: "Pajaro con mancuernas",
    muscleGroup: "Hombros",
    type: "fuerza" as const,
    defaultRestSeconds: 45,
    description: "Trabajo de hombro posterior con mancuernas.",
    technicalNotes: "Mantente inclinado y evita el impulso.",
    executionTips: "Abre lateralmente y controla cada repeticion.",
    equipmentNames: ["Mancuernas", "Banco multifunciÃ³n"],
  },
  {
    name: "Elevacion frontal con mancuernas",
    muscleGroup: "Hombros",
    type: "fuerza" as const,
    defaultRestSeconds: 45,
    description: "Aislamiento del deltoide frontal.",
    technicalNotes: "Sube sin balancear el tronco.",
    executionTips: "Eleva hasta la altura del hombro y baja lento.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Curl barra Z",
    muscleGroup: "Biceps",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Curl de biceps con agarre comodo y estable.",
    technicalNotes: "Codos cerca del torso y sin impulso.",
    executionTips: "Sube contrayendo fuerte y baja completo.",
    equipmentNames: ["Barra Z", "Pesas/discos"],
  },
  {
    name: "Curl con mancuernas",
    muscleGroup: "Biceps",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Curl de biceps con recorrido libre.",
    technicalNotes: "Evita elevar el hombro para ayudarte.",
    executionTips: "Supina si te resulta comodo y controla la negativa.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Curl concentrado con mancuernas",
    muscleGroup: "Biceps",
    type: "fuerza" as const,
    defaultRestSeconds: 45,
    description: "Curl concentrado para aislamiento de biceps.",
    technicalNotes: "Apoya el brazo y evita balancearte.",
    executionTips: "Aprieta arriba y vuelve lentamente.",
    equipmentNames: ["Mancuernas", "Banco multifunciÃ³n"],
  },
  {
    name: "Extension de triceps en polea alta",
    muscleGroup: "Triceps",
    type: "fuerza" as const,
    defaultRestSeconds: 60,
    description: "Extension de codo en polea alta para triceps.",
    technicalNotes: "Codos fijos junto al cuerpo.",
    executionTips: "Extiende por completo sin usar impulso.",
    equipmentNames: ["MÃ¡quina de poleas", "Agarres de polea"],
  },
  {
    name: "Extension de triceps con cuerda",
    muscleGroup: "Triceps",
    type: "fuerza" as const,
    defaultRestSeconds: 45,
    description: "Variante con cuerda para extension final.",
    technicalNotes: "Mantiene el torso estable y los codos fijos.",
    executionTips: "Separa la cuerda al final del movimiento.",
    equipmentNames: ["MÃ¡quina de poleas", "Cuerda para trÃ­ceps"],
  },
  {
    name: "Patada de triceps",
    muscleGroup: "Triceps",
    type: "fuerza" as const,
    defaultRestSeconds: 45,
    description: "Aislamiento de triceps con mancuerna.",
    technicalNotes: "Brazo alto y tronco estable.",
    executionTips: "Extiende completo y vuelve muy lento.",
    equipmentNames: ["Mancuernas"],
  },
  {
    name: "Plancha",
    muscleGroup: "Abdominales",
    type: "abdomen" as const,
    defaultRestSeconds: 30,
    description: "Trabajo isometrico de core y estabilidad.",
    technicalNotes: "Cadera alineada y abdomen muy activo.",
    executionTips: "Empuja el suelo y evita hundir la zona lumbar.",
    equipmentNames: ["Esterilla"],
  },
  {
    name: "Crunch",
    muscleGroup: "Abdominales",
    type: "abdomen" as const,
    defaultRestSeconds: 30,
    description: "Flexion de tronco clasica para abdomen.",
    technicalNotes: "No tires del cuello con las manos.",
    executionTips: "Exhala al subir y vuelve lento.",
    equipmentNames: ["Esterilla"],
  },
  {
    name: "Elevaciones de piernas",
    muscleGroup: "Abdominales",
    type: "abdomen" as const,
    defaultRestSeconds: 30,
    description: "Trabajo abdominal con enfasis en la zona inferior.",
    technicalNotes: "Mantiene la zona lumbar controlada.",
    executionTips: "Eleva las piernas sin impulsarte y baja lento.",
    equipmentNames: ["Esterilla"],
  },
  {
    name: "Cinta de correr",
    muscleGroup: "Cardio",
    type: "cardio" as const,
    defaultRestSeconds: 30,
    description: "Cardio continuo o por intervalos.",
    technicalNotes: "Manten una zancada natural y estable.",
    executionTips: "Empieza suave y sube ritmo o inclinacion de forma progresiva.",
    equipmentNames: ["Cinta de correr"],
  },
  {
    name: "Bicicleta estática",
    muscleGroup: "Cardio",
    type: "cardio" as const,
    defaultRestSeconds: 30,
    description: "Cardio de bajo impacto y facil de regular.",
    technicalNotes: "Ajusta la altura del sillin antes de empezar.",
    executionTips: "Mantiene una cadencia constante y hombros relajados.",
    equipmentNames: ["Bicicleta estÃ¡tica"],
  },
  {
    name: "Saco de boxeo",
    muscleGroup: "Boxeo",
    type: "boxeo" as const,
    defaultRestSeconds: 60,
    description: "Trabajo de tecnica, potencia y rounds.",
    technicalNotes: "Protege munecas y manten guardia activa.",
    executionTips: "Muevete alrededor del saco y combina golpes simples.",
    equipmentNames: ["Saco de boxeo"],
  },
  {
    name: "FitXR",
    muscleGroup: "Cardio VR",
    type: "cardio" as const,
    defaultRestSeconds: 30,
    description: "Sesion cardiovascular interactiva en Meta Quest 3.",
    technicalNotes: "Usa espacio despejado e intensidad progresiva.",
    executionTips: "Cuenta como cardio si mantienes esfuerzo moderado o alto.",
    equipmentNames: [],
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
