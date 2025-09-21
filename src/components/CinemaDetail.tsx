import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { RoomCard } from "./RoomCard";
import { RoomForm } from "./RoomForm";
import { RoomDetail } from "./RoomDetail";
import { KanbanBoard } from "./KanbanBoard";
import { Calendar } from "./Calendar";
import { TechnicalReport } from "./TechnicalReport";
import { InventoryManager } from "./InventoryManager";

interface CinemaDetailProps {
  cinemaId: Id<"cinemas">;
  onBack: () => void;
  isAdmin: boolean;
}

export function CinemaDetail({ cinemaId, onBack, isAdmin }: CinemaDetailProps) {
  const [activeTab, setActiveTab] = useState("rooms");
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<Id<"rooms"> | null>(null);

  const cinema = useQuery(api.cinemas.get, { id: cinemaId });
  const rooms = useQuery(api.rooms.listByCinema, { cinemaId }) || [];
  const deleteRoom = useMutation(api.rooms.remove);
  const updateCinemaStats = useMutation(api.cinemas.updateStats);

  if (!cinema) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  // If a room is selected, show room detail
  if (selectedRoomId) {
    return (
      <RoomDetail
        roomId={selectedRoomId}
        onBack={() => setSelectedRoomId(null)}
        isAdmin={isAdmin}
      />
    );
  }

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (roomId: Id<"rooms">) => {
    if (confirm("Tem certeza que deseja excluir esta sala? Todos os dados relacionados serão perdidos.")) {
      await deleteRoom({ id: roomId });
      await updateCinemaStats({ id: cinemaId });
    }
  };

  const handleCloseRoomForm = () => {
    setShowRoomForm(false);
    setEditingRoom(null);
    updateCinemaStats({ id: cinemaId });
  };

  const handleRoomClick = (roomId: Id<"rooms">) => {
    setSelectedRoomId(roomId);
  };

  const tabs = [
    { id: "rooms", label: "Salas", icon: "🏢" },
    { id: "inventory", label: "Inventário", icon: "📦" },
    { id: "tasks", label: "Tarefas", icon: "📋" },
    { id: "calendar", label: "Calendário", icon: "📅" },
    { id: "reports", label: "Relatórios", icon: "📊" },
  ];

  const getStatusCounts = () => {
    const active = rooms.filter(room => room.status === "active").length;
    const maintenance = rooms.filter(room => room.status === "maintenance").length;
    const stopped = rooms.filter(room => room.status === "stopped").length;
    return { active, maintenance, stopped };
  };

  const statusCounts = getStatusCounts();

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {cinema.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{cinema.location}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">🏢</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {rooms.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Salas</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.active}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Salas Ativas</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 dark:text-yellow-400">🔧</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.maintenance}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Em Manutenção</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400">⏹️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.stopped}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Paradas</div>
            </div>
          </div>
        </div>
      </div>

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
        {activeTab === "rooms" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Salas do Cinema
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowRoomForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + Nova Sala
                </button>
              )}
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhuma sala cadastrada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Comece adicionando a primeira sala deste cinema.
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowRoomForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Adicionar Primeira Sala
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    onEdit={() => handleEditRoom(room)}
                    onDetail={() => handleRoomClick(room._id)}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "inventory" && (
          <InventoryManager cinemaId={cinemaId} isAdmin={isAdmin} />
        )}

        {activeTab === "tasks" && (
          <KanbanBoard cinemaId={cinemaId} isAdmin={isAdmin} />
        )}

        {activeTab === "calendar" && (
          <Calendar cinemaId={cinemaId} isAdmin={isAdmin} />
        )}

        {activeTab === "reports" && (
          <TechnicalReport cinemaId={cinemaId} />
        )}
      </div>

      {/* Room Form Modal */}
      {showRoomForm && (
        <RoomForm
          cinemaId={cinemaId}
          room={editingRoom}
          onClose={handleCloseRoomForm}
        />
      )}
    </div>
  );
}
