import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface InventoryManagerProps {
  cinemaId: Id<"cinemas">;
  isAdmin: boolean;
}

export function InventoryManager({ cinemaId, isAdmin }: InventoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    category: "",
    location: "",
    minQuantity: "",
    cost: "",
    supplier: "",
    notes: "",
  });

  const inventory = useQuery(api.inventory.listByCinema, { cinemaId }) || [];
  const lowStockItems = useQuery(api.inventory.getLowStockItems, { cinemaId }) || [];
  const createItem = useMutation(api.inventory.create);
  const updateItem = useMutation(api.inventory.update);
  const deleteItem = useMutation(api.inventory.remove);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      quantity: "",
      category: "",
      location: "",
      minQuantity: "",
      cost: "",
      supplier: "",
      notes: "",
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      quantity: item.quantity?.toString() || "",
      category: item.category || "",
      location: item.location || "",
      minQuantity: item.minQuantity?.toString() || "",
      cost: item.cost?.toString() || "",
      supplier: item.supplier || "",
      notes: item.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        cinemaId,
        name: formData.name || undefined,
        description: formData.description || undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        category: formData.category || undefined,
        location: formData.location || undefined,
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        supplier: formData.supplier || undefined,
        notes: formData.notes || undefined,
      };

      if (editingItem) {
        await updateItem({ id: editingItem._id, ...data });
      } else {
        await createItem(data);
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving inventory item:", error);
      alert("Erro ao salvar item. Tente novamente.");
    }
  };

  const handleDelete = async (id: Id<"inventory">) => {
    if (confirm("Tem certeza que deseja excluir este item do inventário?")) {
      await deleteItem({ id });
    }
  };

  const getStockStatus = (item: any) => {
    if (!item.quantity || !item.minQuantity) return null;
    
    if (item.quantity <= item.minQuantity) {
      return { status: "low", color: "text-red-600 dark:text-red-400", label: "Estoque baixo" };
    } else if (item.quantity <= item.minQuantity * 1.5) {
      return { status: "medium", color: "text-yellow-600 dark:text-yellow-400", label: "Estoque médio" };
    } else {
      return { status: "good", color: "text-green-600 dark:text-green-400", label: "Estoque bom" };
    }
  };

  const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Inventário
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie o estoque de itens e equipamentos
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Novo Item
          </button>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
            ⚠️ Itens com Estoque Baixo
          </h3>
          <div className="grid gap-2 md:grid-cols-2">
            {lowStockItems.map((item) => (
              <div key={item._id} className="text-sm text-red-800 dark:text-red-200">
                • {item.name} - {item.quantity} unidades (mín: {item.minQuantity})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {inventory.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total de Itens</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Quantidade Total</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {lowStockItems.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Estoque Baixo</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {categories.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Categorias</div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Itens do Inventário
          </h3>

          {inventory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📦</div>
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum item no inventário
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Quantidade</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Localização</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                    {isAdmin && (
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <tr key={item._id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {item.name || "Item sem nome"}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded text-sm">
                            {item.category || "Sem categoria"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-900 dark:text-white">
                            {item.quantity || 0}
                          </div>
                          {item.minQuantity && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Mín: {item.minQuantity}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {item.location || "Não especificada"}
                        </td>
                        <td className="py-3 px-4">
                          {stockStatus && (
                            <span className={`text-sm font-medium ${stockStatus.color}`}>
                              {stockStatus.label}
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Item Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingItem ? "Editar Item" : "Novo Item"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Item
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Lâmpada UHP 330W"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Projeção, Som, Limpeza"
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
                    placeholder="Descrição detalhada do item..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantidade Mínima
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custo Unitário (R$)
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Almoxarifado A, Prateleira 3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fornecedor
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Nome do fornecedor"
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
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {editingItem ? "Atualizar" : "Criar"} Item
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
