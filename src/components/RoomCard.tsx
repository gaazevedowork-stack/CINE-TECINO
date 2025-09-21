import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Room {
  _id: Id<"rooms">;
  name?: string;
  status: "active" | "maintenance" | "stopped";
  statusReason?: string;
  seating?: {
    standard: number;
    premium: number;
    vip: number;
  };
  projectorLamp?: {
    model: string;
    currentHours: number;
    maxHours: number;
    lastReplacementDate: number;
  };
  preventiveMaintenance?: {
    lastPreventiveA?: number;
    lastPreventiveB?: number;
    lastPreventiveC?: number;
    nextPreventiveA?: number;
    nextPreventiveB?: number;
    nextPreventiveC?: number;
  };
}

interface RoomCardProps {
  room: Room;
  onEdit: () => void;
  onDetail: () => void;
  isAdmin: boolean;
}

export function RoomCard({ room, onEdit, onDetail, isAdmin }: RoomCardProps) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<"active" | "maintenance" | "stopped">("active");
  const [statusReason, setStatusReason] = useState("");
  
  const updateRoomStatus = useMutation(api.rooms.updateStatus);

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

  const handleStatusChange = (status: "active" | "maintenance" | "stopped") => {
    if (status === "maintenance" || status === "stopped") {
      setNewStatus(status);
      setStatusReason("");
      setShowStatusModal(true);
    } else {
      // For active status, no reason needed
      updateRoomStatus({
        id: room._id,
        status,
        statusReason: undefined,
      });
    }
  };

  const handleStatusSubmit = async () => {
    if ((newStatus === "maintenance" || newStatus === "stopped") && !statusReason.trim()) {
      alert("Por favor, informe o motivo para alterar o status.");
      return;
    }

    try {
      await updateRoomStatus({
        id: room._id,
        status: newStatus,
        statusReason: statusReason.trim() || undefined,
      });
      setShowStatusModal(false);
      setStatusReason("");
    } catch (error) {
      console.error("Error updating room status:", error);
      alert("Erro ao atualizar status da sala. Tente novamente.");
    }
  };

  const totalCapacity = room.seating 
    ? room.seating.standard + room.seating.premium + room.seating.vip 
    : 0;

  const lampUsagePercent = room.projectorLamp 
    ? Math.round((room.projectorLamp.currentHours / room.projectorLamp.maxHours) * 100)
    : 0;

  const isLampCritical = lampUsagePercent >= 90;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {room.name || "Sala sem nome"}
          </h3>
          <div className="flex items-center gap-2">
            {isLampCritical && (
              <span className="text-red-500 text-sm" title="Lâmpada precisa ser trocada">
                🚨
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(room.status)} ${getStatusColor(room.status)}`}>
              {getStatusLabel(room.status)}
            </span>
          </div>
        </div>

        {room.statusReason && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Motivo:</strong> {room.statusReason}
            </p>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {totalCapacity > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Capacidade:</span>
              <span className="font-medium text-gray-900 dark:text-white">{totalCapacity} lugares</span>
            </div>
          )}

          {room.projectorLamp && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Lâmpada:</span>
              <span className={`font-medium ${isLampCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {lampUsagePercent}% usado
              </span>
            </div>
          )}

          {room.preventiveMaintenance?.nextPreventiveA && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Próxima Preventiva A:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(room.preventiveMaintenance.nextPreventiveA).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDetail}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          >
            Ver Detalhes
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={onEdit}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                ✏️
              </button>
              
              <div className="relative">
                <select
                  value={room.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Ativa</option>
                  <option value="maintenance">Manutenção</option>
                  <option value="stopped">Parada</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Alterar Status da Sala
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Alterando status para: <strong>{getStatusLabel(newStatus)}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motivo da alteração:
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Descreva o motivo para a alteração de status..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStatusSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusReason("");
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
