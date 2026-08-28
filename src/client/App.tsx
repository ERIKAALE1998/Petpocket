import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router";
import { Toaster } from "../client/components/ui/toaster";
import "./Main.css";
import { NavBar } from "./components/NavBar/NavBar";
import { petPocketNavigationItems } from "./components/NavBar/constants";

export function App() {
  const location = useLocation();

  const shouldDisplayAppNavBar = useMemo(() => {
    return (
      location.pathname !== "/login" &&
      location.pathname !== "/signup"
    );
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith("/admin");
  }, [location]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  return (
    <>
      <div className="bg-background text-foreground min-h-screen">
        {isAdminDashboard ? (
          <Outlet />
        ) : (
          <>
            {shouldDisplayAppNavBar && (
              <NavBar navigationItems={petPocketNavigationItems} />
            )}
            <div className="max-w-(--breakpoint-2xl) mx-auto">
              <Outlet />
            </div>
          </>
        )}
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}