import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { EquipmentManager } from "./EquipmentManager";
import { MaintenanceHistoryManager } from "./MaintenanceHistoryManager";
import { PreventiveMaintenanceManager } from "./PreventiveMaintenanceManager";
import { RoomEditForm } from "./RoomEditForm";

interface RoomDetailProps {
  roomId: Id<"rooms">;
  onBack: () => void;
  isAdmin: boolean;
}

export function RoomDetail({ roomId, onBack, isAdmin }: RoomDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditForm, setShowEditForm] = useState(false);

  const room = useQuery(api.rooms.getWithAlerts, { id: roomId });
  const equipment = useQuery(api.equipment.listByRoom, { roomId }) || [];
  const updateLampHours = useMutation(api.rooms.updateLampHours);

  if (!room) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  const handleLampHoursUpdate = async (hours: number) => {
    await updateLampHours({ id: roomId, currentHours: hours });
  };

  const handleMaintenanceAdded = () => {
    // The room data will automatically refresh due to Convex reactivity
    // Switch to maintenance history tab to show the new record
    setActiveTab("history");
  };

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativa";
      case "maintenance": return "Manutenção";
      case "stopped": return "Parada";
      default: return status;
    }
  };

  // Calculate total capacity
  const totalCapacity = room.seating 
    ? room.seating.standard + room.seating.premium + room.seating.vip
    : room.capacity || 0;

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "preventive", label: "Preventivas", icon: "🔧" },
    { id: "equipment", label: "Equipamentos", icon: "⚙️" },
    { id: "history", label: "Histórico", icon: "📋" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ← Voltar
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {room.name || "Sala sem nome"}
              </h1>
              {room.alerts && room.alerts.length > 0 && (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              )}
            </div>
            {room.location && (
              <p className="text-gray-600 dark:text-gray-400">{room.location}</p>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowEditForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ✏️ Editar Sala
          </button>
        )}
      </div>

      {/* Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusBg(room.status)} ${getStatusColor(room.status)}`}>
                {getStatusLabel(room.status)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Capacidade</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {totalCapacity} lugares
          </div>
          {room.seating && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {room.seating.standard > 0 && `${room.seating.standard} Padrão`}
              {room.seating.premium > 0 && ` • ${room.seating.premium} Premium`}
              {room.seating.vip > 0 && ` • ${room.seating.vip} VIP`}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertas</h3>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {room.alerts?.length || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {room.alerts?.length ? 'Requer atenção' : 'Tudo OK'}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {room.alerts && room.alerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
            🚨 Alertas Ativos
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {room.alerts.map((alert, index) => (
              <div key={index} className="bg-white dark:bg-red-900/30 rounded-lg p-3">
                <div className={`font-medium ${alert.severity === 'critical' ? 'text-red-900 dark:text-red-100' : 'text-yellow-900 dark:text-yellow-100'}`}>
                  {alert.message}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Tipo: {alert.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informações da Sala
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{room.name}</span>
                </div>
                {room.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Localização:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{room.location}</span>
                  </div>
                )}
                {room.screenType && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo de Tela:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{room.screenType}</span>
                  </div>
                )}
                {room.soundSystem && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sistema de Som:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{room.soundSystem}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Projector Lamp Status */}
            {room.projectorLamp && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Status da Lâmpada
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Modelo:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{room.projectorLamp.model}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Vida Útil
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {room.projectorLamp.currentHours} / {room.projectorLamp.maxHours} horas
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          (room.projectorLamp.currentHours / room.projectorLamp.maxHours) >= 0.9
                            ? 'bg-red-500'
                            : (room.projectorLamp.currentHours / room.projectorLamp.maxHours) >= 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (room.projectorLamp.currentHours / room.projectorLamp.maxHours) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Atualizar Horas de Uso
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max={room.projectorLamp.maxHours}
                          defaultValue={room.projectorLamp.currentHours}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          onBlur={(e) => {
                            const hours = parseInt(e.target.value) || 0;
                            if (room.projectorLamp && hours !== room.projectorLamp.currentHours) {
                              handleLampHoursUpdate(hours);
                            }
                          }}
                        />
                        <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">horas</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "preventive" && (
          <PreventiveMaintenanceManager 
            room={room} 
            onMaintenanceAdded={handleMaintenanceAdded}
          />
        )}

        {activeTab === "equipment" && (
          <EquipmentManager roomId={roomId} cinemaId={room.cinemaId} isAdmin={isAdmin} />
        )}

        {activeTab === "history" && (
          <MaintenanceHistoryManager roomId={roomId} cinemaId={room.cinemaId} />
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <RoomEditForm
          room={room}
          onClose={() => setShowEditForm(false)}
          onSaved={() => {
            // Refresh will happen automatically due to Convex reactivity
          }}
        />
      )}
    </div>
  );
}
