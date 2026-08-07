import React, { useState } from "react";
import {
  useQuery,
  getReminders,
  getPets,
  createReminder,
  toggleReminderStatus,
} from "wasp/client/operations";
import {
  Bell,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Syringe,
  Pill,
  Stethoscope,
  Scissors,
  Repeat,
  AlertCircle,
  X,
  Loader2,
  Check,
  RotateCcw,
  PawPrint,
  Sparkles,
  Inbox,
} from "lucide-react";
import { toast } from "../../client/hooks/use-toast";
import { cn } from "../../client/utils";

export const RemindersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedPetId, setSelectedPetId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [recurring, setRecurring] = useState(false);
  const [intervalDays, setIntervalDays] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const {
    data: reminders,
    isLoading: isLoadingReminders,
    error: errorReminders,
    refetch: refetchReminders,
  } = useQuery(getReminders);

  const { data: pets, isLoading: isLoadingPets } = useQuery(getPets);

  // Filter reminders by status
  const upcomingReminders =
    reminders?.filter((r: any) => r.status === "PENDING" || r.status === "SENT") || [];
  const completedReminders =
    reminders?.filter((r: any) => r.status === "COMPLETED" || r.status === "CANCELLED") || [];

  const displayedReminders = activeTab === "upcoming" ? upcomingReminders : completedReminders;

  const getReminderIcon = (titleStr: string, recordType?: string) => {
    const t = (titleStr || "").toLowerCase();
    const rt = (recordType || "").toLowerCase();

    if (t.includes("vacun") || rt.includes("vaccine")) {
      return {
        icon: <Syringe className="w-5 h-5 text-emerald-400" />,
        bg: "bg-emerald-500/10 border-emerald-500/30",
        badge: "Vacunación",
      };
    }
    if (t.includes("desparasit") || rt.includes("deworming")) {
      return {
        icon: <Pill className="w-5 h-5 text-purple-400" />,
        bg: "bg-purple-500/10 border-purple-500/30",
        badge: "Desparasitación",
      };
    }
    if (t.includes("cirug") || rt.includes("surgery")) {
      return {
        icon: <Scissors className="w-5 h-5 text-amber-400" />,
        bg: "bg-amber-500/10 border-amber-500/30",
        badge: "Procedimiento",
      };
    }
    if (t.includes("cita") || t.includes("consult") || rt.includes("consultation")) {
      return {
        icon: <Stethoscope className="w-5 h-5 text-blue-400" />,
        bg: "bg-blue-500/10 border-blue-500/30",
        badge: "Consulta Médica",
      };
    }
    return {
      icon: <Bell className="w-5 h-5 text-teal-400" />,
      bg: "bg-teal-500/10 border-teal-500/30",
      badge: "Recordatorio General",
    };
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPetId) {
      toast({
        title: "Selecciona una mascota",
        description: "Debes asociar el recordatorio a una de tus mascotas.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Título obligatorio",
        description: "Ingresa el título del recordatorio.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReminder({
        petId: selectedPetId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        recurring,
        intervalDays: recurring ? intervalDays : undefined,
      });

      toast({
        title: "¡Recordatorio creado!",
        description: "Se ha programado el recordatorio exitosamente.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setRecurring(false);
      setIsModalOpen(false);
      refetchReminders();
    } catch (err: any) {
      toast({
        title: "Error al crear recordatorio",
        description: err?.message || "Ocurrió un problema al guardar el recordatorio.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (reminderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await toggleReminderStatus({ reminderId, status: nextStatus });
      toast({
        title: nextStatus === "COMPLETED" ? "Recordatorio completado" : "Recordatorio reactivado",
        description:
          nextStatus === "COMPLETED"
            ? "El recordatorio se ha movido al historial de completados."
            : "El recordatorio se ha restaurado a próximos eventos.",
      });
      refetchReminders();
    } catch (err: any) {
      toast({
        title: "Error al actualizar",
        description: err?.message || "No se pudo cambiar el estado del recordatorio.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingReminders) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-40 bg-slate-900 rounded-3xl border border-slate-800" />
          <div className="h-12 w-80 bg-slate-900 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-36 bg-slate-900 rounded-2xl border border-slate-800" />
            <div className="h-36 bg-slate-900 rounded-2xl border border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-850 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Bell className="w-48 h-48 text-emerald-400" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                🔔 Alertas de Salud & Cuidados
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Mis Recordatorios
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Agenda controles, vacunas y tareas de seguimiento para mantener al día la salud de tus mascotas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Recordatorio</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all",
              activeTab === "upcoming"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <Clock className="w-4 h-4" />
            <span>Próximos ({upcomingReminders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all",
              activeTab === "completed"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completados / Historial ({completedReminders.length})</span>
          </button>
        </div>

        {/* Reminders List Grid */}
        {displayedReminders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
            <div className="inline-flex p-4 rounded-full bg-slate-800/60 text-slate-400">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">
              {activeTab === "upcoming"
                ? "No tienes recordatorios próximos pendientes"
                : "No hay recordatorios completados aún"}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              {activeTab === "upcoming"
                ? "Haz clic en 'Nuevo Recordatorio' para agendar vacunas o desparasitaciones."
                : "Los recordatorios completados aparecerán listados aquí."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedReminders.map((reminder: any) => {
              const category = getReminderIcon(reminder.title, reminder.medicalRecord?.recordType);
              const formattedDate = new Date(reminder.dueDate).toLocaleDateString("es-ES", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const isCompleted = reminder.status === "COMPLETED";

              return (
                <div
                  key={reminder.id}
                  className={cn(
                    "rounded-3xl bg-slate-900/90 border p-5 sm:p-6 shadow-xl transition-all flex flex-col justify-between space-y-4 hover:border-slate-700/80 group",
                    isCompleted ? "border-slate-800 opacity-75" : "border-slate-800"
                  )}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-3 rounded-2xl border", category.bg)}>
                          {category.icon}
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                            {category.badge}
                          </span>
                          <h3
                            className={cn(
                              "text-base sm:text-lg font-bold tracking-tight",
                              isCompleted ? "line-through text-slate-400" : "text-white"
                            )}
                          >
                            {reminder.title}
                          </h3>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-extrabold uppercase border tracking-wider shrink-0",
                          isCompleted
                            ? "bg-slate-800 border-slate-700 text-slate-400"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        )}
                      >
                        {isCompleted ? "Completado" : "Pendiente"}
                      </span>
                    </div>

                    {/* Description */}
                    {reminder.description && (
                      <p className="text-xs sm:text-sm text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                        {reminder.description}
                      </p>
                    )}

                    {/* Pet & Due Date Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 font-semibold">
                        <PawPrint className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{reminder.pet?.name || "Mascota"}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Recurrence Indicator */}
                    {reminder.recurring && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-semibold pt-1">
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Recurrente (cada {reminder.intervalDays || 30} días)</span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(reminder.id, reminder.status)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        isCompleted
                          ? "bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      {isCompleted ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reactivar Recordatorio</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Marcar como Completado</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Form for Creating Reminder */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 relative space-y-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nuevo Recordatorio</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Programa una alerta de vacunación, desparasitación o control.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateReminder} className="space-y-4">
                {/* Select Mascota */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Mascota <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-slate-800 border border-slate-700 p-3.5 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="">-- Selecciona una mascota --</option>
                    {pets?.map((pet: any) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Título */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Título del Recordatorio <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Vacuna Rabia, Pastilla Desparasitante, Control Anual"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-slate-800 border border-slate-700 p-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                  />
                </div>

                {/* Fecha Límite */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Fecha Programada <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-slate-800 border border-slate-700 p-3.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                  />
                </div>

                {/* Checkbox Recurrencia */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/50 bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm font-semibold text-slate-200">
                      Recordatorio Recurrente (Repetir automáticamente)
                    </span>
                  </label>

                  {recurring && (
                    <div className="pl-7 space-y-1.5">
                      <label className="block text-xs text-slate-400 font-medium">
                        Repetir cada cuántos días:
                      </label>
                      <select
                        value={intervalDays}
                        onChange={(e) => setIntervalDays(Number(e.target.value))}
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <option value={30}>Cada 30 días (Mensual)</option>
                        <option value={90}>Cada 90 días (Trimestral)</option>
                        <option value={180}>Cada 180 días (Semestral)</option>
                        <option value={365}>Cada 365 días (Anual)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Descripción / Notas */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Notas adicionales (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Instrucciones o dosis adicionales..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-2xl bg-slate-800 border border-slate-700 p-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none font-normal"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !selectedPetId}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <span>Crear Recordatorio</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;
