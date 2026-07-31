# Especificación de Funcionalidad: PetPocket — MVP


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


**Catálogo de tienda (pendiente de confirmar alcance — ver P5)**
- **FR-009:** El sistema debe permitir a tiendas de mascotas publicar su
  catálogo de productos para pedidos a domicilio.

---

## Success Criteria (Criterios de éxito)

- **SC-001:** Reducción medible de citas perdidas por inasistencia no
  avisada, comparado con el manejo actual por WhatsApp.
- **SC-002:** Los negocios dejan de necesitar responder manualmente
  cada solicitud de cita o recordatorio de vacuna.
- **SC-003:** Un dueño de mascota puede consultar el historial completo
  de su mascota sin depender de un carnet físico, incluso si cambió de
  veterinaria.


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

## Fuera de alcance / por confirmar

- Venta de productos y catálogo de tienda — su inclusión depende de
  resolver el `[NEEDS CLARIFICATION]` de la sección P5.
- Cualquier funcionalidad mencionada solo en el "Plan de Estrategia
  Comercial" pero no verificada en la transcripción original (reseñas
  verificadas, validación de receta médica, suscripción premium, etc.)
  — no se incluyó aquí hasta confirmar su origen real.

---

## Checklist de validación antes de aprobar

- [ ] Revisar el contenido completo de `Sin_titulo (2).md` (líneas
      57–347), no revisado en esta versión.
- [ ] Confirmar si los nombres de negocios y cifras del "Plan de
      Estrategia Comercial" (Army Paws, PreamVet, Clínica del Sur, etc.)
      existen en alguna transcripción real, o descartarlos si no.
- [ ] Resolver los `[NEEDS CLARIFICATION]` marcados arriba.
- [ ] Confirmar con el equipo si aún faltan entrevistas a más
      veterinarios (solo 2 veterinarias entrevistadas: Helpet y Pelusa).
- [ ] Aprobado por el Mentor de investigación antes de avanzar a
      `/speckit-plan`.
