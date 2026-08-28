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

> 🔁 **CORRECCIÓN DE ALCANCE (equipo + ingeniera, 1 de agosto de 2026):** La versión anterior de este documento describía User Story 1 con un modelo de **auto-reserva de horarios por el dueño** (el dueño elige un slot disponible y reserva). Esto **no corresponde** a lo acordado por el equipo con la ingeniera. El modelo correcto es: **la veterinaria registra la atención realizada y define la próxima fecha de seguimiento/control**; el dueño solo puede **consultar** esa información, no elegir horarios por su cuenta. Esta corrección reemplaza la lógica de agendamiento tipo "reserva de turno" en toda la User Story 1, sus Acceptance Scenarios, el Edge Case de reserva simultánea, y los requisitos FR-001 a FR-003. El resto del documento no cambia.

---

## Resumen del problema

Tanto veterinarias como dueños de mascotas dependen de procesos manuales (WhatsApp, carnets físicos, cuadernos, Excel básico) para gestionar citas, historial médico e inventario, lo que genera pérdida de turnos, gastos duplicados por falta de historial, y tiempo administrativo perdido respondiendo mensajes repetitivos.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro de atención y seguimiento clínico por la veterinaria (Priority: P1)

Como veterinaria (Helpet, Pelusa), quiero registrar cada atención realizada a una mascota y definir la próxima fecha de seguimiento/control directamente en el sistema, para llevar un historial clínico ordenado sin depender de WhatsApp o cuadernos, y para que el sistema genere el recordatorio automático de esa próxima fecha sin que el dueño tenga que elegir un horario por su cuenta.

> **Fuente:** *"Cuando tenemos muchos pacientes es difícil responder todos los mensajes. A veces dos personas piden el mismo horario"* — Helpet. *"Perdemos ese espacio porque muchas veces no avisan que no van a asistir"* — Helpet.

> **Corrección de alcance (equipo + ingeniera, 1 de agosto de 2026):** el flujo NO es que el dueño reserve un horario disponible por su cuenta (modelo tipo "reserva de turno"). El flujo real es: la veterinaria atiende a la mascota, registra la atención en el sistema, y define la próxima fecha de control/seguimiento. El sistema usa esa fecha para generar el recordatorio automático (ver User Story 2). El dueño solo visualiza esta información, no la edita ni elige horarios.

**Why this priority**: Funcionalidad operativa central validada directamente por veterinarias en entrevistas reales. Evita la saturación de chats y ordena el registro clínico sin depender de WhatsApp o cuadernos.

**Independent Test**: Ingresar como veterinaria, registrar una atención para una mascota existente, definir una próxima fecha de seguimiento, y verificar que el dueño de la mascota pueda visualizar esa atención y la fecha definida (en modo solo lectura) desde su perfil.

**Acceptance Scenarios**:

1. **Given** una veterinaria autenticada y una mascota registrada, **When** la veterinaria registra una atención con fecha, tipo de atención y observaciones, **Then** el sistema guarda la atención en el historial de la mascota y la asocia al negocio que la registró.
2. **Given** una atención recién registrada, **When** la veterinaria define una próxima fecha de seguimiento/control, **Then** el sistema almacena esa fecha y la usa como base para generar el recordatorio automático correspondiente (ver User Story 2).
3. **Given** una atención y próxima fecha ya registradas por la veterinaria, **When** el dueño de la mascota accede a su perfil, **Then** puede visualizar la atención y la próxima fecha definida, pero no puede modificarlas ni elegir un horario por su cuenta.

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

- **Registro simultáneo de atenciones**: Si la veterinaria intenta registrar dos atenciones en conflicto para la misma mascota/negocio en el mismo momento, el sistema debe validar la integridad del registro mediante transacciones atómicas (Prisma), evitando duplicados o inconsistencias — esto es una validación de integridad de datos, no una "reserva" competida por el dueño.
- **Fallos en canales de notificación**: Si el envío automático de un recordatorio falla, la tarea programada debe reintentar con estrategia de retroceso (backoff) y registrar el error en logs estructurados.
- **Control de acceso por rol (RBAC)**: Si un usuario no autorizado intenta acceder al historial médico de una mascota de la cual no es propietario ni veterinaria tratante, la aplicación debe responder con denegación 403 Forbidden.

---

## Functional Requirements (Requisitos funcionales)

**Registro de atención y seguimiento clínico**
- **FR-001:** El sistema debe permitir a la veterinaria registrar una atención/consulta realizada a una mascota, incluyendo fecha, tipo de atención y observaciones.
- **FR-002:** El sistema debe permitir a la veterinaria definir la próxima fecha de seguimiento/control al registrar una atención.
- **FR-003:** El sistema debe permitir al dueño de la mascota visualizar (solo lectura) las atenciones registradas y la próxima fecha de seguimiento definida por la veterinaria, sin poder modificarla ni elegir horarios él mismo.

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

- **SC-001:** Reducción medible de atenciones sin seguimiento registrado, comparado con el manejo actual por WhatsApp/cuadernos.
- **SC-002:** Los negocios dejan de necesitar responder manualmente cada recordatorio de vacuna o control.
- **SC-003:** Un dueño de mascota puede consultar el historial completo de su mascota sin depender de un carnet físico, incluso si cambió de veterinaria.

> **Nota de resolución:** Los criterios se mantienen cualitativos hasta contar con datos de telemetría post-lanzamiento del MVP para fijar valores numéricos definitivos.

---

## Key Entities (Entidades clave)

- **User / Usuario** — dueño de mascota (`PET_OWNER`), negocio (`VET_BUSINESS`) o administrador (`ADMIN`).
- **Pet / Mascota** — animal registrado por un dueño.
- **MedicalRecord / Historial Médico** — registro de vacunas y tratamientos de una mascota, incluye la próxima fecha de seguimiento definida por la veterinaria.
- **Business / Negocio** — veterinaria registrada.
- **Reminder / Recordatorio** — notificación automática de vacuna o control próximo, generada a partir de la próxima fecha de seguimiento registrada en el historial médico.

> **Nota:** la entidad **Appointment / Cita** de la versión anterior (con lógica de "reserva de horario por el dueño") queda descartada por la corrección de alcance del 1 de agosto de 2026. El seguimiento clínico ahora vive dentro de `MedicalRecord` (campo de próxima fecha), no como una entidad de reserva independiente.

---

## Fuera de alcance (decisión del equipo)

- **Venta de productos y catálogo de tienda (FR-009):** fuera del MVP, planificado para Fase 2.
- **Filtros de búsqueda avanzados** (tipo de servicio, calificación): fuera del MVP, planificado para Fase 2.
- **Auto-reserva de horarios por el dueño** (modelo tipo "reserva de turno"): descartado por corrección de alcance del equipo + ingeniera (1 de agosto de 2026). El dueño no elige horarios; la veterinaria registra la atención y define la próxima fecha.
- Cualquier funcionalidad mencionada solo en el "Plan de Estrategia Comercial" pero no verificada en la transcripción original (reseñas verificadas, validación de receta médica, suscripción premium, etc.) — **descartada definitivamente**.

---

## Checklist de validación del spec

- [x] Resolver los `[NEEDS CLARIFICATION]` marcados arriba — resuelto por el equipo.
- [x] Confirmar trazabilidad de datos — cifras no verificables del Plan de Estrategia Comercial **descartadas**.
- [x] **Corrección de alcance aplicada:** User Story 1 corregida de "auto-reserva de horario por el dueño" a "registro de atención + próxima fecha por la veterinaria" (equipo + ingeniera, 1 de agosto de 2026).
- [x] **Riesgo conocido, no bloqueante:** revisar contenido de `Sin_titulo (2).md` (líneas 57–347) cuando esté disponible.
- [x] **Riesgo conocido, no bloqueante:** evaluar adición de entrevistas futuras a más veterinarios.
- [x] Aprobado por el equipo — listo para regenerar `/speckit-plan` y `/speckit-tasks` con la lógica corregida.