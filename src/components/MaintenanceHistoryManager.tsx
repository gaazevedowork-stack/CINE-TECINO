import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface MaintenanceHistoryManagerProps {
  roomId: Id<"rooms">;
  cinemaId: Id<"cinemas">;
}

export function MaintenanceHistoryManager({ roomId, cinemaId }: MaintenanceHistoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "corrective" as const,
    description: "",
    technician: "",
    cost: "",
    notes: "",
    partsUsed: "",
  });

  const maintenanceHistory = useQuery(api.maintenanceHistory.listByRoom, { roomId }) || [];
  const createRecord = useMutation(api.maintenanceHistory.create);
  const updateRecord = useMutation(api.maintenanceHistory.update);
  const deleteRecord = useMutation(api.maintenanceHistory.remove);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: "corrective",
      description: "",
      technician: "",
      cost: "",
      notes: "",
      partsUsed: "",
    });
    setEditingRecord(null);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setFormData({
      date: new Date(record.date).toISOString().split('T')[0],
      type: record.type,
      description: record.description || "",
      technician: record.technician || "",
      cost: record.cost?.toString() || "",
      notes: record.notes || "",
      partsUsed: record.partsUsed?.join(", ") || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        roomId,
        cinemaId,
        date: new Date(formData.date).getTime(),
        type: formData.type,
        description: formData.description,
        technician: formData.technician || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
        partsUsed: formData.partsUsed ? formData.partsUsed.split(",").map(p => p.trim()).filter(Boolean) : undefined,
      };

      if (editingRecord) {
        await updateRecord({ id: editingRecord._id, ...data });
      } else {
        await createRecord(data);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving maintenance record:", error);
      alert("Erro ao salvar registro. Tente novamente.");
    }
  };

  const handleDelete = async (id: Id<"maintenanceHistory">) => {
    if (confirm("Tem certeza que deseja excluir este registro de manutenção?")) {
      await deleteRecord({ id });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      preventive_a: "Preventiva A",
      preventive_b: "Preventiva B",
      preventive_c: "Preventiva C",
      lamp_replacement: "Troca de Lâmpada",
      corrective: "Corretiva",
      cleaning: "Limpeza",
      inspection: "Inspeção",
      other: "Outros",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      preventive_a: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      preventive_b: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      preventive_c: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      lamp_replacement: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      corrective: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      cleaning: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      inspection: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Histórico de Manutenções
        </h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nova Manutenção
        </button>
      </div>

      {/* Maintenance History List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {maintenanceHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">🔧</div>
              <p className="text-gray-600 dark:text-gray-400">
                Nenhuma manutenção registrada
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceHistory.map((record) => (
                <div key={record._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                          {getTypeLabel(record.type)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.date).toLocaleDateString('pt-BR')}
                        </span>
                        {record.cost && (
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            R$ {record.cost.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {record.description}
                      </h4>
                      
                      {record.technician && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Técnico: {record.technician}
                        </p>
                      )}
                      
                      {record.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {record.notes}
                        </p>
                      )}
                      
                      {record.partsUsed && record.partsUsed.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Peças utilizadas: {record.partsUsed.join(", ")}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Maintenance Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingRecord ? "Editar Manutenção" : "Nova Manutenção"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo de Manutenção
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="corrective">Corretiva</option>
                      <option value="preventive_a">Preventiva A</option>
                      <option value="preventive_b">Preventiva B</option>
                      <option value="preventive_c">Preventiva C</option>
                      <option value="lamp_replacement">Troca de Lâmpada</option>
                      <option value="cleaning">Limpeza</option>
                      <option value="inspection">Inspeção</option>
                      <option value="other">Outros</option>
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
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Técnico Responsável
                    </label>
                    <input
                      type="text"
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Nome do técnico"
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
                    Peças Utilizadas
                  </label>
                  <input
                    type="text"
                    value={formData.partsUsed}
                    onChange={(e) => setFormData({ ...formData, partsUsed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Separe as peças por vírgula"
                  />
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
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {editingRecord ? "Atualizar" : "Registrar"} Manutenção
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
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
