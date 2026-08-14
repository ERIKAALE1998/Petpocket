import React, { useState } from "react";
import { useParams } from "react-router";
import { useQuery, getPetMedicalHistory } from "wasp/client/operations";
import { useAuth } from "wasp/client/auth";
import { AddRecordModal } from "./AddRecordModal.js";

interface MedicalPassportPageProps {
  petId?: string;
  userRole?: string;
}

interface BusinessInfo {
  id: string;
  name: string;
}

interface MedicalRecordItem {
  id: string;
  recordType: string;
  title: string;
  description?: string | null;
  dateAdministered: string | Date;
  nextDueDate?: string | Date | null;
  business?: BusinessInfo | null;
}

export const MedicalPassportPage: React.FC<MedicalPassportPageProps> = ({ petId: propPetId, userRole: propUserRole }) => {
  const { petId: urlPetId } = useParams<{ petId: string }>();
  const petId = propPetId || urlPetId || "";

  const { data: user } = useAuth();
  const effectiveUserRole = propUserRole || user?.role || "PET_OWNER";
  const isVet = effectiveUserRole === "VET_BUSINESS" || effectiveUserRole === "ADMIN" || !!user?.isAdmin;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: history, isLoading, error, refetch } = useQuery(
    getPetMedicalHistory,
    { petId },
    { enabled: !!petId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !history) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
        <h3 className="font-semibold text-lg">Error al cargar historial</h3>
        <p className="text-sm mt-1">{error?.message || "No se pudo obtener la información médica de la mascota."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              🐾 Carnet Médico Digital
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{history.petName}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Especie: <span className="text-slate-200 font-medium">{history.species}</span> • Raza: <span className="text-slate-200 font-medium">{history.breed || "No especificada"}</span> • Dueño: <span className="text-slate-200 font-medium">{history.ownerName}</span>
            </p>
          </div>

          {isVet && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <span>➕ Registrar Atención</span>
            </button>
          )}
        </div>
      </div>

      {/* Read-Only Notice for Pet Owners */}
      {!isVet && (
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-3 text-slate-300 text-sm">
          <span className="text-xl">ℹ️</span>
          <div>
            <span className="font-semibold text-white">Modo Consulta (Lectura):</span> Este historial es administrado y actualizado directamente por la veterinaria al momento de atender a {history.petName}. Aquí puedes revisar todas las atenciones y las próximas fechas de control programadas.
          </div>
        </div>
      )}

      {/* Timeline Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📋</span> Historial Clínico y Próximos Controles
        </h2>

        {history.records.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800">
            <p className="text-slate-400 text-base">No hay atenciones médicas registradas para {history.petName} todavía.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 pl-6 pt-2">
            {history.records.map((record: MedicalRecordItem) => {
              const isVaccine = record.recordType === "VACCINE";
              const isDeworming = record.recordType === "DEWORMING";

              return (
                <div key={record.id} className="relative group">
                  {/* Timeline bullet icon */}
                  <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-xs">
                    {isVaccine ? "💉" : isDeworming ? "💊" : "🩺"}
                  </div>

                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 shadow-lg transition-all duration-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {record.recordType}
                        </span>
                        <h3 className="text-lg font-bold text-white">{record.title}</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Fecha: {new Date(record.dateAdministered).toLocaleDateString()}
                      </span>
                    </div>

                    {record.description && (
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {record.description}
                      </p>
                    )}

                    {/* Next Control Date Highlight */}
                    {record.nextDueDate && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-emerald-300">
                          <span>🔔</span>
                          <span className="font-medium">Próximo seguimiento / control:</span>
                        </div>
                        <span className="font-bold text-emerald-400">
                          {new Date(record.nextDueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {record.business && (
                      <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex items-center gap-1">
                        <span>🏥 Atendido en:</span>
                        <span className="text-slate-300 font-semibold">{record.business.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Record Modal for Vets */}
      {isVet && (
        <AddRecordModal
          petId={petId}
          petName={history.petName}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};
