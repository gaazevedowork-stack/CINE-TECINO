import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CinemaForm } from "./CinemaForm";
import { EventsManager } from "./EventsManager";

interface GeneralDashboardProps {
  onSelectCinema: (id: Id<"cinemas">) => void;
  isAdmin: boolean;
}

export function GeneralDashboard({ onSelectCinema, isAdmin }: GeneralDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "events">("overview");
  const [showCinemaForm, setShowCinemaForm] = useState(false);
  const [showStatusDetail, setShowStatusDetail] = useState<{
    type: "active" | "maintenance" | "stopped" | "priority" | null;
    data: any[];
  }>({ type: null, data: [] });
  
  const cinemas = useQuery(api.cinemas.list) || [];
  const allRooms = useQuery(api.rooms.list, {}) || [];
  const allTasks = useQuery(api.tasks.list, {}) || [];
  const allEvents = useQuery(api.events.list) || [];
  const criticalAlerts = useQuery(api.equipment.getCriticalAlerts, {}) || [];

  // Calculate statistics
  const totalRooms = allRooms.length;
  const activeRooms = allRooms.filter(room => room.status === "active").length;
  const maintenanceRooms = allRooms.filter(room => room.status === "maintenance").length;
  const stoppedRooms = allRooms.filter(room => room.status === "stopped").length;

  const pendingTasks = allTasks.filter(task => task.status !== "done").length;
  const highPriorityTasks = allTasks.filter(task => task.priority === "high" && task.status !== "done").length;

  // Get rooms with lamps needing replacement
  const lampsNeedingReplacement = allRooms.filter(room => 
    room.projectorLamp && 
    (room.projectorLamp.currentHours / room.projectorLamp.maxHours) >= 0.9
  );

  const upcomingEvents = allEvents.filter(event => 
    event.status === "scheduled" && 
    event.startTime > Date.now() && 
    event.startTime < Date.now() + (7 * 24 * 60 * 60 * 1000) // Next 7 days
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 dark:text-green-400";
      case "maintenance": return "text-yellow-600 dark:text-yellow-400";
      case "stopped": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 dark:bg-green-900";
      case "maintenance": return "bg-yellow-100 dark:bg-yellow-900";
      case "stopped": return "bg-red-100 dark:bg-red-900";
      default: return "bg-gray-100 dark:bg-gray-900";
    }
  };

  const handleStatusClick = (status: "active" | "maintenance" | "stopped" | "priority") => {
    let data: any[] = [];
    
    if (status === "priority") {
      data = lampsNeedingReplacement.map(room => {
        const cinema = cinemas.find(c => c._id === room.cinemaId);
        return {
          room,
          cinema,
          reason: `Lâmpada com ${Math.round((room.projectorLamp!.currentHours / room.projectorLamp!.maxHours) * 100)}% de uso`
        };
      });
    } else {
      data = allRooms
        .filter(room => room.status === status)
        .map(room => {
          const cinema = cinemas.find(c => c._id === room.cinemaId);
          return {
            room,
            cinema,
            reason: room.statusReason || "Sem motivo especificado"
          };
        });
    }
    
    setShowStatusDetail({ type: status, data });
  };

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "events", label: "Eventos", icon: "📅" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Geral
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão completa de todos os cinemas e operações
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Critical Alerts */}
          {criticalAlerts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-600 dark:text-red-400 text-xl">🚨</span>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Alertas Críticos ({criticalAlerts.length})
                </h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {criticalAlerts.slice(0, 4).map((equipment) => (
                  <div key={equipment._id} className="text-sm text-red-800 dark:text-red-200">
                    • {equipment.name} - {equipment.status === "maintenance" ? "Manutenção" : "Substituição"}
                  </div>
                ))}
              </div>
              {criticalAlerts.length > 4 && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  E mais {criticalAlerts.length - 4} alertas...
                </p>
              )}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cinemas</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{cinemas.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6v10h6V6H9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Salas Totais</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalRooms}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tarefas Pendentes</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingTasks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a2 2 0 01-2 2H8a2 2 0 01-2-2V9H5a1 1 0 110-2h3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eventos (7 dias)</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{upcomingEvents}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Room Status Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status das Salas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center cursor-pointer" onClick={() => handleStatusClick("active")}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${getStatusBg("active")} hover:opacity-80 transition-opacity`}>
                  <span className={`text-2xl font-bold ${getStatusColor("active")}`}>{activeRooms}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Ativas</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0}%
                </p>
              </div>

              <div className="text-center cursor-pointer" onClick={() => handleStatusClick("maintenance")}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${getStatusBg("maintenance")} hover:opacity-80 transition-opacity`}>
                  <span className={`text-2xl font-bold ${getStatusColor("maintenance")}`}>{maintenanceRooms}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Manutenção</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalRooms > 0 ? Math.round((maintenanceRooms / totalRooms) * 100) : 0}%
                </p>
              </div>

              <div className="text-center cursor-pointer" onClick={() => handleStatusClick("stopped")}>
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${getStatusBg("stopped")} hover:opacity-80 transition-opacity`}>
                  <span className={`text-2xl font-bold ${getStatusColor("stopped")}`}>{stoppedRooms}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Paradas</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalRooms > 0 ? Math.round((stoppedRooms / totalRooms) * 100) : 0}%
                </p>
              </div>

              <div className="text-center cursor-pointer" onClick={() => handleStatusClick("priority")}>
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 bg-red-100 dark:bg-red-900 hover:opacity-80 transition-opacity">
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{lampsNeedingReplacement.length}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Lâmpadas</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Precisam troca</p>
              </div>
            </div>
          </div>

          {/* Add Cinema Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowCinemaForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>+</span>
                Adicionar Cinema
              </button>
            </div>
          )}

          {/* Cinemas Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cinemas.map((cinema) => {
              const cinemaRooms = allRooms.filter(room => room.cinemaId === cinema._id);
              const cinemaTasks = allTasks.filter(task => task.cinemaId === cinema._id && task.status !== "done");
              const cinemaEvents = allEvents.filter(event => 
                event.cinemaId === cinema._id && 
                event.status === "scheduled" &&
                event.startTime > Date.now()
              );

              const activeCount = cinemaRooms.filter(r => r.status === "active").length;
              const availabilityPercent = cinemaRooms.length > 0 ? Math.round((activeCount / cinemaRooms.length) * 100) : 0;

              return (
                <div
                  key={cinema._id}
                  onClick={() => onSelectCinema(cinema._id)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cinema.name}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      availabilityPercent >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      availabilityPercent >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {availabilityPercent}% disponível
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-1">
                    <span>📍</span>
                    {cinema.location}
                  </p>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {cinemaRooms.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Salas</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                        {cinemaTasks.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Tarefas</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {cinemaEvents.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Eventos</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {cinemas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum cinema cadastrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comece adicionando o primeiro cinema ao sistema
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowCinemaForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Adicionar Primeiro Cinema
                </button>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "events" && (
        <EventsManager isAdmin={isAdmin} />
      )}

      {/* Status Detail Modal */}
      {showStatusDetail.type && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showStatusDetail.type === "active" && "Salas Ativas"}
                  {showStatusDetail.type === "maintenance" && "Salas em Manutenção"}
                  {showStatusDetail.type === "stopped" && "Salas Paradas"}
                  {showStatusDetail.type === "priority" && "Lâmpadas Precisando Troca"}
                </h3>
                <button
                  onClick={() => setShowStatusDetail({ type: null, data: [] })}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {showStatusDetail.data.map((item, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.room.name || `Sala ${index + 1}`}
                      </h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.cinema?.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Motivo:</strong> {item.reason}
                    </p>
                  </div>
                ))}
              </div>

              {showStatusDetail.data.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhum item encontrado nesta categoria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cinema Form Modal */}
      {showCinemaForm && (
        <CinemaForm onClose={() => setShowCinemaForm(false)} />
      )}
    </div>
  );
}
