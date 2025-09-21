import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface RoomFormProps {
  cinemaId: Id<"cinemas">;
  room?: any;
  onClose: () => void;
}

export function RoomForm({ cinemaId, room, onClose }: RoomFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    screenType: "",
    soundSystem: "",
  });

  const createRoom = useMutation(api.rooms.create);
  const updateRoom = useMutation(api.rooms.update);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || "",
        capacity: room.capacity?.toString() || "",
        screenType: room.screenType || "",
        soundSystem: room.soundSystem || "",
      });
    }
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        cinemaId,
        name: formData.name,
        capacity: parseInt(formData.capacity),
        screenType: formData.screenType || undefined,
        soundSystem: formData.soundSystem || undefined,
        status: "active" as const,
      };

      if (room) {
        await updateRoom({ id: room._id, ...data });
      } else {
        await createRoom(data);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving room:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {room ? "Editar Sala" : "Nova Sala"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Sala *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Sala 1, Sala IMAX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Capacidade *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: 150"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Tela
            </label>
            <input
              type="text"
              value={formData.screenType}
              onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: 2D/3D, IMAX, 4DX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sistema de Som
            </label>
            <input
              type="text"
              value={formData.soundSystem}
              onChange={(e) => setFormData({ ...formData, soundSystem: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Dolby Atmos 7.1, Dolby Digital 5.1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {room ? "Atualizar" : "Criar"} Sala
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
