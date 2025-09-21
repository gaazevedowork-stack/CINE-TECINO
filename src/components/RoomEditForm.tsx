import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface RoomEditFormProps {
  room: any;
  onClose: () => void;
  onSaved: () => void;
}

export function RoomEditForm({ room, onClose, onSaved }: RoomEditFormProps) {
  const [formData, setFormData] = useState({
    name: room.name || "",
    location: room.location || "",
    status: room.status || "active",
    screenType: room.screenType || "",
    soundSystem: room.soundSystem || "",
    seating: {
      standard: room.seating?.standard || 0,
      premium: room.seating?.premium || 0,
      vip: room.seating?.vip || 0,
    },
    projectorLamp: {
      model: room.projectorLamp?.model || "",
      currentHours: room.projectorLamp?.currentHours || 0,
      maxHours: room.projectorLamp?.maxHours || 2000,
      lastReplacementDate: room.projectorLamp?.lastReplacementDate 
        ? new Date(room.projectorLamp.lastReplacementDate).toISOString().split('T')[0]
        : "",
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const updateRoom = useMutation(api.rooms.update);

  const totalCapacity = formData.seating.standard + formData.seating.premium + formData.seating.vip;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updateData: any = {
        id: room._id,
        name: formData.name,
        location: formData.location || undefined,
        status: formData.status as any,
        screenType: formData.screenType || undefined,
        soundSystem: formData.soundSystem || undefined,
        seating: formData.seating,
      };

      if (formData.projectorLamp.model) {
        updateData.projectorLamp = {
          model: formData.projectorLamp.model,
          currentHours: formData.projectorLamp.currentHours,
          maxHours: formData.projectorLamp.maxHours,
          lastReplacementDate: formData.projectorLamp.lastReplacementDate 
            ? new Date(formData.projectorLamp.lastReplacementDate).getTime()
            : Date.now(),
        };
      }

      await updateRoom(updateData);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSaved();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeatingChange = (type: 'standard' | 'premium' | 'vip', value: number) => {
    setFormData({
      ...formData,
      seating: {
        ...formData.seating,
        [type]: Math.max(0, value),
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar Sala: {room.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Sala *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Localização
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Piso 2, Ala Norte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Ativa</option>
                <option value="maintenance">Manutenção</option>
                <option value="stopped">Parada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Tela
              </label>
              <input
                type="text"
                value={formData.screenType}
                onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: IMAX, 4DX, Padrão"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sistema de Som
              </label>
              <input
                type="text"
                value={formData.soundSystem}
                onChange={(e) => setFormData({ ...formData, soundSystem: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Dolby Atmos, DTS:X, 7.1"
              />
            </div>
          </div>

          {/* Seating Configuration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Configuração de Assentos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assentos Padrão
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.seating.standard}
                  onChange={(e) => handleSeatingChange('standard', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assentos Premium
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.seating.premium}
                  onChange={(e) => handleSeatingChange('premium', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assentos VIP
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.seating.vip}
                  onChange={(e) => handleSeatingChange('vip', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Capacidade Total:
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalCapacity} assentos
                </span>
              </div>
            </div>
          </div>

          {/* Projector Lamp Configuration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Lâmpada do Projetor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo da Lâmpada
                </label>
                <input
                  type="text"
                  value={formData.projectorLamp.model}
                  onChange={(e) => setFormData({
                    ...formData,
                    projectorLamp: { ...formData.projectorLamp, model: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: UHP 330W"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horas Atuais
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.projectorLamp.currentHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    projectorLamp: { ...formData.projectorLamp, currentHours: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horas Máximas
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.projectorLamp.maxHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    projectorLamp: { ...formData.projectorLamp, maxHours: parseInt(e.target.value) || 2000 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Última Troca
                </label>
                <input
                  type="date"
                  value={formData.projectorLamp.lastReplacementDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    projectorLamp: { ...formData.projectorLamp, lastReplacementDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {formData.projectorLamp.model && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Vida Útil da Lâmpada
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.projectorLamp.currentHours} / {formData.projectorLamp.maxHours} horas
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      (formData.projectorLamp.currentHours / formData.projectorLamp.maxHours) >= 0.9
                        ? 'bg-red-500'
                        : (formData.projectorLamp.currentHours / formData.projectorLamp.maxHours) >= 0.8
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (formData.projectorLamp.currentHours / formData.projectorLamp.maxHours) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-medium transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || !formData.name}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Alterações salvas com sucesso!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    As informações da sala foram atualizadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
