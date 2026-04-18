# CHANGELOG

## [1.0.0] — 2026-04-18

### Nuevo proyecto: PANEL! T-Shirts sobre EverShop

#### Setup
- Scaffolding completo sobre EverShop v2.1.2
- Docker Compose para PostgreSQL 16 en desarrollo local
- `config/default.json` + `config/custom-environment-variables.json` (env vars via node-config)
- `.env.example` con todas las variables requeridas

#### Tema `panel-theme`
- Design tokens PANEL!: paleta oklch blanco/negro, Montserrat Bold (headings), Inter (body)
- `HeroSection` — hero fullscreen oscuro con imagen CDN + CTA buttons
- `FeaturedProducts` — grid 2 columnas con GraphQL query + fallback CDN
- `DesignerCTA` — sección oscura con link al diseñador
- `NewsletterSection` — formulario de suscripción con estado React
- `PanelNavBrand` — texto "PANEL!" en el header
- `PanelGlobalStyles` — inyección de tokens + Google Fonts
- Rutas `/designer` y `/biblioteca` con iframes fullscreen
- Página de confirmación de pedido con branding PANEL!
- Supresión del ícono de login de clientes (guest-only checkout)

#### Productos
- Seed de 5 productos PANEL! via migración EverShop:
  - Classic Black ($29.99), Classic White ($29.99)
  - Duo Pack ($49.99)
  - Oversized Black ($34.99), Oversized White ($34.99)
- Imágenes desde CDN CloudFront del proyecto original

#### Pagos
- Integración Stripe via `system.stripe` config (env vars)
- Guest checkout habilitado (`checkout.allowGuestCheckout: true`)
- Sin cuentas de cliente (`customer.allowRegistration: false`)

#### Seguridad (6 parches via patch-package)
| Fix | Severidad | Descripción |
|-----|-----------|-------------|
| F4.1 | CRITICAL | Eliminar secret `'keyboard cat'` por defecto |
| F4.2 | CRITICAL | Cookie `secure: true` en producción |
| F4.3 | CRITICAL | Validación de JWT secrets al arrancar |
| F4.5 | HIGH | DOMPurify en `dangerouslySetInnerHTML` |
| F4.6 | HIGH | Uploads validados por magic bytes |
| F4.9 | MEDIUM | bcrypt async (no bloquea event loop) |
| F4.4 | CRITICAL | Rate limiting admin login (20 req/15min) — via bootstrap |
| F4.8 | MEDIUM | Security headers con helmet — via bootstrap |
