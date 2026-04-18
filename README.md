# PANEL! T-Shirts — EverShop

E-commerce completo para PANEL! T-Shirts, construido sobre [EverShop](https://evershop.io) con un tema personalizado, guest checkout (sin cuentas de clientes), y panel admin protegido con JWT.

## Stack

| Capa | Tecnología |
|------|-----------|
| Plataforma | EverShop v2.1.2 |
| Runtime | Node.js 20+ |
| Frontend | React 17 + Tailwind CSS 4 |
| Backend | Express 4 + GraphQL |
| Base de datos | PostgreSQL 16 (Docker) |
| Auth | JWT (admin-only) |
| Pagos | Stripe |
| Email | SendGrid |

## Diferencias vs EverShop original

- **Tema `panel-theme`**: diseño PANEL! (blanco/negro, Montserrat/Inter) sobre el sistema de extensiones de EverShop
- **Guest checkout**: `customer.allowRegistration: false` — los compradores no necesitan cuenta
- **Admin-only auth**: solo el panel `/admin` requiere autenticación JWT
- **Seguridad hardened**: parches de seguridad aplicados via `patch-package` (ver [SECURITY.md](./SECURITY.md))
- **Rutas custom**: `/designer` y `/biblioteca` con herramientas de diseño integradas

## Setup Local

### 1. Clonar y configurar entorno

```bash
git clone git@github.com:cdmorau/paneltshirts-evershop.git
cd paneltshirts-evershop
cp .env.example .env
# Editar .env con tus credenciales reales
```

### 2. Levantar PostgreSQL con Docker

```bash
docker compose up -d
# Verificar que el container está healthy:
docker compose ps
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Setup inicial (primera vez)

> Este comando crea la DB, corre las migraciones y crea el usuario admin.
> Requiere que el container de Docker esté corriendo.

```bash
npm run setup
```

Cuando el wizard pregunte:
- **Database Host**: `localhost`
- **Database Port**: `5432`
- **Database Name**: `paneltshirts`
- **Database User**: `panel`
- **Database Password**: el valor de `DB_PASSWORD` en tu `.env`
- **Admin email/password**: usa los valores de `ADMIN_EMAIL` y `ADMIN_PASSWORD`

### 5. Build y desarrollo

```bash
# Build de producción
npm run build

# Dev con hot reload
npm run dev
```

### 6. Acceder a la aplicación

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Tienda PANEL! |
| `http://localhost:3000/designer` | Diseñador de camisetas |
| `http://localhost:3000/biblioteca` | Galería de diseños |
| `http://localhost:3000/admin` | Panel administrativo |

## Variables de Entorno

Ver `.env.example` para la lista completa. Las críticas para producción:

```env
COOKIE_SECRET=     # mínimo 32 chars aleatorios (openssl rand -base64 32)
JWT_ADMIN_SECRET=  # mínimo 32 chars aleatorios
JWT_ADMIN_REFRESH_SECRET=  # mínimo 32 chars aleatorios
```

## Estructura de Carpetas

```
paneltshirts-evershop/
├── config/
│   └── default.json          # Configuración EverShop (sin secrets)
├── extensions/
│   └── panel-theme/          # Tema + overrides PANEL!
│       ├── bootstrap.js      # Inicialización del tema
│       ├── tailwind/         # Design tokens PANEL!
│       ├── components/       # Componentes React del storefront
│       ├── pages/            # Rutas del storefront
│       └── migration/        # Seed de productos
├── docker-compose.yml        # PostgreSQL local
├── .env.example              # Template de variables de entorno
└── package.json
```

## Gestión de Productos

Los productos se gestionan desde el panel admin:
1. Ir a `http://localhost:3000/admin`
2. Login con las credenciales configuradas en el setup
3. **Catalog → Products → New Product**

Los 5 productos iniciales de PANEL! se insertan automáticamente durante `npm run setup` vía la migración `panel-theme/migration/Version-1.0.0.js`.

## Seguridad

Ver [SECURITY.md](./SECURITY.md) para el detalle completo de mejoras de seguridad aplicadas respecto a EverShop base.

Resumen de fixes críticos aplicados:
- Cookie secret requerido (sin default `'keyboard cat'`)
- Cookie `secure: true` en producción
- JWT secrets validados al arrancar la app
- Rate limiting en admin login (20 req / 15 min)
- Headers de seguridad con `helmet`
- Sanitización HTML con `DOMPurify`
- Validación de uploads por magic bytes
