/**
 * Worker Cron Job para procesar recordatorios pendientes de atenciones médicas.
 * Tarea T019: Lógica interna de notificación automatizada, logs de notificación y recalculo de recurrencias.
 */

export async function sendEmailNotification({
  to,
  subject,
  bodyText,
  bodyHtml,
}: {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
}) {
  try {
    const { emailSender } = await import("wasp/server/email");
    if (emailSender && typeof emailSender.send === "function") {
      await emailSender.send({
        to,
        subject,
        text: bodyText,
        html: bodyHtml,
      });
      console.log(`✉️ [Email enviado con éxito] Destinatario: ${to} | Asunto: ${subject}`);
      return;
    }
  } catch (err) {
    console.warn("ℹ️ Proveedor de email nativo no disponible o en modo local dummy:", err);
  }

  // Simulación de envío de correo electrónico en consola (para entornos dev/test)
  console.log(`
  ========= 📩 SIMULACIÓN DE ENVÍO DE EMAIL =========
  Para: ${to}
  Asunto: ${subject}
  Mensaje: ${bodyText}
  ===================================================
  `);
}

export async function checkPendingReminders(args: any, context: any) {
  console.log("🕒 [Cron Job: checkPendingReminders] Iniciando escaneo de recordatorios pendientes...");

  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  let successCount = 0;
  let failedCount = 0;

  try {
    // 1. Búsqueda en DB: recordatorios en PENDING cuya dueDate esté dentro de las próximas 24 horas
    const pendingReminders = await context.entities.Reminder.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          lte: next24Hours,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            username: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
      },
    });

    console.log(`📋 [Cron Job] Se encontraron ${pendingReminders.length} recordatorios pendientes para las próximas 24h.`);

    // 2. Procesamiento individual resiliente con try/catch por cada recordatorio
    for (const reminder of pendingReminders) {
      try {
        const userEmail = reminder.user?.email;
        const userName = reminder.user?.fullName || reminder.user?.username || "Usuario";
        const petName = reminder.pet?.name || "tu mascota";
        const formattedDate = new Date(reminder.dueDate).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        if (!userEmail) {
          throw new Error(`El usuario con ID ${reminder.userId} no tiene un correo electrónico configurado.`);
        }

        const subject = `📌 Recordatorio Veterinario: ${reminder.title} - PetPocket`;
        const bodyText = `Hola ${userName},\n\nTe recordamos la atención médica programada "${reminder.title}" para ${petName} con fecha límite: ${formattedDate}.\n\n¡Gracias por cuidar a tu mascota con PetPocket!`;
        const bodyHtml = `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc;">
            <h2 style="color: #059669;">🐾 Recordatorio de Atención Médica</h2>
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Te recordamos la siguiente atención médica programada para tu mascota <strong>${petName}</strong>:</p>
            <div style="background-color: #ffffff; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0f172a;">${reminder.title}</p>
              ${reminder.description ? `<p style="margin: 5px 0 0 0; color: #475569;">${reminder.description}</p>` : ""}
              <p style="margin: 5px 0 0 0; color: #059669; font-weight: 600;">📅 Fecha: ${formattedDate}</p>
            </div>
            <p style="font-size: 12px; color: #64748b;">Este es un mensaje automático generado por PetPocket.</p>
          </div>
        `;

        // Invocar/simular envío de correo electrónico
        await sendEmailNotification({
          to: userEmail,
          subject,
          bodyText,
          bodyHtml,
        });

        // Registrar entrada de éxito en NotificationLog
        await context.entities.NotificationLog.create({
          data: {
            reminderId: reminder.id,
            userId: reminder.userId,
            channel: "EMAIL",
            status: "SUCCESS",
            sentAt: new Date(),
          },
        });

        // Manejo de recurrencia o finalización del recordatorio
        if (reminder.recurring && reminder.intervalDays && reminder.intervalDays > 0) {
          const newDueDate = new Date(
            new Date(reminder.dueDate).getTime() + reminder.intervalDays * 24 * 60 * 60 * 1000
          );
          await context.entities.Reminder.update({
            where: { id: reminder.id },
            data: {
              dueDate: newDueDate,
              status: "PENDING",
              sentAt: new Date(),
            },
          });
          console.log(`🔄 Recordatorio recurrente ID ${reminder.id} reprogramado para: ${newDueDate.toISOString()}`);
        } else {
          await context.entities.Reminder.update({
            where: { id: reminder.id },
            data: {
              status: "COMPLETED",
              sentAt: new Date(),
            },
          });
          console.log(`✅ Recordatorio ID ${reminder.id} marcado como COMPLETED.`);
        }

        successCount++;
      } catch (reminderErr: any) {
        const errorMsg = reminderErr?.message || String(reminderErr);
        console.error(`❌ Error procesando el recordatorio ID ${reminder.id}:`, errorMsg);

        // Registrar fallo en NotificationLog sin interrumpir el bucle
        try {
          await context.entities.NotificationLog.create({
            data: {
              reminderId: reminder.id,
              userId: reminder.userId,
              channel: "EMAIL",
              status: "FAILED",
              errorMessage: errorMsg,
              sentAt: new Date(),
            },
          });
        } catch (logErr) {
          console.error("⚠️ No se pudo registrar el NotificationLog de fallo:", logErr);
        }

        failedCount++;
      }
    }

    console.log(`🏁 [Cron Job: checkPendingReminders] Proceso finalizado. Exitosos: ${successCount}, Fallidos: ${failedCount}`);
    return {
      processed: pendingReminders.length,
      successCount,
      failedCount,
      timestamp: now.toISOString(),
    };
  } catch (globalErr: any) {
    console.error("💥 Error fatal en el Cron Job checkPendingReminders:", globalErr);
    throw globalErr;
  }
}
