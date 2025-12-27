# MR SmartService - Proyecto completo (API + Front Next)

Este ZIP incluye:

- `api/` (Node/Express + Postgres)
- `next_mrsmartservice/` (Next.js) **sirviendo el front HTML existente** desde `/public` + rutas limpias.

## 1) Backend (API)

```bash
cd api
npm install
# copia .env.example a .env y completa valores
npm start
```

Por defecto corre en `http://localhost:8080`.

## 2) Frontend (Next)

```bash
cd next_mrsmartservice
npm install
npm run dev
```

Abre `http://localhost:3000`.

### Rutas
- `/` redirige a `/index.html`
- `/contacto` redirige a `/contacto.html`
- `/carrito` redirige a `/carrito.html`
- etc.

Así ya no verás 404 cuando navegues con rutas limpias.

## Notas
- Los archivos `.env` fueron **sanitizados**. Usa `.env.example`.
