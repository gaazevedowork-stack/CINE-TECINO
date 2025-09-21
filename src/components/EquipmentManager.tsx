import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface EquipmentManagerProps {
  roomId: Id<"rooms">;
  cinemaId: Id<"cinemas">;
  isAdmin: boolean;
}

export function EquipmentManager({ roomId, cinemaId, isAdmin }: EquipmentManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  
  const equipment = useQuery(api.equipment.listByRoom, { roomId }) || [];
  const createEquipment = useMutation(api.equipment.create);
  const updateEquipment = useMutation(api.equipment.update);
  const removeEquipment = useMutation(api.equipment.remove);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ipAddress: "",
    category: "other" as const,
    cost: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEquipment) {
        await updateEquipment({
          id: editingEquipment._id,
          name: formData.name,
          description: formData.description,
          ipAddress: formData.ipAddress || undefined,
          category: formData.category,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
        });
      } else {
        await createEquipment({
          roomId,
          cinemaId,
          name: formData.name,
          description: formData.description,
          ipAddress: formData.ipAddress || undefined,
          category: formData.category,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          installDate: Date.now(),
        });
      }
      
      setFormData({ name: "", description: "", ipAddress: "", category: "other", cost: "" });
      setShowForm(false);
      setEditingEquipment(null);
    } catch (error) {
      console.error("Error saving equipment:", error);
    }
  };

  const handleEdit = (eq: any) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      description: eq.description,
      ipAddress: eq.ipAddress || "",
      category: eq.category,
      cost: eq.cost?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: Id<"equipment">) => {
    if (confirm("Tem certeza que deseja remover este equipamento?")) {
      await removeEquipment({ id });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "projection": return "🎥";
      case "sound": return "🔊";
      case "climate": return "❄️";
      case "electrical": return "⚡";
      case "network": return "🌐";
      default: return "🔧";
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      projection: "Projeção",
      sound: "Som",
      climate: "Climatização",
      electrical: "Elétrica",
      network: "Rede",
      other: "Outros"
    };
    return names[category as keyof typeof names] || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "maintenance": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "replacement": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusName = (status: string) => {
    const names = {
      operational: "Operacional",
      maintenance: "Manutenção",
      replacement: "Substituição"
    };
    return names[status as keyof typeof names] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Equipamentos Personalizados
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie equipamentos adicionais da sala
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Adicionar Equipamento
          </button>
        )}
      </div>

      {/* Equipment List */}
      <div className="grid gap-4 md:grid-cols-2">
        {equipment.map((eq) => (
          <div
            key={eq._id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(eq.category)}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {eq.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getCategoryName(eq.category)}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(eq.status)}`}>
                {getStatusName(eq.status)}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {eq.description}
            </p>

            {eq.ipAddress && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span>🌐</span>
                <span>{eq.ipAddress}</span>
              </div>
            )}

            {eq.cost && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span>💰</span>
                <span>R$ {eq.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {isAdmin && (
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(eq)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(eq._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {equipment.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🔧</div>
          <p>Nenhum equipamento personalizado cadastrado</p>
        </div>
      )}

      {/* Equipment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingEquipment ? "Editar Equipamento" : "Adicionar Equipamento"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Equipamento
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="projection">Projeção</option>
                  <option value="sound">Som</option>
                  <option value="climate">Climatização</option>
                  <option value="electrical">Elétrica</option>
                  <option value="network">Rede</option>
                  <option value="other">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço IP (opcional)
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="192.168.1.100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custo (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {editingEquipment ? "Atualizar" : "Adicionar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEquipment(null);
                    setFormData({ name: "", description: "", ipAddress: "", category: "other", cost: "" });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
