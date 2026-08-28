import React, { useState, useMemo, useEffect } from "react";
import { useQuery, getUserReminders } from "wasp/client/operations";
import { Link } from "wasp/client/router";

type FilterStatus = "ALL" | "PENDING" | "OVERDUE" | "SENT";

interface PetInfo {
  id: string;
  name: string;
  species: string;
}

interface BusinessInfo {
  name: string;
  phone?: string | null;
}

interface MedicalRecordInfo {
  id: string;
  title: string;
  recordType: string;
  nextDueDate?: string | Date | null;
  business?: BusinessInfo | null;
}

export interface ReminderItem {
  id: string;
  petId: string;
  medicalRecordId?: string | null;
  scheduledFor: string | Date;
  status: string;
  sentAt?: string | Date | null;
  pet?: PetInfo | null;
  medicalRecord?: MedicalRecordInfo | null;
}

// ---------------------------------------------------------------------------
// Pure helper — lives outside the component so it is never recreated on
// re-renders and can be called safely from useMemo without being listed as
// an implicit dependency.
// The backend only ever stores status = "PENDING" | "SENT"; "OVERDUE" is a
// purely client-side concept derived from the scheduledFor date.
// ---------------------------------------------------------------------------
function getUrgencyInfo(
  scheduledForStr: string | Date,
  status: string,
  now: Date
) {
  const targetDate = new Date(scheduledForStr);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (status === "SENT") {
    return {
      label: "Notificado",
      // isOverdue and isSoon are mutually exclusive; SENT records are neither.
      isOverdue: false,
      isSoon: false,
      colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      badgeIcon: "✅",
      timeDescription: "Recordatorio enviado",
    };
  }

  if (diffDays < 0) {
    const positiveDays = Math.abs(diffDays);
    return {
      label: "Vencido",
      isOverdue: true,
      isSoon: false, // mutually exclusive with isOverdue
      colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      badgeIcon: "⚠️",
      timeDescription: `Vencido hace ${positiveDays} día${positiveDays === 1 ? "" : "s"}`,
    };
  }

  if (diffDays <= 7) {
    return {
      label: diffDays === 0 ? "Vence hoy" : `Próximo (${diffDays}d)`,
      isOverdue: false, // mutually exclusive with isSoon
      isSoon: true,
      colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      badgeIcon: "⏳",
      timeDescription: diffDays === 0 ? "¡Vence hoy!" : `Faltan ${diffDays} día${diffDays === 1 ? "" : "s"}`,
    };
  }

  return {
    label: "Programado",
    isOverdue: false,
    isSoon: false,
    colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    badgeIcon: "📅",
    timeDescription: `Faltan ${diffDays} días`,
  };
}

export const ReminderListPage: React.FC = () => {
  const { data: reminders, isLoading, error } = useQuery(getUserReminders);
  const remindersList = Array.isArray(reminders)
    ? (reminders as unknown as ReminderItem[])
    : [];

  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("ALL");
  const [selectedPetId, setSelectedPetId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // `now` is updated every minute so urgency labels stay accurate without
  // a page refresh. A plain useMemo(()=>new Date(),[]) would freeze at mount.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Extract unique pets for dropdown filter
  const uniquePets = useMemo(() => {
    const petMap = new Map<string, PetInfo>();
    remindersList.forEach((r) => {
      if (r.pet && !petMap.has(r.pet.id)) {
        petMap.set(r.pet.id, r.pet);
      }
    });
    return Array.from(petMap.values());
  }, [reminders]);

  // Statistics calculation
  const stats = useMemo(() => {
    let upcomingSoon = 0;
    let overdue = 0;
    let sent = 0;

    remindersList.forEach((r) => {
      if (r.status === "SENT") {
        sent++;
      } else {
        // isOverdue and isSoon are mutually exclusive by design in getUrgencyInfo,
        // so a single reminder can only increment one of these counters.
        const info = getUrgencyInfo(r.scheduledFor, r.status, now);
        if (info.isOverdue) overdue++;
        else if (info.isSoon) upcomingSoon++;
      }
    });

    return {
      total: remindersList.length,
      upcomingSoon,
      overdue,
      sent,
    };
  }, [reminders, now]);

  // Filtered Reminders List
  const filteredReminders = useMemo(() => {
    return remindersList.filter((r) => {
      // NOTE: The backend only stores status = "PENDING" | "SENT".
      // "OVERDUE" is a client-side concept derived purely from scheduledFor.
      const urgency = getUrgencyInfo(r.scheduledFor, r.status, now);

      // Status filter
      // PENDING tab: records that are PENDING and NOT yet past their due date.
      if (selectedStatus === "PENDING" && (urgency.isOverdue || r.status === "SENT")) {
        return false;
      }
      // OVERDUE tab: records that are past their due date and have not been sent.
      if (selectedStatus === "OVERDUE" && !urgency.isOverdue) {
        return false;
      }
      // SENT tab: records that were already notified.
      if (selectedStatus === "SENT" && r.status !== "SENT") {
        return false;
      }

      // Pet filter
      if (selectedPetId !== "ALL" && r.pet?.id !== selectedPetId) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const petName = (r.pet?.name || "").toLowerCase();
        const recordTitle = (r.medicalRecord?.title || "").toLowerCase();
        const businessName = (r.medicalRecord?.business?.name || "").toLowerCase();

        return petName.includes(query) || recordTitle.includes(query) || businessName.includes(query);
      }

      return true;
    });
  }, [reminders, selectedStatus, selectedPetId, searchQuery, now]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-slate-400 text-sm animate-pulse">Cargando recordatorios de salud...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 max-w-4xl mx-auto my-6">
        <h3 className="font-semibold text-lg">Error al cargar los recordatorios</h3>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          🔔 Alertas de Salud Preventiva
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Recordatorios Programados</h1>
        <p className="text-slate-400 text-sm mt-1">
          Fechas de vacunas, desparasitaciones y controles agendados para la salud de tus mascotas.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Alertas</span>
          <span className="text-2xl font-bold text-white">{stats.total}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-amber-500/20 flex flex-col justify-between space-y-1">
          <span className="text-xs text-amber-400 font-medium">Próximos (7 días)</span>
          <span className="text-2xl font-bold text-amber-400">{stats.upcomingSoon}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-rose-500/20 flex flex-col justify-between space-y-1">
          <span className="text-xs text-rose-400 font-medium">Vencidos</span>
          <span className="text-2xl font-bold text-rose-400">{stats.overdue}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-purple-500/20 flex flex-col justify-between space-y-1">
          <span className="text-xs text-purple-400 font-medium">Notificados</span>
          <span className="text-2xl font-bold text-purple-400">{stats.sent}</span>
        </div>
      </div>

      {/* Control Panel: Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedStatus === "ALL"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
              }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setSelectedStatus("PENDING")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedStatus === "PENDING"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
              }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setSelectedStatus("OVERDUE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedStatus === "OVERDUE"
                ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
              }`}
          >
            Vencidos ({stats.overdue})
          </button>
          <button
            onClick={() => setSelectedStatus("SENT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${selectedStatus === "SENT"
                ? "bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
              }`}
          >
            Notificados ({stats.sent})
          </button>
        </div>

        {/* Pet Filter & Search Input */}
        <div className="flex items-center gap-2">
          {uniquePets.length > 0 && (
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas las mascotas</option>
              {uniquePets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species === "DOG" ? "Perro" : pet.species === "CAT" ? "Gato" : "Mascota"})
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              placeholder="Buscar recordatorio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-emerald-500"
            />
            <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>
      </div>

      {/* Main Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 space-y-3">
          <span className="text-4xl">🎉</span>
          <h3 className="text-lg font-bold text-white">No se encontraron recordatorios</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {searchQuery || selectedPetId !== "ALL" || selectedStatus !== "ALL"
              ? "Prueba cambiando los filtros seleccionados o el término de búsqueda."
              : "¡Todo al día! No tienes vacunas ni controles pendientes en este momento."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredReminders.map((reminder) => {
            const dateObj = new Date(reminder.scheduledFor);
            const dateFormatted = dateObj.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const urgency = getUrgencyInfo(reminder.scheduledFor, reminder.status, now);

            const speciesIcon =
              reminder.pet?.species === "DOG" ? "🐶" : reminder.pet?.species === "CAT" ? "🐱" : "🐾";

            const clinicPhone = reminder.medicalRecord?.business?.phone;

            return (
              <div
                key={reminder.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xl group-hover:scale-105 transition-transform">
                      {speciesIcon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{reminder.pet?.name}</h3>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        {reminder.medicalRecord?.title || "Control Veterinario"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${urgency.colorClass}`}
                  >
                    <span>{urgency.badgeIcon}</span>
                    <span>{urgency.label}</span>
                  </span>
                </div>

                {/* Scheduled Date & Time info */}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>📅</span>
                    <span className="font-medium">Programado:</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">{dateFormatted}</span>
                    <span className="text-[10px] text-slate-400 block">{urgency.timeDescription}</span>
                  </div>
                </div>

                {/* Clinic details if present */}
                {reminder.medicalRecord?.business && (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span className="truncate">
                      🏥 Veterinaria:{" "}
                      <strong className="text-slate-200">{reminder.medicalRecord.business.name}</strong>
                    </span>
                    {clinicPhone && (
                      <a
                        href={`tel:${clinicPhone}`}
                        className="text-emerald-400 hover:underline text-[11px] font-semibold flex items-center gap-1 shrink-0"
                      >
                        📞 Llamar
                      </a>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                {reminder.pet?.id && (
                  <div className="pt-1">
                    <Link
                      to="/pets/:petId/medical-history"
                      params={{ petId: reminder.pet.id }}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <span>📋</span>
                      <span>Ver Carné Digital / Historial</span>
                    </Link>
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
