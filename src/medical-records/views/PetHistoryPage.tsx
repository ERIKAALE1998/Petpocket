import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, getPetMedicalHistory } from "wasp/client/operations";
import {
  ArrowLeft,
  PawPrint,
  User,
  Calendar,
  Building2,
  Phone,
  Clock,
  Syringe,
  Pill,
  Stethoscope,
  Scissors,
  FileText,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Inbox,
} from "lucide-react";
import { cn } from "../../client/utils";

export interface PetHistoryPageProps {
  petId?: string;
  userRole?: string;
}

type RecordType = "VACCINE" | "DEWORMING" | "CONSULTATION" | "SURGERY";

export const PetHistoryPage: React.FC<PetHistoryPageProps> = ({
  petId: propPetId,
}) => {
  const navigate = useNavigate();
  const params = useParams<{ petId?: string }>();
  const petId = propPetId || params.petId || "";

  const { data: history, isLoading, error } = useQuery(
    getPetMedicalHistory,
    { petId },
    { enabled: !!petId }
  );

  const getRecordTypeBadge = (type: RecordType) => {
    switch (type) {
      case "VACCINE":
        return {
          label: "Vacuna",
          icon: <Syringe className="w-4 h-4 text-emerald-400" />,
          bulletBg: "bg-emerald-500/20 border-emerald-500 text-emerald-400",
          badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        };
      case "DEWORMING":
        return {
          label: "Desparasitación",
          icon: <Pill className="w-4 h-4 text-purple-400" />,
          bulletBg: "bg-purple-500/20 border-purple-500 text-purple-400",
          badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
        };
      case "CONSULTATION":
        return {
          label: "Consulta General",
          icon: <Stethoscope className="w-4 h-4 text-blue-400" />,
          bulletBg: "bg-blue-500/20 border-blue-500 text-blue-400",
          badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
        };
      case "SURGERY":
        return {
          label: "Cirugía",
          icon: <Scissors className="w-4 h-4 text-amber-400" />,
          bulletBg: "bg-amber-500/20 border-amber-500 text-amber-400",
          badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        };
      default:
        return {
          label: type,
          icon: <FileText className="w-4 h-4 text-slate-400" />,
          bulletBg: "bg-slate-800 border-slate-700 text-slate-300",
          badgeBg: "bg-slate-800 border-slate-700 text-slate-300",
        };
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Skeleton / Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-44 bg-slate-900 rounded-xl" />
          <div className="h-44 bg-slate-900 rounded-3xl border border-slate-800" />
          <div className="space-y-4 pt-4">
            <div className="h-8 w-60 bg-slate-900 rounded-lg" />
            <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
            <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !history) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mis mascotas</span>
          </button>

          <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-4 shadow-2xl">
            <AlertCircle className="w-8 h-8 text-rose-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-rose-200">Error al cargar el historial médico</h3>
              <p className="text-sm text-rose-300/90 mt-2">
                {error?.message || "No se pudo obtener la información médica de la mascota. Verifica que el ID sea correcto o que tengas los permisos de acceso."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Header Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-sm font-medium shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver a Mis Mascotas</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vista de Solo Lectura</span>
          </div>
        </div>

        {/* Pet Info Card Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-850 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <PawPrint className="w-48 h-48 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              🐾 Carnet Médico Digital
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {history.petName}
                </h1>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-200">{history.species}</span>
                  <span>•</span>
                  <span>Raza: <strong className="text-slate-200">{history.breed || "No especificada"}</strong></span>
                </p>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-700/50 text-slate-300">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Propietario / Dueño</span>
                  <span className="text-sm font-bold text-slate-100">{history.ownerName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Read-Only Informational Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3 text-slate-300 text-sm shadow-md">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-300">
            <strong className="text-slate-100 font-semibold">Historial Clínico Oficial:</strong> Este documento digital consolida todas las atenciones veterinarias registradas por los establecimientos de salud asociados a {history.petName}. La información se mantiene actualizada en tiempo real para tu consulta.
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Historial Clínico y Controles Programados</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              {history.records.length} {history.records.length === 1 ? "registro" : "registros"}
            </span>
          </div>

          {history.records.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
              <div className="inline-flex p-4 rounded-full bg-slate-800/60 text-slate-400">
                <Inbox className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Sin atenciones registradas</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                No hay registros clínicos agendados aún para esta mascota.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8 pt-2">
              {history.records.map((record: any) => {
                const badge = getRecordTypeBadge(record.recordType);
                const dateAdmin = new Date(record.dateAdministered).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const nextDue = record.nextDueDate
                  ? new Date(record.nextDueDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : null;

                return (
                  <div key={record.id} className="relative group">
                    {/* Timeline bullet icon */}
                    <div
                      className={cn(
                        "absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                        badge.bulletBg
                      )}
                    >
                      {badge.icon}
                    </div>

                    {/* Medical Record Card */}
                    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-5 sm:p-6 shadow-xl transition-all space-y-4">
                      {/* Header row */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                              badge.badgeBg
                            )}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                            {record.title}
                          </h3>
                        </div>

                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-3 py-1.5 rounded-xl">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Atendido el: <strong className="text-slate-200">{dateAdmin}</strong></span>
                        </div>
                      </div>

                      {/* Clinical description / notes */}
                      {record.description && (
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                          {record.description}
                        </div>
                      )}

                      {/* Next Control Date Highlight */}
                      {nextDue && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm shadow-md">
                          <div className="flex items-center gap-2.5 text-emerald-300 font-medium">
                            <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>Próximo seguimiento / control agendado:</span>
                          </div>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold text-sm self-start sm:self-auto">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <span>{nextDue}</span>
                          </div>
                        </div>
                      )}

                      {/* Business & Vet Contact Details */}
                      {record.business && (
                        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            <span>Establecimiento: <strong className="text-slate-200 font-semibold">{record.business.name}</strong></span>
                          </div>
                          {record.business.phone && (
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <Phone className="w-3.5 h-3.5" />
                              <span>Contacto: <a href={"tel:" + record.business.phone} className="underline font-semibold hover:text-emerald-300">{record.business.phone}</a></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetHistoryPage;
