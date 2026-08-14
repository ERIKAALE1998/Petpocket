import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router";
import { App } from "./client/App";
import { LandingPage } from "./landing-page/LandingPage";
import { PetListPage } from "./pets/views/PetListPage";
import { MedicalPassportPage } from "./medical-records/views/MedicalPassportPage";
import { ReminderListPage } from "./reminders/views/ReminderListPage";
import { mockStore } from "./wasp-mock/store";
import "./client/Main.css";

const RoleSwitcherBar: React.FC = () => {
  const [role, setRole] = useState(mockStore.getUser().role);

  const toggleRole = (newRole: "VET_BUSINESS" | "PET_OWNER") => {
    mockStore.setUserRole(newRole);
    setRole(newRole);
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-200 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold text-emerald-400"> PetPocket</span>
        <span className="text-slate-400">Usuario actual:</span>
        <span className="font-semibold text-white">{mockStore.getUser().fullName}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-400">Simular Rol:</span>
        <button
          onClick={() => toggleRole("VET_BUSINESS")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${role === "VET_BUSINESS"
            ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
            : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
        >
          🏥 Veterinaria (VET_BUSINESS)
        </button>
        <button
          onClick={() => toggleRole("PET_OWNER")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${role === "PET_OWNER"
            ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
            : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
        >
          🐶 Dueño de Mascota (PET_OWNER)
        </button>
        <Link to="/pets" className="ml-2 text-emerald-400 underline hover:text-emerald-300 font-semibold">
          Ir a Dashboard Mascotas (/pets)
        </Link>
      </div>
    </div>
  );
};

const MedicalPassportRouteWrapper: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  return <MedicalPassportPage petId={petId} />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoleSwitcherBar />
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<LandingPage />} />
          <Route path="pets" element={<PetListPage />} />
          <Route path="pets/:petId/medical-history" element={<MedicalPassportRouteWrapper />} />
          <Route path="reminders" element={<ReminderListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
