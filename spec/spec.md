# Especificación de Funcionalidad: PetPocket — MVP

**Rama:** 001-mvp
**Estado:** Aprobado por el equipo (sin revisión de mentor) — listo para `/speckit-plan`

> ✅ **Nota de resolución de clarificaciones (equipo, sin mentor disponible):**
> Ante la falta de revisión del mentor de investigación, el equipo tomó las
> siguientes decisiones para poder avanzar, documentadas aquí para
> trazabilidad:
> 1. **Catálogo/venta de tienda (P5 / FR-009):** queda **fuera del MVP**.
>    Se mueve a Fase 2. Motivo: solo 2 de las fuentes entrevistadas hablan
>    de venta de productos; el problema central validado por la mayoría de
>    entrevistas es agenda + recordatorios + historial médico veterinario.
> 2. **Filtros de búsqueda (tipo de servicio, calificación):** quedan
>    **fuera del MVP**. Se mantiene únicamente búsqueda por cercanía
>    (respaldada por la fuente de Isaac). Se revisita en Fase 2.
> 3. **Datos del "Plan de Estrategia Comercial"** (Army Paws, PreamVet,
>    Clínica del Sur, "25 horas/mes", "30-45 clientes recuperados", etc.):
>    **se descartan definitivamente** de este spec por no tener
>    trazabilidad a una transcripción real.
> 4. **Sección no revisada de `Sin_titulo (2).md` (líneas 57–347):** no se
>    pudo revisar por falta de disponibilidad del mentor. Se deja como
>    **riesgo conocido**, no como bloqueante: si aparece contenido nuevo
>    más adelante, se evaluará como cambio incremental al spec, no se
>    asume ni se inventa contenido a partir de ella.

> ⚠️ **Nota de trazabilidad:** este documento se construyó a partir de las
> transcripciones reales visibles en `Sin_titulo (2).md`: entrevistas a
> Helpet (veterinaria), Isaac, Fredy Toabanda, Pelusa (veterinaria, 2
> sucursales), Dr. Carlos Mendoza (tienda de mascotas) y Dr. Alejandro
> Paredes (tienda de accesorios). El archivo tiene una sección central
> (líneas 57–347) que no fue revisada todavía — este spec debe
> actualizarse una vez que se confirme su contenido.
>
> Los datos y nombres del documento "Plan de Estrategia Comercial"
> (Army Paws, PreamVet, Clínica del Sur, cifras como "25 horas/mes" o
> "30-45 clientes recuperados") **no se usaron aquí** porque no fue
> posible verificarlos contra la transcripción original. No deben darse
> por válidos hasta confirmar su fuente.

---

## Resumen del problema

Tanto veterinarias como dueños de mascotas dependen de procesos manuales
(WhatsApp, carnets físicos, cuadernos, Excel básico) para gestionar citas,
historial médico e inventario, lo que genera pérdida de turnos, gastos
duplicados por falta de historial, y tiempo administrativo perdido
respondiendo mensajes repetitivos.

---

## User Scenarios (Escenarios de usuario)

### P1 — Agenda de citas automatizada para negocios
Como veterinaria (Helpet, Pelusa), quiero que las citas se reserven
automáticamente sin depender de WhatsApp, para evitar que dos personas
pidan el mismo horario y para no perder espacios por inasistencias sin
aviso.

> Fuente: *"Cuando tenemos muchos pacientes es difícil responder todos
> los mensajes. A veces dos personas piden el mismo horario"* — Helpet.
> *"Perdemos ese espacio porque muchas veces no avisan que no van a
> asistir"* — Helpet.

### P2 — Recordatorios automáticos de vacunas y controles
Como dueño de mascota (Isaac, Fredy) o veterinaria (Helpet, Pelusa),
quiero recibir/enviar recordatorios automáticos de vacunas y
desparasitaciones, para no depender de la memoria o de que el cliente
revise su carnet físico.

> Fuente: *"Se me pasan las fechas"* — Isaac. *"Me gustaría que el
> sistema enviara recordatorios de vacunas y consultas"* — Helpet.
> *"Como un recordatorio para su control de vacunas"* — Fredy.

### P3 — Historial médico digital centralizado y portable
Como dueño de mascota, quiero que el historial de mi mascota no se
pierda ni dependa de un carnet físico, para no repetir vacunas ni gastar
dinero de más al cambiar de veterinaria.

> Fuente: *"Cuando me cambié de casa perdí el carnet de vacunas... tuve
> que repetir algunas vacunas. Eso significó gastar mucho dinero y
> perder bastante tiempo"* — Isaac.

### P4 — Búsqueda de veterinarias cercanas
Como dueño de mascota, quiero encontrar una veterinaria cercana sin
depender solo de recomendaciones informales, para resolver una
necesidad rápido incluso si estoy en otro sector de la ciudad.

> Fuente: *"Pregunté al grupo de WhatsApp de mi familia... busqué en
> Google, pero varios no tenían información actualizada. Llamé a dos
> lugares y no contestaron"* — Isaac. *"Sería útil una veterinaria
> rápida si estoy en otros sectores de la ciudad"* — Isaac.

### P5 — Catálogo y pedidos para tiendas de mascotas
Como tienda de mascotas (Dr. Carlos Mendoza, Dr. Alejandro Paredes),
quiero publicar mi catálogo para que los dueños compren o pidan a
domicilio directamente desde la app, para dejar de perder tiempo
gestionando pedidos uno por uno vía WhatsApp.

> Fuente: *"Escriben al WhatsApp, preguntan si hay comida, les mandamos
> fotos... esperamos la transferencia. Todo ese cruce de mensajes nos
> hace perder fácil unos 15 minutos por cliente"* — Dr. Carlos Mendoza.

> **Resuelto (equipo):** Fuera del MVP, pasa a Fase 2. Ambos dueños de
> tienda piden condiciones específicas para adoptar la app — comisiones
> bajas (Mendoza) y poder configurar tallas/colores fácilmente (Paredes) —
> lo que implica un módulo de e-commerce más complejo que el resto del
> MVP, centrado en servicios veterinarios, no en venta de productos.

---

## Functional Requirements (Requisitos funcionales)

**Agendamiento**
- **FR-001:** El sistema debe permitir a los negocios definir su
  disponibilidad y evitar que dos citas se asignen al mismo horario.
- **FR-002:** El sistema debe permitir a los dueños reservar una cita
  directamente, sin depender de respuesta manual por WhatsApp.
- **FR-003:** El sistema debe notificar al negocio cuando un cliente no
  confirme o cancele su asistencia, para poder liberar el espacio a
  tiempo.

**Recordatorios**
- **FR-004:** El sistema debe generar recordatorios automáticos de
  vacunas y desparasitaciones próximas.
- **FR-005:** El sistema debe permitir a los negocios enviar
  recordatorios de controles sin tener que escribir manualmente a cada
  cliente por WhatsApp.

**Historial médico**
- **FR-006:** El sistema debe permitir registrar y consultar el
  historial médico de una mascota (vacunas, tratamientos) de forma
  digital, evitando depender de carnets físicos o papeles.
- **FR-007:** El sistema debe permitir que el historial de una mascota
  sea accesible aunque el dueño cambie de veterinaria.

**Búsqueda**
- **FR-008:** El sistema debe permitir buscar veterinarias cercanas
  según ubicación.

> **Resuelto (equipo):** Fuera del MVP. Ninguna entrevista revisada
> menciona filtros de búsqueda (tipo de servicio, calificación); se deja
> solo búsqueda por cercanía para esta fase. Se revisará si la sección
> pendiente de `Sin_titulo (2).md` aporta evidencia para reincorporarlo
> en Fase 2.

**Catálogo de tienda (Fase 2 — fuera del MVP, ver P5)**
- **FR-009:** *(Fase 2)* El sistema debe permitir a tiendas de mascotas
  publicar su catálogo de productos para pedidos a domicilio. No se
  implementa en el MVP.

---

## Success Criteria (Criterios de éxito)

- **SC-001:** Reducción medible de citas perdidas por inasistencia no
  avisada, comparado con el manejo actual por WhatsApp.
- **SC-002:** Los negocios dejan de necesitar responder manualmente
  cada solicitud de cita o recordatorio de vacuna.
- **SC-003:** Un dueño de mascota puede consultar el historial completo
  de su mascota sin depender de un carnet físico, incluso si cambió de
  veterinaria.

> **Resuelto (equipo):** Se descartan las cifras del "Plan de Estrategia
> Comercial" por no tener trazabilidad verificable. Los criterios de
> éxito arriba se mantienen cualitativos (reducción medible, dejar de
> responder manualmente, consulta sin carnet físico) hasta contar con
> datos reales post-lanzamiento del MVP para fijar metas numéricas.

---

## Key Entities (Entidades clave)

- **Usuario** — dueño de mascota o negocio (veterinaria/tienda).
- **Mascota** — animal registrado por un dueño.
- **Historial Médico** — registro de vacunas y tratamientos de una
  mascota.
- **Negocio** — veterinaria o tienda registrada.
- **Cita** — turno solicitado entre un dueño y un negocio.
- **Recordatorio** — notificación automática de vacuna o control
  próximo.

---

## Fuera de alcance (decisión del equipo)

- **Venta de productos y catálogo de tienda (FR-009):** fuera del MVP,
  planificado para Fase 2.
- **Filtros de búsqueda avanzados** (tipo de servicio, calificación):
  fuera del MVP, planificado para Fase 2.
- Cualquier funcionalidad mencionada solo en el "Plan de Estrategia
  Comercial" pero no verificada en la transcripción original (reseñas
  verificadas, validación de receta médica, suscripción premium, etc.)
  — **descartada definitivamente**, no forma parte del roadmap actual.

---

## Checklist de validación antes de aprobar

- [x] Resolver los `[NEEDS CLARIFICATION]` marcados arriba — resuelto por
      el equipo (ver nota de resolución al inicio del documento).
- [x] Confirmar si los nombres de negocios y cifras del "Plan de
      Estrategia Comercial" existen en alguna transcripción real —
      **descartados** por falta de trazabilidad.
- [ ] **Riesgo conocido, no bloqueante:** revisar el contenido completo
      de `Sin_titulo (2).md` (líneas 57–347) cuando esté disponible; si
      surge evidencia nueva, se evalúa como cambio incremental al spec.
- [ ] **Riesgo conocido, no bloqueante:** confirmar con el equipo si aún
      faltan entrevistas a más veterinarios (solo 2 entrevistadas: Helpet
      y Pelusa).
- [x] Aprobado por el equipo (sin disponibilidad del mentor de
      investigación) — se avanza a `/speckit-plan` bajo esta condición.