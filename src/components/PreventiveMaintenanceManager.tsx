import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PreventiveMaintenanceManagerProps {
  room: any;
  onMaintenanceAdded: () => void;
}

export function PreventiveMaintenanceManager({ room, onMaintenanceAdded }: PreventiveMaintenanceManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<"preventive_a" | "preventive_b" | "preventive_c">("preventive_a");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    technician: "",
    cost: "",
    notes: "",
  });

  const updateRoom = useMutation(api.rooms.update);
  const createMaintenance = useMutation(api.maintenanceHistory.create);

  const getNextMaintenanceDate = (type: string, lastDate: number) => {
    const intervals = {
      preventive_a: 30 * 24 * 60 * 60 * 1000, // 30 days
      preventive_b: 90 * 24 * 60 * 60 * 1000, // 90 days
      preventive_c: 365 * 24 * 60 * 60 * 1000, // 365 days
    };
    return lastDate + intervals[type as keyof typeof intervals];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const maintenanceDate = new Date(formData.date).getTime();
      
      // Create maintenance history record
      await createMaintenance({
        roomId: room._id,
        cinemaId: room.cinemaId,
        date: maintenanceDate,
        type: selectedType,
        description: formData.description || `Manutenção ${selectedType.replace('preventive_', '').toUpperCase()} realizada`,
        technician: formData.technician || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
      });

      // Update room's preventive maintenance dates
      const preventiveMaintenance = room.preventiveMaintenance || {};
      const updates: any = {};

      if (selectedType === "preventive_a") {
        preventiveMaintenance.lastPreventiveA = maintenanceDate;
        preventiveMaintenance.nextPreventiveA = getNextMaintenanceDate("preventive_a", maintenanceDate);
      } else if (selectedType === "preventive_b") {
        preventiveMaintenance.lastPreventiveB = maintenanceDate;
        preventiveMaintenance.nextPreventiveB = getNextMaintenanceDate("preventive_b", maintenanceDate);
      } else if (selectedType === "preventive_c") {
        preventiveMaintenance.lastPreventiveC = maintenanceDate;
        preventiveMaintenance.nextPreventiveC = getNextMaintenanceDate("preventive_c", maintenanceDate);
      }

      updates.preventiveMaintenance = preventiveMaintenance;

      await updateRoom({
        id: room._id,
        ...updates,
      });

      // Reset form and close
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        technician: "",
        cost: "",
        notes: "",
      });
      setShowForm(false);
      onMaintenanceAdded();
    } catch (error) {
      console.error("Error updating preventive maintenance:", error);
      alert("Erro ao atualizar manutenção preventiva. Tente novamente.");
    }
  };

  const getMaintenanceInfo = (type: string) => {
    const info = {
      preventive_a: { label: "Preventiva A", interval: "30 dias", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      preventive_b: { label: "Preventiva B", interval: "90 dias", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      preventive_c: { label: "Preventiva C", interval: "365 dias", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    };
    return info[type as keyof typeof info];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const isOverdue = (nextDate: number) => {
    return Date.now() > nextDate;
  };

  const getDaysUntil = (nextDate: number) => {
    const days = Math.ceil((nextDate - Date.now()) / (24 * 60 * 60 * 1000));
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Manutenções Preventivas
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Registrar Preventiva
        </button>
      </div>

      {/* Preventive Maintenance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["preventive_a", "preventive_b", "preventive_c"].map((type) => {
          const info = getMaintenanceInfo(type);
          const lastDate = room.preventiveMaintenance?.[`last${type.charAt(0).toUpperCase() + type.slice(1).replace('_', '')}`];
          const nextDate = room.preventiveMaintenance?.[`next${type.charAt(0).toUpperCase() + type.slice(1).replace('_', '')}`];
          const overdue = nextDate && isOverdue(nextDate);
          const daysUntil = nextDate ? getDaysUntil(nextDate) : null;

          return (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
                  {info.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {info.interval}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Última:</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {lastDate ? formatDate(lastDate) : "Nunca realizada"}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Próxima:</span>
                  <div className={`text-sm font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {nextDate ? (
                      <>
                        {formatDate(nextDate)}
                        {overdue ? (
                          <span className="block text-xs text-red-600 dark:text-red-400">
                            Vencida há {Math.abs(daysUntil!)} dias
                          </span>
                        ) : (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Em {daysUntil} dias
                          </span>
                        )}
                      </>
                    ) : "Não agendada"}
                  </div>
                </div>
              </div>

              {overdue && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                  <span className="text-xs text-red-800 dark:text-red-200">
                    ⚠️ Manutenção vencida
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Register Preventive Maintenance Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Registrar Manutenção Preventiva
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Manutenção
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="preventive_a">Preventiva A (30 dias)</option>
                    <option value="preventive_b">Preventiva B (90 dias)</option>
                    <option value="preventive_c">Preventiva C (365 dias)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data da Manutenção
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Descreva os trabalhos realizados..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Técnico
                    </label>
                    <input
                      type="text"
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custo (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Registrar Manutenção
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
