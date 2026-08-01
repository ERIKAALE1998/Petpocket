# Feature Specification: PetPocket — MVP

**Feature Branch**: `001-petpocket-mvp`

**Created**: 2026-08-01

**Status**: Aprobado por el equipo (sin revisión de mentor) — listo para `/speckit-plan`

> ✅ **Nota de resolución de clarificaciones (equipo, sin mentor disponible):**
> Ante la falta de revisión del mentor de investigación, el equipo tomó las siguientes decisiones para poder avanzar, documentadas aquí para trazabilidad:
> 1. **Catálogo/venta de tienda (P5 / FR-009):** queda **fuera del MVP**. Se mueve a Fase 2. Motivo: solo 2 de las fuentes entrevistadas hablan de venta de productos; el problema central validado por la mayoría de entrevistas es agenda + recordatorios + historial médico veterinario.
> 2. **Filtros de búsqueda (tipo de servicio, calificación):** quedan **fuera del MVP**. Se mantiene únicamente búsqueda por cercanía (respaldada por la fuente de Isaac). Se revisita en Fase 2.
> 3. **Datos del "Plan de Estrategia Comercial"** (Army Paws, PreamVet, Clínica del Sur, "25 horas/mes", "30-45 clientes recuperados", etc.): **se descartan definitivamente** de este spec por no tener trazabilidad a una transcripción real.
> 4. **Sección no revisada de `Sin_titulo (2).md` (líneas 57–347):** no se pudo revisar por falta de disponibilidad del mentor. Se deja como **riesgo conocido**, no como bloqueante: si aparece contenido nuevo más adelante, se evaluará como cambio incremental al spec, no se asume ni se inventa contenido a partir de ella.

> ⚠️ **Nota de trazabilidad:** este documento se construyó a partir de las transcripciones reales visibles en `Sin_titulo (2).md`: entrevistas a Helpet (veterinaria), Isaac, Fredy Toabanda, Pelusa (veterinaria, 2 sucursales), Dr. Carlos Mendoza (tienda de mascotas) y Dr. Alejandro Paredes (tienda de accesorios). El archivo tiene una sección central (líneas 57–347) que no fue revisada todavía — este spec debe actualizarse una vez que se confirme su contenido.
>
> Los datos y nombres del documento "Plan de Estrategia Comercial" (Army Paws, PreamVet, Clínica del Sur, cifras como "25 horas/mes" o "30-45 clientes recuperados") **no se usaron aquí** porque no fue posible verificarlos contra la transcripción original. No deben darse por válidos hasta confirmar su fuente.

---

## Resumen del problema

Tanto veterinarias como dueños de mascotas dependen de procesos manuales (WhatsApp, carnets físicos, cuadernos, Excel básico) para gestionar citas, historial médico e inventario, lo que genera pérdida de turnos, gastos duplicados por falta de historial, y tiempo administrativo perdido respondiendo mensajes repetitivos.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Agenda de citas automatizada para negocios (Priority: P1)

Como veterinaria (Helpet, Pelusa), quiero que las citas se reserven automáticamente sin depender de WhatsApp, para evitar que dos personas pidan el mismo horario y para no perder espacios por inasistencias sin aviso.

> **Fuente:** *"Cuando tenemos muchos pacientes es difícil responder todos los mensajes. A veces dos personas piden el mismo horario"* — Helpet. *"Perdemos ese espacio porque muchas veces no avisan que no van a asistir"* — Helpet.

**Why this priority**: Funcionalidad operativa central validada directamente por veterinarias en entrevistas reales. Evita la saturación de chats y la pérdida de turnos por inasistencia.

**Independent Test**: Registrar un negocio con disponibilidad de horarios, ingresar como dueño de mascota, agendar una cita y verificar que el horario quede bloqueado para otros usuarios sin intervención manual.

**Acceptance Scenarios**:

1. **Given** un negocio con disponibilidad definida de 09:00 a 10:00, **When** un dueño de mascota reserva el turno de las 09:00, **Then** el sistema confirma la cita y bloquea ese espacio para cualquier otro usuario.
2. **Given** una cita agendada, **When** el dueño invalida o cancela su asistencia, **Then** el sistema notifica al negocio y libera automáticamente la disponibilidad en la agenda.

---

### User Story 2 - Recordatorios automáticos de vacunas y controles (Priority: P2)

Como dueño de mascota (Isaac, Fredy) o veterinaria (Helpet, Pelusa), quiero recibir/enviar recordatorios automáticos de vacunas y desparasitaciones, para no depender de la memoria o de que el cliente revise su carnet físico.

> **Fuente:** *"Se me pasan las fechas"* — Isaac. *"Me gustaría que el sistema enviara recordatorios de vacunas y consultas"* — Helpet. *"Como un recordatorio para su control de vacunas"* — Fredy.

**Why this priority**: Evita olvidos en controles médicos preventivos y elimina la tarea manual de enviar mensajes por WhatsApp uno a uno.

**Independent Test**: Registrar un evento de salud con vencimiento próximo y verificar que la tarea automática dispare la notificación al dueño y muestre la alerta en el panel de la veterinaria.

**Acceptance Scenarios**:

1. **Given** una vacuna registrada que vence próximamente, **When** se alcanza la fecha programada de aviso, **Then** el sistema envía una notificación automática al dueño con los detalles del control pendiente.
2. **Given** clientes con controles próximos, **When** la veterinaria revisa su panel de alertas, **Then** puede disparar recordatorios automáticos sin escribir chats individuales manualmente.

---

### User Story 3 - Historial médico digital centralizado y portable (Priority: P3)

Como dueño de mascota, quiero que el historial de mi mascota no se pierda ni dependa de un carnet físico, para no repetir vacunas ni gastar dinero de más al cambiar de veterinaria.

> **Fuente:** *"Cuando me cambié de casa perdí el carnet de vacunas... tuve que repetir algunas vacunas. Eso significó gastar mucho dinero y perder bastante tiempo"* — Isaac.

**Why this priority**: Garantiza que la información médica pertenezca al dueño de la mascota y sea portable en cualquier momento y ubicación.

**Independent Test**: Registrar atenciones en una veterinaria A, acceder como dueño de la mascota y verificar que la información médica sea legible y consultable directamente por el dueño o en una veterinaria B.

**Acceptance Scenarios**:

1. **Given** una atención veterinaria finalizada, **When** el profesional ingresa la vacuna o tratamiento, **Then** el evento se registra en el historial digital permanente de la mascota.
2. **Given** un dueño que cambió de residencia o veterinaria, **When** accede a su perfil, **Then** puede visualizar y presentar todo el historial médico digital sin depender de carnet físico.

---

### User Story 4 - Búsqueda de veterinarias cercanas (Priority: P4)

Como dueño de mascota, quiero encontrar una veterinaria cercana sin depender solo de recomendaciones informales, para resolver una necesidad rápido incluso si estoy en otro sector de la ciudad.

> **Fuente:** *"Pregunté al grupo de WhatsApp de mi familia... busqué en Google, pero varios no tenían información actualizada. Llamé a dos lugares y no contestaron"* — Isaac. *"Sería útil una veterinaria rápida si estoy en otros sectores de la ciudad"* — Isaac.

**Why this priority**: Proporciona localización rápida de servicios veterinarios cuando el usuario está fuera de su zona habitual.

**Independent Test**: Ingresar una ubicación en el buscador y verificar que el sistema presente los negocios veterinarios ordenados por cercanía geográfica.

**Acceptance Scenarios**:

1. **Given** un dueño de mascota requiriendo atención en una ubicación dada, **When** busca veterinarias por cercanía, **Then** el sistema muestra los resultados relevantes ordenados por proximidad con información básica y estado.

---

### User Story 5 - Catálogo y pedidos para tiendas de mascotas (Fuera de MVP — Fase 2)

Como tienda de mascotas (Dr. Carlos Mendoza, Dr. Alejandro Paredes), quiero publicar mi catálogo para que los dueños compren o pidan a domicilio directamente desde la app.

> **Fuente:** *"Escriben al WhatsApp, preguntan si hay comida, les mandamos fotos... esperamos la transferencia. Todo ese cruce de mensajes nos hace perder fácil unos 15 minutos por cliente"* — Dr. Carlos Mendoza.

> **Resuelto (equipo):** Fuera del MVP, pasa a Fase 2. Ambos dueños de tienda piden condiciones específicas para adoptar la app (comisiones bajas, variantes de tallas/colores) lo que requiere un módulo e-commerce complejo no esencial para el MVP de servicios veterinarios.

---

### Edge Cases

- **Reserva simultánea atómica**: Ante múltiples intentos de reserva en la misma fracción de segundo, el motor de reservas de Wasp/Prisma debe manejar bloqueos transaccionales para asignar la cita únicamente al primer usuario y notificar al segundo que el turno fue tomado.
- **Fallos en canales de notificación**: Si el envío automático de un recordatorio falla, la tarea programada debe reintentar con estrategia de retroceso (backoff) y registrar el error en logs estructurados.
- **Control de acceso por rol (RBAC)**: Si un usuario no autorizado intenta acceder al historial médico de una mascota de la cual no es propietario ni veterinaria tratante, la aplicación debe responder con denegación 403 Forbidden.

---

## Functional Requirements (Requisitos funcionales)

**Agendamiento**
- **FR-001:** El sistema debe permitir a los negocios definir su disponibilidad y evitar que dos citas se asignen al mismo horario.
- **FR-002:** El sistema debe permitir a los dueños reservar una cita directamente, sin depender de respuesta manual por WhatsApp.
- **FR-003:** El sistema debe notificar al negocio cuando un cliente no confirme o cancele su asistencia, para poder liberar el espacio a tiempo.

**Recordatorios**
- **FR-004:** El sistema debe generar recordatorios automáticos de vacunas y desparasitaciones próximas.
- **FR-005:** El sistema debe permitir a los negocios enviar recordatorios de controles sin tener que escribir manualmente a cada cliente por WhatsApp.

**Historial médico**
- **FR-006:** El sistema debe permitir registrar y consultar el historial médico de una mascota (vacunas, tratamientos) de forma digital, evitando depender de carnets físicos o papeles.
- **FR-007:** El sistema debe permitir que el historial de una mascota sea accesible aunque el dueño cambie de veterinaria.

**Búsqueda**
- **FR-008:** El sistema debe permitir buscar veterinarias cercanas según ubicación. (Filtros por calificación o tipo de servicio excluidos en MVP).

**Catálogo de tienda (Fase 2 — fuera del MVP, ver P5)**
- **FR-009:** *(Fase 2)* El sistema debe permitir a tiendas de mascotas publicar su catálogo de productos para pedidos a domicilio. No se implementa en el MVP.

---

## Success Criteria (Criterios de éxito)

- **SC-001:** Reducción medible de citas perdidas por inasistencia no avisada, comparado con el manejo actual por WhatsApp.
- **SC-002:** Los negocios dejan de necesitar responder manualmente cada solicitud de cita o recordatorio de vacuna.
- **SC-003:** Un dueño de mascota puede consultar el historial completo de su mascota sin depender de un carnet físico, incluso si cambió de veterinaria.

> **Nota de resolución:** Los criterios se mantienen cualitativos hasta contar con datos de telemetría post-lanzamiento del MVP para fijar valores numéricos definitivos.

---

## Key Entities (Entidades clave)

- **User / Usuario** — dueño de mascota (`PET_OWNER`), negocio (`VET_BUSINESS`) o administrador (`ADMIN`).
- **Pet / Mascota** — animal registrado por un dueño.
- **MedicalRecord / Historial Médico** — registro de vacunas y tratamientos de una mascota.
- **Business / Negocio** — veterinaria registrada.
- **Appointment / Cita** — turno solicitado entre un dueño y un negocio.
- **Reminder / Recordatorio** — notificación automática de vacuna o control próximo.

---

## Fuera de alcance (decisión del equipo)

- **Venta de productos y catálogo de tienda (FR-009):** fuera del MVP, planificado para Fase 2.
- **Filtros de búsqueda avanzados** (tipo de servicio, calificación): fuera del MVP, planificado para Fase 2.
- Cualquier funcionalidad mencionada solo en el "Plan de Estrategia Comercial" pero no verificada en la transcripción original (reseñas verificadas, validación de receta médica, suscripción premium, etc.) — **descartada definitivamente**.

---

## Checklist de validación del spec

- [x] Resolver los `[NEEDS CLARIFICATION]` marcados arriba — resuelto por el equipo.
- [x] Confirmar trazabilidad de datos — cifras no verificables del Plan de Estrategia Comercial **descartadas**.
- [x] **Riesgo conocido, no bloqueante:** revisar contenido de `Sin_titulo (2).md` (líneas 57–347) cuando esté disponible.
- [x] **Riesgo conocido, no bloqueante:** evaluar adición de entrevistas futuras a más veterinarios.
- [x] Aprobado por el equipo — listo para `/speckit-plan`.
