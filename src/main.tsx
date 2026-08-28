import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useParams } from "react-router";
import { App } from "./client/App";
import { LandingPage } from "./landing-page/LandingPage";
import { PetListPage } from "./pets/views/PetListPage";
import { MedicalPassportPage } from "./medical-records/views/MedicalPassportPage";
import { ReminderListPage } from "./reminders/views/ReminderListPage";
import "./client/Main.css";

const MedicalPassportRouteWrapper: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  return <MedicalPassportPage petId={petId} />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
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
