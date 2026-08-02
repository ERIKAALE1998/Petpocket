import React, { useState } from "react";
import { useQuery, searchNearbyBusinesses } from "wasp/client/operations";

export const ClinicSearchPage: React.FC = () => {
  // Default coordinates (Quito, Ecuador as example reference)
  const [lat, setLat] = useState(-0.1807);
  const [lng, setLng] = useState(-78.4678);
  const [radiusKm, setRadiusKm] = useState(10);
  const [isLocating, setIsLocating] = useState(false);

  const { data: clinics, isLoading, error, refetch } = useQuery(
    searchNearbyBusinesses,
    { latitude: lat, longitude: lng, radiusKm }
  );

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setIsLocating(false);
          refetch();
        },
        (err) => {
          setIsLocating(false);
          alert("No se pudo obtener la ubicación GPS actual.");
        }
      );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-slate-100">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          📍 Búsqueda por Geolocalización
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Veterinarias Cercanas</h1>
        <p className="text-slate-400 text-sm mt-1">
          Encuentra centros veterinarios por cercanía geográfica directa en tu sector.
        </p>

        {/* Location Search Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Latitud:</span>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-28 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs"
              />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Longitud:</span>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-28 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs"
              />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Radio (Km):</span>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-slate-100 text-xs"
              >
                <option value={5}>5 Km</option>
                <option value={10}>10 Km</option>
                <option value={20}>20 Km</option>
                <option value={50}>50 Km</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <span>{isLocating ? "Obteniendo GPS..." : "🎯 Usar mi Ubicación GPS"}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          Error al buscar veterinarias cercanas: {error.message}
        </div>
      ) : clinics && clinics.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 space-y-3">
          <span className="text-4xl">🏥</span>
          <h3 className="text-lg font-bold text-white">No se encontraron veterinarias cercanas</h3>
          <p className="text-slate-400 text-sm">Prueba ampliando el radio de búsqueda o cambiando de coordenadas.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {clinics?.map((clinic: any) => (
            <div
              key={clinic.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-6 shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-xl">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{clinic.name}</h3>
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                        📍 a {clinic.distanceKm} km de distancia
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                  {clinic.description || "Atención médica veterinaria profesional, vacunas y controles clínicos."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                  <div>🏢 <span className="text-slate-300">{clinic.address}</span></div>
                  <div>📞 Teléfono: <span className="text-slate-300 font-medium">{clinic.phone}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
