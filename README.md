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

# 🏍️ Aura Rider - E-Commerce Premium (Frontend)

Bienvenido a la documentación técnica y funcional del repositorio **Frontend de Aura Rider**, una solución integral de comercio electrónico de élite diseñada específicamente para la exhibición, venta y administración de motocicletas de alta gama, repuestos y servicios técnicos.

Esta aplicación web de una sola página (SPA) ha sido construida aplicando estrictamente los principios de **Clean Architecture (Arquitectura Hexagonal)** y las mejores prácticas de la industria en el desarrollo frontend moderno. Prioriza una interfaz de usuario (UI) espectacular y reactiva mediante la tendencia de diseño **Glassmorphism**, combinada con microinteracciones fluidas y un soporte robusto de persistencia de estado para garantizar una experiencia de usuario (UX) inigualable.

---

## 🎯 Objetivos del Proyecto

1. **Gestión Comercial Eficiente:** Proveer a los clientes una plataforma rápida y segura para explorar el catálogo de motocicletas, agregar artículos al carrito, y proceder al *checkout* de forma intuitiva.
2. **Arquitectura Escalable:** Estructurar el código en capas independientes (Dominio, Infraestructura, Presentación) para facilitar futuras integraciones, como pasarelas de pago externas o nuevos módulos de inventario.
3. **Alto Rendimiento Visual:** Implementar animaciones a 60 FPS sin comprometer el rendimiento general, utilizando herramientas como Framer Motion y Tailwind CSS v4 para manejar el repintado (repaint) del navegador de forma óptima.
4. **Seguridad y Autenticación:** Gestionar de forma segura las sesiones de usuario mediante tokens JWT inyectados automáticamente en la red, asegurando las rutas críticas del frontend.

---

## 🌟 Funcionalidades y Módulos Principales

El frontend de Aura Rider está dividido en módulos lógicos que consumen las distintas áreas del API REST de Django:

### 1. Módulo de Autenticación y Perfil
- **Login/Registro Animados:** Vistas a pantalla completa (*cinematic layout*) con validación estricta de formularios usando Zod.
- **Gestión de Sesión (JWT):** El token de acceso se almacena de forma segura en memoria y *LocalStorage* mediante Zustand, inyectándose en cada petición HTTP por Axios.
- **Detección de Roles:** Interfaz adaptable según los permisos del usuario (Cliente vs Administrador).

### 2. Módulo de Catálogo e Inventario
- **Vitrinas "Showroom":** Tarjetas de producto premium con fusión de imágenes (`mix-blend-multiply`) que eliminan fondos planos para adaptar las fotografías de las motocicletas perfectamente a los pedestales de cristal.
- **Filtrado Avanzado:** Búsqueda en tiempo real por modelo, categoría (Naked, Deportiva, Scooter), marca (Honda, Yamaha, Ducati) y ordenamiento por precios.
- **Paginación Reactiva:** Sistema de carga por *Stagger Grid* de Framer Motion, donde cada elemento entra en escena con un retraso coordinado para generar fluidez visual.

### 3. Módulo de Carrito y Checkout
- **Estado Global:** El carrito (CartStore) vive en la memoria de Zustand. Agregar o remover motocicletas actualiza instantáneamente los indicadores numéricos en el *Navbar* sin recargar la página.
- **Cálculo Financiero:** Sumatorias automáticas de subtotales, IVA y total final directamente en el frontend, en sincronía con el backend.

### 4. Motor de Tematización (Theme Engine)
- **Dark / Light Mode Nativo:** Toda la aplicación está programada con variables dinámicas de Tailwind. El cambio entre tema claro y oscuro transforma instantáneamente los pedestales de cristal, los textos, las sombras de resplandor (glows) e incluso ajusta inteligentemente la legibilidad de los logotipos de pasarelas de pago.

---

## 🛠️ Stack Tecnológico Detallado

Para garantizar un rendimiento sobresaliente y una mantenibilidad a largo plazo, el proyecto integra el siguiente ecosistema:

*   **Librería Principal:** React 19 + TypeScript (Tipado estático seguro).
*   **Empaquetador (Bundler):** Vite 8 (Hot-Module Replacement ultrarrápido y compilación optimizada basada en Rollup).
*   **Estilos y Utilidades:**
    *   **Tailwind CSS v4:** Motor de estilos por utilidades (Utility-first CSS).
    *   **Clsx & Tailwind-Merge:** Utilidades para combinar dinámicamente nombres de clases CSS sin colisiones de precedencia.
*   **Componentes de UI y Animación:**
    *   **Radix UI:** Primitivas de interfaz sin estilos para accesibilidad extrema (A11Y).
    *   **Lucide React:** Iconografía vectorial consistente y personalizable.
    *   **Framer Motion:** Biblioteca líder para animaciones declarativas complejas basadas en físicas.
    *   **tw-animate-css:** Extensiones de animaciones clave de Tailwind.
*   **Comunicaciones HTTP:** Axios (Configurado con interceptores globales).
*   **Gestión de Estado:** Zustand v5 (Para estados globales que no requieren renderizados innecesarios del árbol de React).
*   **Enrutamiento:** React Router DOM v7 (Manejo de Single Page Application sin recargas de servidor).
*   **Formularios:** React Hook Form + Zod (Resolución de esquemas de validación de inputs).
*   **Linter:** Oxlint (Validación rápida de código estático).

---

## 📂 Arquitectura de Directorios (Hexagonal Clean Architecture)

La base del código ha sido rigurosamente separada para evitar acoplamientos (Spaghetti Code) y facilitar la comprensión técnica:

```text
motoshopapp-react/
 ├── public/            # Recursos estáticos globales (imágenes, logos de marcas, íconos).
 ├── src/
 │   ├── core/          # Capa de Dominio. Entidades Typescript puras (Interfaces de Moto, User, Cart).
 │   ├── infrastructure/# Capa de Infraestructura. Servicios Axios, interceptores JWT, API Configs.
 │   ├── presentation/  # Capa de Presentación (React puro).
 │   │   ├── components/# Componentes modulares reutilizables (Layout, Navbar, TiltedCard, Buttons).
 │   │   ├── pages/     # Vistas completas ruteables (LoginPage, CatalogPage, Home).
 │   │   └── store/     # Stores de Zustand (AuthStore para sesión, ThemeStore para colores).
 │   ├── index.css      # Directivas principales de Tailwind y variables base para el Glassmorphism.
 │   ├── main.tsx       # Punto de entrada de renderizado del DOM virtual de React.
 │   └── App.tsx        # Definición de rutas principales con React Router.
 ├── package.json       # Manifiesto de dependencias y scripts ejecutables.
 ├── tsconfig.json      # Configuración del transpilador estricto de TypeScript.
 └── vite.config.ts     # Configuración del empaquetador Vite y plugins de React.
```

---

## 📋 Requisitos Previos y Entorno

Para levantar este proyecto en una máquina de desarrollo local, asegúrate de cumplir con estos requisitos:
1. **Node.js**: Versión 18.0.0 o superior instalada de forma global.
2. **Gestor de Paquetes**: `npm` (por defecto), `yarn`, o `pnpm`.
3. **Backend Django (Opcional pero Recomendado)**: Para tener datos reales en el catálogo y poder iniciar sesión, la API construida en Python/Django debe estar ejecutándose de forma paralela, idealmente en el puerto `8000`.

---

## 🚀 Instalación y Ejecución Paso a Paso

1. **Descargar el Repositorio**
   ```bash
   git clone https://github.com/Adavidfr/motoshopapp-react.git
   cd motoshopapp-react
   ```

2. **Instalar Dependencias**
   Descarga toda la paquetería de `node_modules` necesaria:
   ```bash
   npm install
   ```

3. **Variables de Entorno (IMPORTANTE)**
   Para evitar quemar (hardcodear) URLs de conexión, debes crear un archivo oculto `.env` en la raíz de tu proyecto. Ábrelo e ingresa la dirección de tu API:
   ```env
   # Endpoint de conexión al servidor backend
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Levantar el Servidor Vite en modo Desarrollo**
   ```bash
   npm run dev
   ```
   Abre tu navegador web en la dirección indicada en la terminal (usualmente `http://localhost:5173`). Cualquier cambio que realices en el código fuente se reflejará automáticamente gracias a la recarga en caliente (Hot Reload).

---

## 📦 Despliegue a Producción (Build)

Cuando el desarrollo está completo y listo para subirse a un hosting web real (Vercel, Netlify, AWS S3), debes compilar la aplicación para generar los archivos `.html`, `.js` y `.css` optimizados.

1. **Compilar el proyecto:**
   ```bash
   npm run build
   ```
   Esto ejecutará primero el compilador de TypeScript (`tsc -b`) para verificar errores de sintaxis, y luego Vite construirá los binarios minimificados en una nueva carpeta llamada `dist/`.

2. **Previsualizar la construcción en local:**
   ```bash
   npm run preview
   ```
   Levanta un servidor temporal estático para garantizar que el `dist/` se ejecuta sin errores de ruteo antes de mandarlo a la nube.

---

## 🔐 Credenciales del Sistema de Pruebas

Para revisar todas las capacidades de la plataforma conectada al backend semilla, se proveen credenciales de administrador (Superusuario en Django). Este usuario tiene acceso a todas las características bloqueadas para usuarios no registrados.

**Credenciales Oficiales de Administración:**
- **Usuario / Correo:** `admin` *(o también `admin@motoshop.com`)*
- **Contraseña:** `Motoshop1234!`

**Notas adicionales sobre Usuarios:**
- Cualquier revisor del proyecto puede registrar una cuenta propia desde cero navegando a la pestaña superior derecha y seleccionando "Registrarse".
- La clave creada se encriptará en Django, y el frontend recibirá un JWT válido que se almacenará en Zustand de inmediato, dando acceso automático al Carrito de Compras.

---

## 🛠️ Notas para la Evaluación Técnica y Solución de Problemas

Durante la integración continua entre el Frontend (Puerto 5173) y Backend (Puerto 8000), los errores más comunes provienen de bloqueos de seguridad del navegador.

1. **Error de CORS (Cross-Origin Resource Sharing):** 
   Si el catálogo no carga o el inicio de sesión falla mostrando un error de red en la consola del navegador (`Network Error / CORS Missing Allow Origin`), el problema reside en la configuración del Backend. Asegúrate de que el backend en Django tenga instalado el paquete `django-cors-headers` y haya añadido `http://localhost:5173` a la lista blanca de orígenes.
2. **Imágenes Rota:** 
   Verifica que la carpeta `/media/` de Django esté bien configurada, ya que el Frontend recibe URLs relativas y las concatena para mostrar los JPGs o PNGs de las motocicletas en el "Showroom".
