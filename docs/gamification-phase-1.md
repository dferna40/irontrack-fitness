# Gamificacion Fase 1

## Contexto real del proyecto

El workspace actual de IronTrack Fitness no usa React + Vite + Express + Prisma.
Ahora mismo es una app Expo / React Native con SQLite local y sin backend.

Para no rehacer la aplicacion, esta fase deja:

- diseno tecnico del modulo de gamificacion
- contrato de datos
- propuesta de esquema Prisma independiente

La propuesta de Prisma esta pensada para dos escenarios compatibles:

1. una futura extraccion a backend Node + Express + Prisma
2. un mapeo 1:1 a tablas SQLite locales si decides mantener arquitectura offline

## Objetivo de la fase 1

Anadir un modulo independiente de gamificacion con:

- XP por entrenamiento completado
- niveles
- logros basicos
- progreso visible en frontend

Sin implementar aun:

- calculo completo de reglas
- triggers automaticos
- endpoints
- servicios de negocio finales
- UI final completa

## Enfoque modular

El modulo se separa en cuatro capas:

### 1. Persistencia

Responsabilidad:

- guardar progreso total de XP
- guardar historial de eventos de XP
- guardar definiciones de logros
- guardar desbloqueos por perfil
- guardar configuracion de niveles

Entidades principales:

- `GamificationProfile`
- `XpEvent`
- `LevelDefinition`
- `AchievementDefinition`
- `ProfileAchievement`

### 2. Dominio

Responsabilidad:

- decidir cuanto XP dar
- calcular nivel actual
- detectar logros desbloqueados
- evitar duplicados

Servicios previstos:

- `awardWorkoutXp(profileId, workoutId)`
- `recalculateLevel(totalXp)`
- `evaluateAchievements(profileId, context)`
- `getGamificationSummary(profileId)`

### 3. Integracion con entrenamiento

Punto de entrada previsto:

- al finalizar un entrenamiento y guardarlo en `workouts` / `workout_sets`

Flujo previsto:

1. se guarda el entrenamiento
2. se crea un `XpEvent`
3. se actualiza `GamificationProfile.totalXp`
4. se recalcula `currentLevel`
5. se evaluan logros basicos
6. el frontend lee un resumen agregado

### 4. Presentacion

Bloques UI previstos para Material UI o equivalente:

- tarjeta de nivel actual
- barra de progreso al siguiente nivel
- resumen de XP ganado recientemente
- lista de logros desbloqueados
- lista de logros bloqueados con progreso parcial

## Modelo de datos propuesto

### GamificationProfile

Representa el estado agregado de gamificacion por perfil.

Campos:

- `id`
- `profileId`
- `totalXp`
- `currentLevel`
- `currentLevelXp`
- `nextLevelXp`
- `createdAt`
- `updatedAt`

Notas:

- `profileId` debe ser unico
- evita recalcular siempre todo desde cero

### XpEvent

Historial auditable de XP.

Campos:

- `id`
- `profileId`
- `workoutId` nullable
- `sourceType`
- `sourceId` nullable
- `xpAmount`
- `reason`
- `metadata` nullable JSON
- `createdAt`

Casos iniciales de `sourceType`:

- `workout_completed`
- `achievement_unlocked`
- `manual_adjustment`

### LevelDefinition

Tabla configurable para no quemar niveles en codigo.

Campos:

- `id`
- `level`
- `xpRequired`
- `title`
- `createdAt`
- `updatedAt`

Ejemplo fase 1:

- nivel 1: 0 XP
- nivel 2: 100 XP
- nivel 3: 250 XP
- nivel 4: 450 XP
- nivel 5: 700 XP

### AchievementDefinition

Catalogo de logros.

Campos:

- `id`
- `code`
- `name`
- `description`
- `category`
- `icon`
- `xpReward`
- `isActive`
- `criteriaType`
- `criteriaValue`
- `createdAt`
- `updatedAt`

Logros basicos iniciales sugeridos:

- `first_workout`
- `three_workouts`
- `ten_workouts`
- `first_strength_workout`
- `first_cardio_workout`
- `seven_day_streak` preparado para futuro

### ProfileAchievement

Relacion entre perfil y logro desbloqueado.

Campos:

- `id`
- `profileId`
- `achievementId`
- `unlockedAt`
- `progressValue`
- `createdAt`
- `updatedAt`

Notas:

- `profileId + achievementId` debe ser unico
- `progressValue` permite mostrar avance parcial

## Reglas iniciales de XP

Se dejan documentadas, no implementadas aun:

- completar entrenamiento de rutina: `+25 XP`
- completar entrenamiento libre: `+20 XP`
- completar cardio: `+15 XP`
- completar boxeo: `+15 XP`
- desbloquear logro: `+xpReward` del logro

Ajustes futuros posibles:

- bonus por volumen
- bonus por racha
- bonus por dificultad

## Logros basicos de fase 1

### Entrenamientos

- Primer entrenamiento completado
- 3 entrenamientos completados
- 10 entrenamientos completados

### Tipo de entrenamiento

- Primer entrenamiento de fuerza
- Primera sesion de cardio

### Preparado para fases siguientes

- Racha semanal
- Record personal
- Cumplimiento de rutina

## Integracion propuesta con estructura actual

Aunque este repo no tenga Prisma en runtime, el modulo encaja asi:

- `src/repositories/gamificationRepository.ts`
- `src/services/gamification.ts`
- `src/seed/gamification.ts`
- `src/screens/ProgressScreen.tsx` para mostrar resumen
- `src/screens/HomeScreen.tsx` para mini widget opcional

## Consultas que necesitara el frontend

### Resumen de gamificacion

Devuelve:

- nivel actual
- XP total
- XP hacia siguiente nivel
- porcentaje de progreso
- ultimos eventos de XP
- logros recientes

### Lista de logros

Devuelve:

- logros desbloqueados
- logros bloqueados
- progreso parcial si aplica

## Consideraciones de arquitectura

### Idempotencia

`XpEvent` debe evitar dobles premios por el mismo entrenamiento.

Propuesta:

- indice unico por `profileId + sourceType + sourceId`

Para el caso inicial:

- un entrenamiento finalizado solo puede conceder XP una vez

### Escalabilidad

Aunque ahora sea offline:

- el historial de XP queda auditable
- los niveles no dependen de constantes ocultas
- los logros son configurables

### Compatibilidad con offline

El modelo propuesto se puede usar sin backend:

- Prisma futuro
- o tablas SQLite equivalentes locales

## Plan recomendado despues de esta fase

### Fase 2

- crear repositorio de gamificacion
- sembrar niveles y logros iniciales
- crear funciones de lectura

### Fase 3

- otorgar XP al finalizar entrenamiento
- registrar `XpEvent`
- actualizar nivel

### Fase 4

- mostrar tarjeta de nivel y progreso
- mostrar logros desbloqueados
- mostrar historial de XP
