# 3.3 Aplicación web con base de datos

Este proyecto convierte un sitio estático (servido por Nginx) en una **aplicación web con base de datos** desplegada en Railway:

- **/site** contiene el front end HTML + CSS + JS.
- **/api** es un pequeño servicio Node.js/Express que expone un CRUD REST.
- **PostgreSQL** (provisionado por Railway) almacena los datos.

Con esta estructura cumplimos los requisitos de la 3.3. Aplicación web con base de datos.

## Resumen del despliegue en Railway

1. **Fork** de este repositorio en GitHub.
2. En Railway:
    - crea el servicio **PostgreSQL** → copia la `DATABASE_URL`.
    - crea el servicio **api** → raíz `api/`, variable `DATABASE_URL`.
    - crea el servicio **nginx-static** → raíz proyecto, puerto 80.
3. Genera los dominios para `api` (puerto 8080) y `nginx-static` (puerto 80).
4. Ejecuta `api/schema.sql` en la consola SQL para crear la tabla `items`.
5. Abre `/site/admin.html`; la interfaz se conecta al dominio de la API y permite CRUD completo.

Eso es todo: sitio público, api y base de datos funcionando en Railway con el template original de Nginx respetado.
