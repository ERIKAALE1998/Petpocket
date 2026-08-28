import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { addMedicalRecord } from "wasp/client/operations";
import {
  Syringe,
  Pill,
  Stethoscope,
  Scissors,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
  Clock,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { toast } from "../../client/hooks/use-toast";
import { cn } from "../../client/utils";

export interface NewMedicalRecordPageProps {
  petId?: string;
}

type RecordType = "VACCINE" | "DEWORMING" | "CONSULTATION" | "SURGERY";

export const NewMedicalRecordPage: React.FC<NewMedicalRecordPageProps> = ({
  petId: propPetId,
}) => {
  const navigate = useNavigate();
  const params = useParams<{ petId?: string }>();
  const petId = propPetId || params.petId || "";

  const todayStr = new Date().toISOString().split("T")[0];

  const [recordType, setRecordType] = useState<RecordType>("VACCINE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateAdministered, setDateAdministered] = useState(todayStr);
  const [nextDueDate, setNextDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getRecordTypeBadge = (type: RecordType) => {
    switch (type) {
      case "VACCINE":
        return {
          label: "Vacuna",
          icon: <Syringe className="w-5 h-5 text-emerald-400" />,
          color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        };
      case "DEWORMING":
        return {
          label: "Desparasitación",
          icon: <Pill className="w-5 h-5 text-purple-400" />,
          color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
        };
      case "CONSULTATION":
        return {
          label: "Consulta General",
          icon: <Stethoscope className="w-5 h-5 text-blue-400" />,
          color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
        };
      case "SURGERY":
        return {
          label: "Cirugía",
          icon: <Scissors className="w-5 h-5 text-amber-400" />,
          color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        };
    }
  };

  const handleCancel = () => {
    if (petId) {
      navigate(`/pets/${petId}/medical-history`);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!petId) {
      const errorMsg = "No se ha especificado el ID de la mascota (petId).";
      setErrorMessage(errorMsg);
      toast({
        title: "Error de validación",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      const errorMsg = "El título de la atención es obligatorio.";
      setErrorMessage(errorMsg);
      toast({
        title: "Campo requerido",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await addMedicalRecord({
        petId,
        recordType,
        title: title.trim(),
        description: description.trim() || undefined,
        dateAdministered: dateAdministered
          ? new Date(dateAdministered).toISOString()
          : undefined,
        nextDueDate: nextDueDate
          ? new Date(nextDueDate).toISOString()
          : undefined,
      });

      const successMsg = "Atención médica registrada exitosamente.";
      setSuccessMessage(successMsg);
      toast({
        title: "¡Registro guardado!",
        description: successMsg,
      });

      // Redirección al historial médico de la mascota tras guardar exitosamente
      setTimeout(() => {
        navigate(`/pets/${petId}/medical-history`);
      }, 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMsg =
        err?.message || "Ocurrió un error al guardar el registro médico.";
      setErrorMessage(errorMsg);
      toast({
        title: "Error al guardar",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const selectedBadge = getRecordTypeBadge(recordType);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all text-sm font-medium shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver al historial</span>
          </button>

          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            Tarea T015 • Clínica Veterinaria
          </span>
        </div>

        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ClipboardList className="w-40 h-40 text-emerald-400" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Registrar Atención Veterinaria
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Ingresa los detalles clínicos de la atención realizada y agenda próximos controles para alertas automáticas.
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Banners */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 animate-fade-in shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-rose-200 text-sm">Error en la operación</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3 animate-fade-in shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-200 text-sm">¡Registro completado!</h4>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                {successMessage} Redirigiendo al historial clínico...
              </p>
            </div>
          </div>
        )}

        {/* Structured Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Tipo de Atención */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Tipo de Atención <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value as RecordType)}
                  className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3.5 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer transition-all"
                >
                  <option value="VACCINE">Vacuna (VACCINE)</option>
                  <option value="DEWORMING">Desparasitación (DEWORMING)</option>
                  <option value="CONSULTATION">Consulta General (CONSULTATION)</option>
                  <option value="SURGERY">Cirugía / Procedimiento (SURGERY)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>

              {/* Visual Badge Preview */}
              <div
                className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all", selectedBadge.color)}
              >
                {selectedBadge.icon}
                <div className="text-sm">
                  <span className="text-xs text-slate-400 block font-normal">Categoría Seleccionada</span>
                  <span className="font-bold">{selectedBadge.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Título de la atención */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Título del Tratamiento / Atención <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Vacuna Antirrábica, Chequeo General, Limpieza Dental"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 pl-11 pr-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              />
              <Sparkles className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Fechas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Fecha de Administración */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Fecha de Administración <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={dateAdministered}
                onChange={(e) => setDateAdministered(e.target.value)}
                required
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              />
              <p className="text-xs text-slate-400">Fecha en que se efectuó el tratamiento.</p>
            </div>

            {/* Próxima Cita / Control */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Próxima Cita / Control (Opcional)
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full rounded-2xl bg-slate-800 border border-emerald-500/40 px-4 py-3.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              />
              <p className="text-xs text-emerald-400/90">
                📅 Clave para programar recordatorios automáticos al dueño.
              </p>
            </div>
          </div>

          {/* Descripción / Notas Clínicas */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Descripción / Notas Clínicas (Opcional)
            </label>
            <textarea
              rows={4}
              placeholder="Detalla el diagnóstico, peso, temperatura, medicamento recetado, posología o recomendaciones para el dueño..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl bg-slate-800 border border-slate-700 p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none font-normal leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-sm transition-all border border-slate-700/60 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Registro</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMedicalRecordPage;
