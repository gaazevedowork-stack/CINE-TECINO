import { useState } from "react";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { GeneralDashboard } from "./components/GeneralDashboard";
import { CinemaDetail } from "./components/CinemaDetail";
import { Settings } from "./components/Settings";

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedCinemaId, setSelectedCinemaId] = useState<Id<"cinemas"> | null>(null);
  
  const user = useQuery(api.auth.loggedInUser);
  const isAdmin = user?.email === "admin@cinema.com" || user?.name === "admin";

  const handleCinemaSelect = (cinemaId: Id<"cinemas">) => {
    setSelectedCinemaId(cinemaId);
    setActiveView("cinema");
  };

  const handleBackToDashboard = () => {
    setSelectedCinemaId(null);
    setActiveView("dashboard");
  };

  const renderContent = () => {
    if (activeView === "cinema" && selectedCinemaId) {
      return (
        <CinemaDetail
          cinemaId={selectedCinemaId}
          onBack={handleBackToDashboard}
          isAdmin={isAdmin}
        />
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <GeneralDashboard
            onSelectCinema={handleCinemaSelect}
            isAdmin={isAdmin}
          />
        );
      case "settings":
        return <Settings isAdmin={isAdmin} />;
      default:
        return (
          <GeneralDashboard
            onSelectCinema={handleCinemaSelect}
            isAdmin={isAdmin}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isAdmin={isAdmin}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {user ? `Bem-vindo, ${user.name || user.email}` : "Carregando..."}
            </div>
          </Header>
          
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
