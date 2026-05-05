# RESGUARDO TÉCNICO: SISTEMA DRAFTIN - LITERA MEAT
**Fecha:** 5 de Mayo de 2026
**Estado:** Operativo - Fase Satélites Completada

## 🛰️ Módulo de Satélites (Elpress AC 35-B-S)
- **Digitalización de Manual:** Implementada toma de datos técnicos (Presión Agua/Aire, % Químico).
- **Checklist Crítico:** Verificación de 5 puntos técnicos (Válvulas, Filtros, Inyectores, Acoplamientos, Selectores).
- **Control de Estado:** Registro de mangueras y boquillas.
- **Automatización:** Detección de errores -> Redirección automática a creación de Orden de Trabajo.

## 🔐 Modelo de Seguridad y Roles
- **Rol ADMIN:** Acceso total (Dashboard, Configuración, Borrado de Historial, Gestión de Usuarios, Subida de Manuales).
- **Rol OPERARIO:**
  - Aterrizaje directo en **Recogida de Datos**.
  - Menú simplificado (Solo Datos, Tareas y Manuales).
  - Historial oculto (Sin acceso a registros antiguos ni descargas).
  - Bloqueo de borrado y configuración.

## 📲 Portal de Equipo (QR Engine)
- Los códigos QR ahora apuntan a un **Landing Portal** (`ScanLanding.jsx`).
- Permite al operario elegir entre una revisión de rutina o reportar una avería directamente.
- Sincronización automática de IDs de equipos entre el escaneo y los formularios.

## 📊 Visibilidad y Reportes
- **Dashboard:** Nueva tarjeta de estado de flota de satélites con alertas en tiempo real.
- **Historial:** Identificación visual de operario y estado de averías por fecha.
- **PDF:** Generación de actas técnicas completas con tablas de satélites e iconos de estado.

---
*Copia de seguridad generada para respaldo local de arquitectura y lógica de negocio.*
