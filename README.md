# AinboFlora

Tienda y vivero online orientado a Perú, con catálogo de productos, servicios de jardinería y cotización por WhatsApp.

## Tecnologías

- Frontend: HTML5, Bootstrap 5, Bootstrap Icons, Tailwind (preflight deshabilitado), JS.
- Backend: Node.js, Express, MySQL.
- Autenticación: JWT.
- Otros: LocalStorage para carrito persistente.

## Instalación

1. Clonar el proyecto.
2. Variables de entorno del backend: configurar conexión a MySQL y JWT_SECRET.
3. Instalar dependencias en backend:
   ```
   cd backend-ainbo-main
   npm install
   ```
4. Ejecutar servidor:
   ```
   node server.js
   ```
5. Abrir frontend desde el sistema de archivos o servir con cualquier servidor estático.

## Configuración de API en Frontend

El frontend detecta `window.AINBO_API` o usa `http://<host>:3000/api`. Para entorno remoto, definir:
```html
<script>window.AINBO_API='https://tu-dominio/api';</script>
```

## Funcionalidades Clave

- Búsqueda global con sugerencias desde la API.
- Catálogo con filtros por categoría, texto y rango de precios.
- Carrito persistente en LocalStorage.
- Cotización y compra por WhatsApp (+51 978 011 943).
- Secciones de Ubícanos, Preguntas Frecuentes, Testimonios.

## Endpoints Backend (ejemplo)

- GET /api/productos
- GET /api/productos/:id
- POST /api/pedidos
- GET /api/pedidos/:id
- PATCH /api/pedidos/:id (estado)

## Módulo de WhatsApp

Botones de “Comprar por WhatsApp” y “Cotizar” arman el mensaje con nombre y precio. Ajustar el número en el frontend si es necesario.

## Seguridad

- Validación de formularios en frontend y backend.
- Rutas de administración protegidas con JWT y middleware de autorización.

## SEO Local

- Metadatos optimizados: título, descripción y keywords con foco en Perú.
- Recomendado: sitemap.xml y robots.txt al desplegar.

## Deploy

- Frontend: Vercel o Netlify.
- Backend: Railway o Render con MySQL gestionado.
- Configurar CORS y `AINBO_API` en el frontend.

## Roadmap

- Filtros avanzados por uso (interior/exterior), stock bajo y dashboard de ventas.
- CMS simple para banners y ofertas.
