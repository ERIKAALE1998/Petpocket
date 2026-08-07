import React, { useState, useMemo } from "react";
import { useQuery, searchNearbyBusinesses } from "wasp/client/operations";
import { 
  MapPin, 
  Phone, 
  Navigation, 
  Search, 
  Compass, 
  List, 
  Map as MapIcon, 
  Clock, 
  Info, 
  ExternalLink,
  SlidersHorizontal,
  Building2,
  PhoneCall,
  MessageCircle,
  AlertCircle
} from "lucide-react";

// Preset geographic references (Quito sectors) for rapid testing & search
const PRESET_LOCATIONS = [
  { label: "Quito Norte (La Carolina)", lat: -0.1807, lng: -78.4678 },
  { label: "Quito Centro (El Panecillo)", lat: -0.2299, lng: -78.5144 },
  { label: "Quito Sur (Recreo)", lat: -0.2520, lng: -78.5200 },
  { label: "Valle de Cumbayá", lat: -0.2000, lng: -78.4350 },
];

export const ClinicSearchPage: React.FC = () => {
  // Default coordinates: Quito, Ecuador
  const [lat, setLat] = useState<number>(-0.1807);
  const [lng, setLng] = useState<number>(-78.4678);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // View state: "list" | "map" | "dual"
  const [viewMode, setViewMode] = useState<"list" | "map" | "dual">("dual");
  
  // Keyword search filter within returned results
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Selected clinic modal detail
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);

  // Query nearby businesses
  const { data: clinics, isLoading, error, refetch } = useQuery(
    searchNearbyBusinesses,
    { latitude: lat, longitude: lng, radiusKm }
  );

  // Filter clinics locally by name or address
  const filteredClinics = useMemo(() => {
    if (!clinics) return [];
    if (!searchQuery.trim()) return clinics;
    const q = searchQuery.toLowerCase().trim();
    return clinics.filter(
      (c: any) =>
        c.name.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [clinics, searchQuery]);

  // Request browser GPS position
  const handleGetCurrentLocation = () => {
    setLocationError(null);
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(parseFloat(position.coords.latitude.toFixed(6)));
          setLng(parseFloat(position.coords.longitude.toFixed(6)));
          setIsLocating(false);
          refetch();
        },
        (err) => {
          setIsLocating(false);
          setLocationError(
            "No se pudo acceder a la ubicación GPS. Por favor revisa los permisos de tu navegador o selecciona una ubicación predeterminada."
          );
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError("Tu navegador no soporta geolocalización por GPS.");
    }
  };

  // Helper to open Google Maps direction link
  const getDirectionsUrl = (clinicLat: number, clinicLng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${clinicLat},${clinicLng}`;
  };

  // Helper for OpenStreetMap Embed URL centered at user location or selected clinic
  const getOsmEmbedUrl = () => {
    // Determine bbox based on radius
    const delta = radiusKm * 0.01;
    const minLng = (lng - delta).toFixed(4);
    const minLat = (lat - delta).toFixed(4);
    const maxLng = (lng + delta).toFixed(4);
    const maxLat = (lat + delta).toFixed(4);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 text-slate-100 font-sans">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800/90 to-emerald-950/40 border border-slate-700/60 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
          <span>Radar de Atención Veterinaria</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Veterinarias Cercanas
        </h1>
        <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Localiza clínicas y centros de salud animal ordenados por proximidad geográfica. Encuentra contactos directos, horarios y rutas de llegada rápida.
        </p>

        {/* Control Bar: Coordinates, Presets & GPS button */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> Latitud:
                </label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-32 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> Longitud:
                </label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-32 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-emerald-400" /> Radio máximo:
                </label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value={3}>3 Km</option>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? "animate-bounce" : ""}`} />
              <span>{isLocating ? "Obteniendo coordenadas..." : "Usar mi Ubicación GPS"}</span>
            </button>
          </div>

          {/* Location Presets */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Sectores sugeridos:</span>
            {PRESET_LOCATIONS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setLat(preset.lat);
                  setLng(preset.lng);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition-all border ${
                  lat === preset.lat && lng === preset.lng
                    ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold"
                    : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                📍 {preset.label}
              </button>
            ))}
          </div>

          {locationError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Toolbar: Search query input & View Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por nombre, dirección o especialidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/70 text-slate-100 text-xs sm:text-sm placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === "list"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lista</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === "map"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Mapa</span>
          </button>
          <button
            onClick={() => setViewMode("dual")}
            className={`hidden md:flex px-3 py-1.5 rounded-lg items-center gap-1.5 transition-all ${
              viewMode === "dual"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vista Combinada</span>
          </button>
        </div>
      </div>

      {/* Main Results Container */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400 text-sm font-medium">Buscando veterinarias en el radio seleccionado...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <h4 className="font-bold text-white mb-1">Error en el radar de geolocalización</h4>
            <p className="text-rose-200/90">{error.message}</p>
          </div>
        </div>
      ) : filteredClinics.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-3xl">
            🏥
          </div>
          <h3 className="text-xl font-bold text-white">No se encontraron veterinarias en esta zona</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Prueba ampliando el radio de búsqueda (ej. 20 Km o 50 Km) o seleccionando otro sector en los accesos rápidos.
          </p>
          <button
            onClick={() => setRadiusKm(50)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-semibold transition-all"
          >
            Ampliar radio a 50 Km
          </button>
        </div>
      ) : (
        <div className={`grid gap-6 ${viewMode === "dual" ? "lg:grid-cols-12" : "grid-cols-1"}`}>
          {/* List View Container */}
          {(viewMode === "list" || viewMode === "dual") && (
            <div className={viewMode === "dual" ? "lg:col-span-6 space-y-4" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Resultados encontrados ({filteredClinics.length})
                </span>
                <span className="text-xs text-emerald-400 font-semibold">Ordenados por cercanía</span>
              </div>

              {filteredClinics.map((clinic: any) => (
                <div
                  key={clinic.id}
                  onClick={() => setSelectedClinic(clinic)}
                  className={`group relative rounded-3xl bg-slate-900/80 border ${
                    selectedClinic?.id === clinic.id
                      ? "border-emerald-500 bg-slate-900 shadow-emerald-500/10"
                      : "border-slate-800 hover:border-emerald-500/50"
                  } p-5 sm:p-6 shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between space-y-4`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 text-2xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all flex-shrink-0">
                          🏥
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg group-hover:text-emerald-300 transition-colors">
                            {clinic.name}
                          </h3>
                          <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                            <MapPin className="w-3 h-3" />
                            <span>a {clinic.distanceKm} km de distancia</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs sm:text-sm mt-3 line-clamp-2 leading-relaxed">
                      {clinic.description || "Atención médica veterinaria profesional, vacunas, emergencias y controles clínicos."}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 truncate">{clinic.address}</span>
                      </div>
                      {clinic.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-slate-300 font-mono">{clinic.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    {clinic.phone ? (
                      <a
                        href={`tel:${clinic.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Llamar</span>
                      </a>
                    ) : <span></span>}

                    <a
                      href={getDirectionsUrl(clinic.latitude, clinic.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Cómo llegar</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map View Container */}
          {(viewMode === "map" || viewMode === "dual") && (
            <div className={viewMode === "dual" ? "lg:col-span-6 space-y-4" : "col-span-1 space-y-4"}>
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapIcon className="w-3.5 h-3.5 text-emerald-400" /> Vista Geográfica Interactiva
                </span>
                <span className="text-xs text-slate-400">Radio: {radiusKm} Km</span>
              </div>

              {/* Map Canvas / Embedded OpenStreetMap */}
              <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl h-[480px] sm:h-[580px] flex flex-col">
                <iframe
                  title="Mapa de Veterinarias Cercanas"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={getOsmEmbedUrl()}
                  className="w-full h-full filter contrast-105 opacity-90 hover:opacity-100 transition-opacity"
                ></iframe>

                {/* Map Overlay Badge */}
                <div className="absolute top-4 left-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg max-w-xs space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>Centro de búsqueda activo</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">
                    Lat: {lat}, Lng: {lng}
                  </p>
                </div>

                {/* Selected Clinic Map Drawer */}
                {selectedClinic && (
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/50 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl text-xl font-bold">
                        🏥
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{selectedClinic.name}</h4>
                        <p className="text-xs text-emerald-400 font-semibold">
                          📍 {selectedClinic.distanceKm} km — {selectedClinic.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getDirectionsUrl(selectedClinic.latitude, selectedClinic.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Ir con GPS</span>
                      </a>
                      <button
                        onClick={() => setSelectedClinic(null)}
                        className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Clinic Modal Detail */}
      {selectedClinic && viewMode !== "dual" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-6 text-slate-100">
            <button
              onClick={() => setSelectedClinic(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              ✕
            </button>

            <div className="flex items-start space-x-4">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 text-3xl">
                🏥
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedClinic.name}</h3>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <MapPin className="w-3 h-3" />
                  <span>a {selectedClinic.distanceKm} km de tu ubicación</span>
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              {selectedClinic.description || "Atención veterinaria integral, vacunación, cirugías y control clínico de mascotas."}
            </p>

            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-semibold">Dirección:</span>
                  <span>{selectedClinic.address}</span>
                </div>
              </div>

              {selectedClinic.phone && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block font-semibold">Teléfono de contacto:</span>
                    <span className="font-mono text-emerald-300">{selectedClinic.phone}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedClinic(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cerrar
              </button>
              <a
                href={getDirectionsUrl(selectedClinic.latitude, selectedClinic.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Navigation className="w-4 h-4" />
                <span>Navegar con Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
