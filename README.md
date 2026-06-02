# Clasificador de Hojas de Vida - Frontend

Frontend web desarrollado con Next.js, React, TypeScript y Material UI para el sistema de preselección de candidatos mediante hojas de vida.

## Tecnologías

- Next.js
- React
- TypeScript
- Material UI
- React Query
- Prettier
- ESLint

## Configuración inicial

### 1. Configurar variables de entorno

Antes de ejecutar el proyecto, se debe crear el archivo `.env.local` tomando como referencia el archivo `example.env.local`.

En Linux, Git Bash o terminal compatible con Bash:

```bash
cp example.env.local .env.local
```

En Windows PowerShell:

```powershell
Copy-Item example.env.local .env.local
```

El valor de la URL base del backend debe configurarse en el archivo `.env.local`, según el entorno correspondiente.

## 2. Instalar dependencias

El proyecto usa Yarn para instalar paquetes:

```powershell
yarn install
```

En caso de problemas de red durante la instalación, ejecutar:

```powershell
yarn install --network-timeout 600000
```

## 3. Ejecutar en modo desarrollo

```powershell
npm run dev
```

Luego abrir el proyecto en el navegador:

```txt
http://localhost:3000
```

## Variables de entorno

El archivo `.env.local` debe contener las variables necesarias para conectar el frontend con el backend.

Consultar el archivo `example.env.local` para conocer las variables requeridas.

## Rutas principales

| Ruta            | Descripción                   |
| --------------- | ----------------------------- |
| `/`             | Pantalla de bienvenida        |
| `/job-profiles` | Gestión de perfiles de puesto |

## Comandos disponibles

### Ejecutar el proyecto

```powershell
npm run dev
```

### Compilar para producción

```powershell
npm run build
```

### Ejecutar versión compilada

```powershell
npm run start
```

### Revisar TypeScript

```powershell
npm run type-check
```

### Ejecutar ESLint

```powershell
npm run lint
```

### Formatear archivos

```powershell
npm run format
```

## Ejecución desde PowerShell

Desde PowerShell, ubicarse en la carpeta del proyecto:

```powershell
cd C:\Tesis\clasificacion_hojas_vida_frontend
```

Instalar dependencias:

```powershell
yarn install
```

Ejecutar el servidor de desarrollo:

```powershell
npm run dev
```

Abrir el frontend:

```txt
http://localhost:3000
```

## Consideraciones

- La instalación de dependencias se realiza con `yarn install`.
- La ejecución del proyecto se realiza con `npm run dev`.
- No se usa autenticación.
- No se usa configuración de idiomas.
- El idioma por defecto de la interfaz es español.
- La conexión al backend se configura desde `.env.local`.
- Las variables sensibles o privadas no deben subirse al repositorio.
