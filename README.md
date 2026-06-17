# IronTrack Fitness

App mvil con React Native + Expo pensada para gestionar entrenamientos en un gimnasio personal en casa, con enfoque offline y uso rpido en Android.

## Stack actual

- Expo
- React Native
- React Navigation
- SQLite local con `expo-sqlite`
- TypeScript

## Estructura base

```text
src/
  components/
  database/
  navigation/
  repositories/
  screens/
  seed/
  services/
  theme/
  types/
  utils/
```

## Funcionalidad incluida en esta fase

- Estructura inicial del proyecto Expo
- Tema oscuro base
- Navegacin principal para mvil
- Inicializacin de SQLite al arrancar
- Tabla `user_profiles`
- Tabla `equipment`
- Tabla `exercises`
- Tabla `exercise_equipment`
- Tabla `exercise_media`
- Repositorios bsicos de perfil, material, ejercicios y media
- Onboarding local para crear perfil
- Semilla inicial de material del gimnasio
- Semilla inicial de ejercicios adaptados al gimnasio
- Pantalla para listar, crear, editar, marcar favorito y desactivar material
- Pantallas de ejercicios con filtros, detalle, edicin y vista tcnica
- Recurso visual local principal por ejercicio con vista previa
- Rutinas con detalle, edicin, duplicado y configuracin de ejercicios
- Entrenamiento activo temporal con series en memoria y guardado al finalizar
- Temporizador integrado con ajustes locales y avisos viables con Expo

## Cmo arrancar la app

1. Instala dependencias:

```powershell
npm.cmd install
```

2. Arranca Expo:

```powershell
npm.cmd run start
```

3. Para abrir Android cuando tengas el entorno preparado:

```powershell
npm.cmd run android
```

## Notas

- La app est pensada primero para Android.
- No hay backend, login online, JWT ni sincronizacin en esta fase.
- La base de datos es local y funciona offline.
- Los avisos del temporizador usan vibracin y notificaciones locales cuando el usuario concede permisos.
- El sonido se apoya en la notificacin local por defecto del sistema cuando est activada; en primer plano puede depender del comportamiento del dispositivo y del permiso de notificaciones.
