<div align="center">

<img src="https://ute.edu.ec/wp-content/uploads/2021/08/LogoUteTrans.png" alt="UTE - Escuela de Tecnologías" width="250"/>

</div>

<hr>
<br>

<div style="border-left: 4px solid #1e88e5; padding-left: 15px; margin-top: 20px;">

<p><strong>Universidad Tecnológica Equinoccial</strong></p>

<p><strong>Escuela de Tecnologías</strong></p>

<p><strong>Carrera:</strong> Desarrollo de Software</p>

<p><strong>Asignatura:</strong> Programación IV - Seminario de Integración</p>

</div>

<br>

<p><strong>Tema:</strong> Proyecto Web en ReactJS + Consumo de API Django</p>

<p><strong>Fecha:</strong> 20/07/2026</p>

<p><strong>Presentado por:</strong></p>

<ul>
  <li>Alquinga Carlos</li>
  <li>Zambrano Andrés</li>
  <li>Estévez Melanie</li>
  <li>Frías David</li>
</ul>

<p><strong>Docente:</strong> Francisco Javier Higuera González</p>

<br>

---

# 🏍️ Aura Rider - Plataforma E-Commerce Premium (Frontend)

Bienvenido al repositorio oficial del **Frontend de Aura Rider**, una solución de comercio electrónico de élite diseñada específicamente para la exhibición, venta y administración de motocicletas de alta gama, repuestos y servicios de mantenimiento.

Esta aplicación web ha sido construida con los más altos estándares de la industria, priorizando una interfaz de usuario (UI) espectacular mediante **Glassmorphism**, animaciones fluidas, y una experiencia de usuario (UX) de vanguardia. La aplicación consume de manera eficiente un robusto backend construido en **Django REST Framework**.

---

## 🌟 Características Principales

*   **Diseño Premium UI/UX:** Interfaz basada en *Glassmorphism* (cristal esmerilado) que se adapta automáticamente a modos Claro y Oscuro (`Dark Mode/Light Mode`), ofreciendo una experiencia inmersiva.
*   **Animaciones y Microinteracciones:** Uso avanzado de **Framer Motion** y utilidades CSS (`tw-animate-css`) para transiciones de página, *scroll parallax*, efectos *hover* dinámicos y pedestales estilo "Showroom" para el catálogo.
*   **Arquitectura Hexagonal Modular:** El código fuente está rigurosamente estructurado separando la capa de presentación (UI), infraestructura (Axios, configuraciones) y lógica de estado, garantizando escalabilidad y mantenibilidad.
*   **Gestión de Estado Global Centralizada:** Implementación de **Zustand** para controlar carritos de compras, perfiles de usuario, autenticación (JWT) y temas de la aplicación sin recurrir al *prop-drilling*.
*   **Validación de Formularios de Nivel Corporativo:** Integración de **React Hook Form** junto a **Zod** para la resolución y validación de esquemas de datos estrictos (Login, Registro, Checkout) antes de enviar peticiones a la API.

---

## 🛠️ Stack Tecnológico

*   **Core:** React 19 + TypeScript
*   **Build Tool:** Vite 8 (Ultra rápido, Hot-Module Replacement)
*   **Estilos:** Tailwind CSS v4 + integraciones customizadas (clsx, tailwind-merge)
*   **Componentes de UI:** Radix UI (Accesibilidad) y Lucide React (Iconografía)
*   **Animaciones:** Framer Motion
*   **Peticiones HTTP:** Axios interceptors
*   **Gestión de Estado:** Zustand
*   **Enrutamiento:** React Router DOM v7
*   **Validaciones:** Zod + React Hook Form

---

## 📋 Requisitos de Entorno

Antes de comenzar la instalación local, debes asegurarte de contar con:
1. **Node.js**: Versión 18.x o superior.
2. **Gestor de paquetes**: `npm` (incluido con Node), `yarn`, o `pnpm`.
3. **Backend Funcional**: El proyecto hermano `motoshop-api` (Django) debe estar clonado, con las migraciones ejecutadas y el servidor corriendo localmente.

---

## 🚀 Instalación y Despliegue Local

Sigue estos pasos detallados para ejecutar la plataforma en tu entorno de desarrollo:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Adavidfr/motoshopapp-react.git
cd motoshopapp-react
```

### 2. Instalar las dependencias
Instala todos los paquetes requeridos definidos en el `package.json`:
```bash
npm install
```

### 3. Configurar las Variables de Entorno
En la raíz del proyecto (al mismo nivel que `package.json`), debes crear obligatoriamente un archivo llamado `.env` para establecer la conexión con tu API. 

Escribe lo siguiente dentro de tu archivo `.env`:

```env
# Define la ruta exacta donde el Backend expone su API
VITE_API_BASE_URL=http://localhost:8000/api
```
*(Nota: Ajusta el puerto `8000` si tu instancia de Django se está ejecutando en un puerto diferente).*

### 4. Inicializar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación Vite compilará rápidamente y se expondrá, por defecto, en: `http://localhost:5173`. 
Ábrelo en tu navegador favorito. El sistema actualizará los cambios en tiempo real gracias al HMR (Hot Module Replacement).

---

## 📦 Comandos de Scripts Disponibles

El proyecto incluye scripts en `package.json` para facilitar el flujo de desarrollo y producción:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Levanta el servidor local de desarrollo utilizando Vite. |
| `npm run build` | Ejecuta el compilador de TypeScript (`tsc -b`) y construye los binarios estáticos de producción dentro de la carpeta `dist/`. |
| `npm run preview` | Levanta un servidor local apuntando a la carpeta `dist/` para probar cómo se comportará la app ya compilada en producción. |
| `npm run lint` | Ejecuta `oxlint` para realizar análisis de código estático súper rápido, garantizando convenciones y limpieza de sintaxis. |

---

## 🔌 Conexión a la API y Solución de Problemas (CORS)

Esta aplicación hace un uso intensivo de endpoints RESTful. Para que la comunicación sea exitosa:

1. **Tokens JWT:** Cuando un usuario inicia sesión, Axios almacena el Access Token y lo inyecta automáticamente en los encabezados (`Authorization: Bearer <token>`) a través de un interceptor.
2. **Política CORS:** Si experimentas errores de red al hacer Login o cargar el catálogo, verifica que el backend de Django tenga configurado `django-cors-headers` y que `http://localhost:5173` esté dentro de su variable `CORS_ALLOWED_ORIGINS` o que `CORS_ALLOW_ALL_ORIGINS = True` para etapa de desarrollo.
3. **Paginación e Imágenes:** Las URLs de imágenes en el catálogo se concatenan automáticamente en la UI en caso de venir como paths relativos desde la base de datos.

---

## 🔐 Credenciales de Prueba del Sistema

El proyecto cuenta con un sistema robusto de roles y permisos. Para evaluar por completo las capacidades del sistema (Módulos de Cliente vs. Módulos de Administración), se proporcionan las siguientes credenciales correspondientes a la semilla de la base de datos del Backend:

**Credenciales de Administrador (Superusuario)**
Con esta cuenta podrás visualizar reportes, gestionar inventario, ventas y servicios post-venta (si las vistas de administrador están montadas).
- **Usuario (o Correo):** `admin` ó `admin@motoshop.com`
- **Contraseña:** `Motoshop1234!`

**¿Cómo crear usuarios regulares?**
Cualquier miembro del panel evaluador puede dirigirse a la vista `/register` en la plataforma web para crear un perfil de cliente estándar. Ese perfil automáticamente tendrá su propio carrito de compras, historial de facturación y capacidad para agendar mantenimientos.

---

## 📂 Estructura de Directorios

Una vista rápida de la organización limpia (Clean Architecture) del repositorio:
```text
src/
 ├── core/              # Entidades, interfaces (Typescript) de dominio.
 ├── infrastructure/    # Servicios externos (Axios), Auth Services, API Config.
 ├── presentation/      # Capa visual (React).
 │   ├── components/    # Componentes reusables (Layout, Navbar, Footer, UI).
 │   ├── pages/         # Vistas completas de la aplicación (Auth, Catalog, Home).
 │   ├── store/         # Estado global (Zustand: AuthStore, CartStore, ThemeStore).
 ├── index.css          # Configuración principal de Tailwind v4 y variables CSS.
 └── App.tsx            # Punto de entrada de React Router y Layouts.
```
