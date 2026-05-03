# HISTORIAL DE VERSIONES - DRAFTIN

## [v1.3] - 2026-05-03 - SaaS Professionalization & Data Governance
### Añadido
- **SaaS Login Hub:** Nuevo diseño compacto con fondo cinemático y logo personalizado (Caldera Plata + Quemador Rojo).
- **Gestión de Sesión:** Botón de "Salir" (Logout) y flujo de recuperación de contraseña.
- **Historial de Checklist:** Pestaña de Historial de 30 días en recogida de datos con capacidad de borrado selectivo.
- **Ciclo de OT Completo:** Implementación de edición y borrado de Órdenes de Trabajo.
- **Resguardo v1.3:** Copia de seguridad completa en `/BACKUPS/v1.3_SAAS_PRO`.

### Corregido
- Restauración de campos críticos en Checklist (Química, Salmuera, etc.).
- Error de sintaxis en renderizado condicional de `WorkOrders.jsx`.
- Robustez en la carga de roles de usuario (perfiles).

# LOG DE VERSIONES - DRAFTIN SaaS

| Versión | Fecha | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| **v1.3** | 03/05/2026 | **SaaS Professionalization**: Login UI refinado, gestión de OT y gestión avanzada de datos. | ESTABLE |
| **v1.2** | 03/05/2026 | **Total Control Update**: Branding dinámico, Login configurable, Diseñador UI Global (CSS Vars) y limpieza de redundancias. | ARCHIVADA |
| **v1.1** | 02/05/2026 | **Biblioteca Funcional**: Implementación de subida de archivos a Supabase Storage y ordenación de equipos por sistemas. | ARCHIVADA |
| **v1.0** | 27/04/2026 | **MVP Inicial**: Estructura base de dashboard industrial y conexión con Supabase. | ARCHIVADA |

---
*Para restaurar a una versión anterior, utiliza el comando `git checkout <hash>` o copia los archivos desde la carpeta `/BACKUPS/`.*
