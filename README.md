# IronTrack Fitness

IronTrack Fitness es una app movil para gestionar entrenamientos en un gimnasio personal en casa.
Esta pensada para uso rapido en Android durante entrenamientos reales, con funcionamiento
principalmente offline y sin depender de backend en la primera version.

## Tecnologias usadas

- React Native
- Expo
- TypeScript
- React Navigation
- SQLite local con `expo-sqlite`
- Expo File System
- Expo Image Picker
- Expo Image Manipulator
- Expo Notifications
- Expo Keep Awake
- Expo Sharing
- Expo Linear Gradient

## Instalacion de dependencias

```powershell
npm.cmd install
```

## Ejecucion en Android

1. Arrancar Expo:

```powershell
npm.cmd run start
```

2. Ejecutar en Android cuando el entorno este preparado:

```powershell
npm.cmd run android
```

## Funcionalidades implementadas

- Onboarding local para crear perfil.
- Base de datos SQLite inicializada al arrancar.
- Gestion de perfil local.
- Gestion de material del gimnasio:
  - listado
  - filtros
  - favoritos
  - alta y edicion
  - desactivacion
- Semilla inicial de material.
- Gestion de ejercicios:
  - listado
  - busqueda
  - filtros por grupo, tipo y material
  - detalle
  - alta y edicion
  - favoritos
  - desactivacion
- Relacion ejercicios-material.
- Semilla inicial de ejercicios.
- Recurso visual principal por ejercicio:
  - seleccion local
  - validacion basica
  - almacenamiento local
  - vista previa
  - eliminacion
- Vista tecnica de ejercicio.
- Rutinas:
  - tablas y repositorios
  - semilla inicial
  - listado
  - detalle
  - alta y edicion
  - duplicado
  - reordenacion simple
- Entrenamiento activo desde rutina.
- Entrenamiento libre.
- Registro de series en memoria y guardado al finalizar.
- Temporizador integrado con ajustes locales.
- Configuracion de temporizador.
- Historial de entrenamientos.
- Detalle de entrenamiento.
- Progreso general.
- Progreso por ejercicio.
- Recomendaciones basicas de progresion.
- Cardio basico con guardado local.
- Boxeo por rondas con guardado local.
- Musica externa mediante URLs y apertura con `Linking.openURL`.
- Configuracion principal organizada por secciones.
- Configuracion de apariencia:
  - tema
  - color principal
  - estilo de tarjetas
  - tamano de texto
  - estilo de temporizador
  - fondo personalizado
  - bloques visibles en Inicio
- Inicio personalizable.
- Frases motivacionales:
  - activacion
  - frases predeterminadas
  - frases personalizadas
  - alta, edicion y borrado
- Exportacion de entrenamientos a CSV.
- Restauracion y borrado seguro de datos:
  - restaurar ejercicios iniciales
  - restaurar material inicial
  - borrar historial
  - reiniciar todos los datos con confirmacion

## Funcionalidades pendientes

- Copia de seguridad JSON completa:
  - exportacion
  - importacion
  - validacion de estructura
  - confirmacion de sobrescritura
- Aplicacion global real de todas las preferencias de apariencia a toda la UI.
- Personalizacion visual avanzada.
- Exportacion e importacion completa de todos los datos de la app.
- Sincronizacion en la nube.
- Backend.
- Login online.
- Pagos.
- IA.

## Estructura de carpetas

```text
src/
  components/      Componentes reutilizables de UI
  database/        Cliente SQLite y migraciones
  navigation/      Navegacion principal
  repositories/    Acceso a datos SQLite
  screens/         Pantallas de la app
  seed/            Semillas iniciales
  services/        Logica de aplicacion y utilidades de flujo
  theme/           Colores, espaciado y tema base
  types/           Tipos y modelos
  utils/           Constantes y helpers
```

## Notas tecnicas importantes

- La app esta pensada primero para Android.
- No hay backend ni sincronizacion en esta fase.
- El almacenamiento principal es SQLite local.
- La app funciona offline.
- Algunas configuraciones visuales ya se guardan, pero no todas se aplican todavia a toda la app.
- El recurso visual de ejercicios y el fondo personalizado se guardan en almacenamiento local de la app.
- Las notificaciones del temporizador dependen de permisos del dispositivo.
- La musica no se reproduce dentro de la app:
  solo se abren URLs externas.
- El reinicio total de datos elimina tambien ajustes, historial y archivos locales asociados.
- Se ha priorizado no rehacer arquitectura ya funcional y crecer por fases.
