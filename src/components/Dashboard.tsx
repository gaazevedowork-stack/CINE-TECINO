import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface DashboardProps {
  onSelectCinema: (id: Id<"cinemas">) => void;
}

export function Dashboard({ onSelectCinema }: DashboardProps) {
  const cinemas = useQuery(api.cinemas.list) || [];
  const allRooms = useQuery(api.rooms.list, {}) || [];
  const criticalAlerts = useQuery(api.equipment.getCriticalAlerts, {}) || [];

  const totalRooms = allRooms.length;
  const activeRooms = allRooms.filter(room => room.status === "active").length;
  const averageAvailability = totalRooms > 0 
    ? Math.round((activeRooms / totalRooms) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Visão geral do sistema</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Cinemas</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{cinemas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Salas</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalRooms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertas Críticos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{criticalAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponibilidade</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{averageAvailability}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
            🚨 Alertas Críticos
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {criticalAlerts.slice(0, 6).map((equipment) => (
              <div key={equipment._id} className="bg-white dark:bg-red-900/30 rounded-lg p-3">
                <div className="font-medium text-red-900 dark:text-red-100">
                  {equipment.name}
                </div>
                <div className="text-sm text-red-700 dark:text-red-200">
                  Status: {equipment.status === "maintenance" ? "Manutenção" : "Substituição"}
                </div>
              </div>
            ))}
          </div>
          {criticalAlerts.length > 6 && (
            <p className="text-sm text-red-700 dark:text-red-300 mt-3">
              E mais {criticalAlerts.length - 6} alertas...
            </p>
          )}
        </div>
      )}

      {/* Cinemas Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cinemas.map((cinema) => {
          const cinemaRooms = allRooms.filter(room => room.cinemaId === cinema._id);
          const activeCount = cinemaRooms.filter(r => r.status === "active").length;
          const availability = cinemaRooms.length > 0 ? Math.round((activeCount / cinemaRooms.length) * 100) : 0;

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
                  availability >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  availability >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {availability}% disponível
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                📍 {cinema.location}
              </p>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {cinemaRooms.length} salas
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {activeCount} ativas
                </span>
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
          <p className="text-gray-600 dark:text-gray-400">
            Comece adicionando o primeiro cinema ao sistema
          </p>
        </div>
      )}
    </div>
  );
}
