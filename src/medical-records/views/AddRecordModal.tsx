import React, { useState } from "react";
import { addMedicalRecord } from "wasp/client/operations";

interface AddRecordModalProps {
  petId: string;
  petName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  petId,
  petName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recordType, setRecordType] = useState<"VACCINE" | "DEWORMING" | "CONSULTATION" | "SURGERY">("VACCINE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateAdministered, setDateAdministered] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [nextDueDate, setNextDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("El título de la atención es requerido.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await addMedicalRecord({
        petId,
        recordType,
        title,
        description,
        dateAdministered: dateAdministered ? new Date(dateAdministered).toISOString() : undefined,
        nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : undefined,
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || "Error al guardar el registro médico.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xl font-bold transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            🩺
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Registrar Atención Médica</h2>
            <p className="text-sm text-slate-400">Paciente: <span className="text-emerald-400 font-semibold">{petName}</span></p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Tipo de Atención
            </label>
            <select
              value={recordType}
              onChange={(e: any) => setRecordType(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="VACCINE">Vacuna</option>
              <option value="DEWORMING">Desparasitación</option>
              <option value="CONSULTATION">Consulta General</option>
              <option value="SURGERY">Cirugía / Procedimiento Especial</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Título del Tratamiento / Atención
            </label>
            <input
              type="text"
              placeholder="Ej: Vacuna Quíntuple o Control Anual"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Fecha de Atención Realizada
            </label>
            <input
              type="date"
              value={dateAdministered}
              onChange={(e) => setDateAdministered(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
              📅 Próxima Fecha de Seguimiento / Control (Definida por la Veterinaria)
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-emerald-500/40 p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <p className="text-xs text-slate-400 mt-1">
              El sistema generará el recordatorio automático para el dueño en esta fecha.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Observaciones Clínicas
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre dosis, peso, diagnóstico o recomendaciones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Atención"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
