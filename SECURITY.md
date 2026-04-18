# Security Improvements

Este documento detalla las mejoras de seguridad aplicadas sobre EverShop base.
Análisis original en: `../evershop-security-report.md`

## Mejoras Aplicadas

### CRÍTICOS (Fase 2)

| ID | Fix | Archivo |
|----|-----|---------|
| F4.1 | Cookie secret sin valor por defecto (`keyboard cat` eliminado) | `patches/@evershop+evershop+*.patch` |
| F4.2 | Cookie `secure: true` en producción | `patches/@evershop+evershop+*.patch` |
| F4.3 | Validación de JWT secrets al arrancar | `patches/@evershop+evershop+*.patch` |
| F4.4 | Rate limiting en admin login (20 req/15min) | `extensions/panel-theme/bootstrap.js` |
| F4.8 | Headers de seguridad con `helmet` | `extensions/panel-theme/bootstrap.js` |
| F4.10 | Cookie SameSite=strict | `config/default.json` |

### ALTOS (Fase 7)

| ID | Fix | Archivo |
|----|-----|---------|
| F4.5 | Sanitización HTML con DOMPurify en Editor | `patches/@evershop+evershop+*.patch` |
| F4.6 | Validación de uploads por magic bytes (no solo MIME) | `patches/@evershop+evershop+*.patch` |
| F4.9 | bcrypt async (no bloquea event loop) | `patches/@evershop+evershop+*.patch` |

### MEDIOS (Fase 7)

| ID | Fix | Aplicación |
|----|-----|-----------|
| F4.7 | Verificación de ownership en endpoints de recursos | Aplicado via patch |

## Variables de Entorno Requeridas

Estas variables **DEBEN** estar configuradas antes de arrancar en producción:

```
COOKIE_SECRET          — mínimo 32 chars, generado con: openssl rand -base64 32
JWT_ADMIN_SECRET       — mínimo 32 chars
JWT_ADMIN_REFRESH_SECRET — mínimo 32 chars
```

Si alguna está ausente, la app lanzará un error al arrancar.

## Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [EverShop Security Report](../evershop-security-report.md)
