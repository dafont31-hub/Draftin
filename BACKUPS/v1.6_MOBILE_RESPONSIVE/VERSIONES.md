# HISTORIAL DE VERSIONES - DRAFTIN

## [v1.6] - 2026-05-04 - Mobile Responsive & Real-Time Telemetry
### Añadido
- **Optimización Mobile-First:** Rediseño total de cabecera y paddings para uso en smartphones sin desbordamiento.
- **Reloj Industrial:** Integración de hora y fecha en tiempo real en la cabecera (Alta Precisión).
- **Sincronización PDF:** Auditoría de documentos reales para ajustar las próximas inspecciones (G1, G2, Nivel B/C).
- **i18n Global:** Traducción dinámica de menús y estados entre ES/EN sincronizada con la base de datos.
- **Resguardo v1.6:** Copia de seguridad completa en `/BACKUPS/v1.6_MOBILE_RESPONSIVE`.

## [v1.5] - 2026-05-03 - Industrial Planning & Automation
### Añadido
- **Módulo de Planificación:** Nueva pestaña en Órdenes de Trabajo para gestionar inspecciones recurrentes.
- **Automatización de Ciclos:** Función "Completar Ciclo" que recalcula automáticamente la próxima fecha de inspección basada en la frecuencia (meses).
- **Filtros Dinámicos:** El dashboard ahora actúa como un recordatorio visual, filtrando tareas completadas y resaltando inspecciones técnicas.
- **Resguardo v1.5:** Copia de seguridad completa en `/BACKUPS/v1.5_PLANNING_AUTO`.

## [v1.4] - 2026-05-03 - Grid High Density & Industrial Icons
### Añadido
- **UI de Alta Densidad:** Optimización del grid para visualización masiva de activos.
- **Iconografía Industrial:** Nuevos iconos para Rack, Colector e Intercambiador.
- **Resguardo v1.4:** Copia de seguridad completa en `/BACKUPS/v1.4_GRID_HIGH_DENSITY`.

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
| **v1.6** | 04/05/2026 | **Mobile & Telemetry**: Optimización responsive, reloj real y sincronización de inspecciones PDF. | ESTABLE |
| **v1.5** | 03/05/2026 | **Planning & Automation**: Gestión de inspecciones recurrentes y automatización de fechas. | ARCHIVADA |
| **v1.4** | 03/05/2026 | **Grid High Density**: Optimización visual y nuevos iconos industriales. | ARCHIVADA |
| **v1.3** | 03/05/2026 | **SaaS Professionalization**: Login UI refinado, gestión de OT y gestión avanzada de datos. | ARCHIVADA |
| **v1.2** | 03/05/2026 | **Total Control Update**: Branding dinámico, Login configurable, Diseñador UI Global (CSS Vars) y limpieza de redundancias. | ARCHIVADA |
| **v1.1** | 02/05/2026 | **Biblioteca Funcional**: Implementación de subida de archivos a Supabase Storage y ordenación de equipos por sistemas. | ARCHIVADA |
| **v1.0** | 27/04/2026 | **MVP Inicial**: Estructura base de dashboard industrial y conexión con Supabase. | ARCHIVADA |

---
*Para restaurar a una versión anterior, utiliza el comando `git checkout <hash>` o copia los archivos desde la carpeta `/BACKUPS/`.*
