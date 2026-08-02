import React from "react";
import { useQuery, getUserReminders } from "wasp/client/operations";

export const ReminderListPage: React.FC = () => {
  const { data: reminders, isLoading, error } = useQuery(getUserReminders);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
        <h3 className="font-semibold text-lg">Error al cargar los recordatorios</h3>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 text-slate-100">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          🔔 Alertas de Salud
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Recordatorios Automáticos</h1>
        <p className="text-slate-400 text-sm mt-1">
          Fechas de vacunas y desparasitaciones programadas por la veterinaria para tus mascotas.
        </p>
      </div>

      {reminders && reminders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 space-y-3">
          <span className="text-4xl">🎉</span>
          <h3 className="text-lg font-bold text-white">¡Todo al día!</h3>
          <p className="text-slate-400 text-sm">No tienes controles ni vacunas pendientes de vencimiento próximo.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reminders?.map((reminder: any) => {
            const isPending = reminder.status === "PENDING";
            const dateStr = new Date(reminder.scheduledFor).toLocaleDateString();

            return (
              <div
                key={reminder.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-lg">
                      🐶
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{reminder.pet?.name}</h3>
                      <p className="text-xs text-slate-400">{reminder.medicalRecord?.title || "Control de salud"}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isPending
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {isPending ? "Próximo" : "Notificado"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Fecha programada:</span>
                  <span className="font-bold text-emerald-400">{dateStr}</span>
                </div>

                {reminder.medicalRecord?.business && (
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    Veterinaria: <span className="text-slate-200 font-semibold">{reminder.medicalRecord.business.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
