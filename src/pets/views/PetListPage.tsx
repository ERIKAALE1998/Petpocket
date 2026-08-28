import React, { useState } from "react";
import { useQuery, getPets, createPet } from "wasp/client/operations";
import { Link, routes } from "wasp/client/router";

interface PetItem {
  id: string;
  name: string;
  species: "DOG" | "CAT" | "OTHER" | string;
  breed?: string | null;
  gender: "MALE" | "FEMALE" | string;
}

export const PetListPage: React.FC = () => {
  const { data: pets, isLoading, refetch } = useQuery(getPets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"DOG" | "CAT" | "OTHER">("DOG");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [birthDate, setBirthDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createPet({
        name,
        species,
        breed,
        gender,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
      });
      setIsSubmitting(false);
      setIsModalOpen(false);
      setName("");
      setBreed("");
      refetch();
    } catch {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            🐾 Mis Mascotas
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Perfiles de Mascotas</h1>
          <p className="text-slate-400 text-sm mt-1">
            Administra tus mascotas y accede a su historial médico digital portable.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <span>➕ Registrar Mascota</span>
        </button>
      </div>

      {pets && pets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 space-y-3">
          <span className="text-4xl">🐶</span>
          <h3 className="text-lg font-bold text-white">No tienes mascotas registradas</h3>
          <p className="text-slate-400 text-sm">Agrega a tu perro o gato para comenzar a llevar su historial médico digital.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets?.map((pet: PetItem) => (
            <div
              key={pet.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 text-2xl">
                  {pet.species === "DOG" ? "🐶" : pet.species === "CAT" ? "🐱" : "🐾"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{pet.name}</h3>
                  <p className="text-xs text-slate-400">{pet.breed || pet.species} • {pet.gender === "MALE" ? "Macho" : "Hembra"}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <Link
                  to={routes.PetHistoryRoute.to}
                  params={{ petId: pet.id }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <span>📋 Ver Carnet Médico Digital</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding pet */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 relative">
            <h2 className="text-xl font-bold text-white mb-4">Registrar Nueva Mascota</h2>
            <form onSubmit={handleCreatePet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Firulais"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Especie</label>
                <select
                  value={species}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSpecies(e.target.value as "DOG" | "CAT" | "OTHER")}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100"
                >
                  <option value="DOG">Perro</option>
                  <option value="CAT">Gato</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Raza (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Golden Retriever"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Género</label>
                <select
                  value={gender}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGender(e.target.value as "MALE" | "FEMALE")}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-slate-100"
                >
                  <option value="MALE">Macho</option>
                  <option value="FEMALE">Hembra</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400"
                >
                  Guardar Mascota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
