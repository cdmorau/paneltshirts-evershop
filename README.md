# PANEL! T-Shirts — EverShop

E-commerce completo para PANEL! T-Shirts, construido sobre [EverShop v2.1.2](https://evershop.io).
Tema personalizado blanco/negro minimalista, guest checkout, panel admin con JWT, y seguridad hardened.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Plataforma | EverShop v2.1.2 |
| Runtime | Node.js 20+ |
| Frontend | React 17 + Tailwind CSS 4 |
| Backend | Express 4 + GraphQL |
| Base de datos | PostgreSQL 16 (Docker) |
| Auth | JWT admin-only + express-session |
| Pagos | Stripe |
| Seguridad | helmet, express-rate-limit, DOMPurify, file-type |

---

## Diferencias vs EverShop original

| Aspecto | EverShop base | PANEL! |
|---------|--------------|--------|
| Tema visual | Default EverShop | Montserrat/Inter, paleta oklch B&W |
| Cuentas de cliente | Registro habilitado | Deshabilitado — guest checkout |
| Cookie secret | `'keyboard cat'` por defecto | Requerido explícitamente (env var) |
| Cookie secure | `false` en producción | `true` |
| JWT validation | En tiempo de uso | Al arrancar la app |
| Admin login | Sin límite | Rate limited (20 req/15 min) |
| Headers HTTP | Sin security headers | helmet (HSTS, X-Frame-Options, etc.) |
| Editor HTML | Sin sanitización | DOMPurify en todo dangerouslySetInnerHTML |
| File uploads | Validación MIME (bypasseable) | Magic bytes via file-type |
| bcrypt | Síncrono (bloquea event loop) | Async |

Ver [SECURITY.md](./SECURITY.md) y [CHANGELOG.md](./CHANGELOG.md) para el detalle completo.

---

## Setup Local

### 1. Clonar y configurar entorno

```bash
git clone git@github.com:cdmorau/paneltshirts-evershop.git
cd paneltshirts-evershop
cp .env.example .env
```

Editar `.env` con valores reales — los campos obligatorios antes de arrancar:

```env
COOKIE_SECRET=<openssl rand -base64 32>
JWT_ADMIN_SECRET=<openssl rand -base64 32>
JWT_ADMIN_REFRESH_SECRET=<openssl rand -base64 32>
DB_PASSWORD=<tu password>
```

### 2. Levantar PostgreSQL

```bash
docker compose up -d
docker compose ps   # esperar status: healthy
```

### 3. Instalar dependencias

```bash
npm install
# Los parches de seguridad se aplican automáticamente (postinstall → patch-package)
```

### 4. Setup inicial (primera vez)

```bash
npm run setup
```

El wizard preguntará por:
- **Database**: `localhost:5432`, nombre `paneltshirts`, user `panel`, password del `.env`
- **Admin**: email y contraseña del administrador

### 5. Build y desarrollo

```bash
npm run build    # compila src/ → dist/ (incluye panel-theme)
npm run dev      # dev server con hot reload
```

### 6. URLs

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Tienda PANEL! |
| `http://localhost:3000/catalog` | Catálogo de productos |
| `http://localhost:3000/designer` | Diseñador de camisetas |
| `http://localhost:3000/biblioteca` | Galería de diseños |
| `http://localhost:3000/admin` | Panel administrativo |

---

## Configurar Stripe

Las claves se inyectan via env vars → `config/custom-environment-variables.json`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Después del setup, activar Stripe en el admin:
`/admin/setting → Payment → Stripe → Activar`

Para webhooks en desarrollo:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Estructura del proyecto

```
paneltshirts-evershop/
├── config/
│   ├── default.json                    # Config EverShop (sin secrets)
│   └── custom-environment-variables.json  # Mapeo env vars → node-config
├── extensions/
│   └── panel-theme/
│       ├── dist/
│       │   ├── bootstrap.js            # Helmet + rate limiting (pre-compilado)
│       │   └── pages/frontStore/*/route.json
│       ├── src/
│       │   └── pages/frontStore/
│       │       ├── all/                # Componentes globales (header, styles)
│       │       ├── homepage/           # Secciones de la homepage
│       │       ├── checkoutSuccess/    # Confirmación de pedido
│       │       ├── designer/           # Iframe diseñador
│       │       └── biblioteca/         # Iframe galería
│       ├── migration/
│       │   └── Version-1.0.0.js        # Seed 5 productos PANEL!
│       └── tailwind/
│           └── panel-tokens.css        # Design tokens
├── patches/
│   └── @evershop+evershop+2.1.2.patch  # 6 parches de seguridad
├── docker-compose.yml
├── .env.example
├── SECURITY.md
└── CHANGELOG.md
```

---

## Gestión de productos

Los productos se gestionan desde el panel admin:
1. `http://localhost:3000/admin` → login
2. **Catalog → Products → New Product**

Los 5 productos iniciales se insertan automáticamente durante `npm run setup`:

| Producto | Precio |
|---------|--------|
| PANEL! Classic Black | $29.99 |
| PANEL! Classic White | $29.99 |
| PANEL! Duo Pack | $49.99 |
| PANEL! Oversized Black | $34.99 |
| PANEL! Oversized White | $34.99 |

---

## Seguridad

Ver [SECURITY.md](./SECURITY.md) para el detalle de cada fix.

Los parches se auto-aplican con `npm install` via `patch-package` (script `postinstall`).

**Variables de entorno requeridas en producción:**
```bash
# Generar con: openssl rand -base64 32
COOKIE_SECRET=...
JWT_ADMIN_SECRET=...
JWT_ADMIN_REFRESH_SECRET=...
```

La app lanza un error explícito al arrancar si alguna de estas está ausente.
