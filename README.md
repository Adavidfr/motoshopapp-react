# Aura Rider - Motoshop App (Frontend)

Este es el repositorio Frontend para la aplicación web **Aura Rider**, una plataforma de comercio electrónico de lujo diseñada para la venta y gestión de motocicletas de alta gama.

El proyecto está desarrollado con **ReactJS** y construido con **Vite**, utilizando arquitectura hexagonal, Zustand para el manejo global del estado, y Tailwind CSS junto a Framer Motion para lograr una interfaz cinemática "Glassmorphism" con animaciones y microinteracciones de nivel premium.

## 📋 Requisitos Previos

Asegúrate de tener instalados los siguientes requerimientos en tu entorno local antes de iniciar:

- **Node.js**: v18.0.0 o superior (se recomienda la versión LTS).
- **npm** (v9+), **yarn** o **pnpm**.
- Un backend funcional (motoshop-api) en ejecución para consumir los datos.

## 🛠️ Instalación

1. **Clona el repositorio** en tu máquina local:
   ```bash
   git clone https://github.com/Adavidfr/motoshopapp-react.git
   cd motoshopapp-react
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```
   *(Si utilizas otro gestor de paquetes, ejecuta `yarn install` o `pnpm install`)*.

## ⚙️ Variables de Entorno

El proyecto requiere variables de entorno para conectarse exitosamente con el backend. 
Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`) y agrega las siguientes variables:

```env
# URL base de la API del Backend (Django/Python)
VITE_API_BASE_URL=http://localhost:8000/api
```

*Nota: Si tu backend corre en otro puerto u host distinto, actualiza el valor de `VITE_API_BASE_URL` correspondientemente.*

## 🚀 Comandos Disponibles

En el directorio del proyecto, puedes ejecutar los siguientes comandos:

- **Levantar el servidor de desarrollo local (Hot-Reload):**
  ```bash
  npm run dev
  ```
  Esto iniciará la aplicación, típicamente en `http://localhost:5173/`.

- **Compilar para producción:**
  ```bash
  npm run build
  ```
  Genera la carpeta `dist/` con los archivos optimizados y minificados listos para despliegue.

- **Previsualizar la compilación de producción:**
  ```bash
  npm run preview
  ```
  Permite probar localmente cómo se ejecutará la aplicación ya compilada.

- **Ejecutar el linter:**
  ```bash
  npm run lint
  ```
  Ejecuta `oxlint` para validar el estilo y sintaxis del código.

## 🔌 Cómo conectarse a la API (Backend)

La plataforma utiliza **Axios** (configurado en `src/infrastructure/config/api.config.ts`) para realizar las solicitudes HTTP. 
Para que el Frontend funcione correctamente:

1. Asegúrate de iniciar tu servidor Backend de Django. Por lo general, se corre con: `python manage.py runserver` en el puerto `8000`.
2. Verifica que el backend tenga los permisos CORS habilitados para aceptar peticiones desde `http://localhost:5173` (la URL del Frontend de Vite).
3. Asegúrate de tener el archivo `.env` configurado como se indica en la sección de Variables de Entorno.

## 🔐 Credenciales de Prueba

Para probar el flujo completo (Carrito de compras, perfiles, y panel de administración) debes registrar o utilizar un usuario existente en la API.

Dado que la aplicación maneja autenticación JWT contra el backend, tienes dos opciones:

1. **Crear una cuenta nueva** desde el frontend navegando a `/register`.
2. **Si el backend tiene datos semilla (seed)** precargados, puedes probar iniciando sesión en `/login` con las credenciales por defecto de administrador de la API (ejemplo genérico, verificar con el equipo de backend):
   - **Usuario / Correo:** admin@aurarider.com
   - **Contraseña:** admin123 (o la configurada en tu superuser de Django)

*(Nota: Solo los usuarios que tengan el flag `is_staff=True` o `is_superuser=True` en el backend podrán acceder a la ruta `/admin` del Frontend).*
