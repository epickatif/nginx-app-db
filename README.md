# Nginx Static Site + CRUD API (Railway)

Este repositorio combina la plantilla original **railwayapp-templates/nginx** con un
servicio API Node/Express y PostgreSQL para cumplir la actividad 3.3.

```
proyecto/
├─ Dockerfile       → Imagen Nginx para `site/`
├─ nginx.conf       → Config por defecto
├─ site/            → Frontend (HTML, CSS, JS)
└─ api/             → Backend CRUD (Express + pg)
```

## Despliegue rápido

1. Crea un servicio Postgres en tu proyecto Railway.
2. Añade una nueva service apuntando al subdirectorio `api/`.
3. Expón la API en el puerto 8080 y copia su dominio.
4. Edita `site/js/crud.js` —constante `API`— con tu URL.
5. Haz push, Railway redeployará Nginx y la API.
