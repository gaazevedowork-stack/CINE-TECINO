import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface EquipmentFormProps {
  roomId: Id<"rooms">;
  cinemaId: Id<"cinemas">;
  equipment?: any;
  onClose: () => void;
}

export function EquipmentForm({ roomId, cinemaId, equipment, onClose }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ipAddress: "",
    category: "other" as "projection" | "sound" | "climate" | "electrical" | "network" | "other",
    installDate: "",
    cost: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    // Projector specific
    lumens: "",
    resolution: "",
    lampHours: "",
    maxLampHours: "",
    // Sound specific
    channels: "",
    power: "",
    frequency: "",
    // Climate specific
    capacity_btu: "",
    temperature_range: "",
    // Network specific
    mac_address: "",
    ip_range: "",
    port_count: "",
  });

  const createEquipment = useMutation(api.equipment.create);
  const updateEquipment = useMutation(api.equipment.update);

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || "",
        description: equipment.description || "",
        ipAddress: equipment.ipAddress || "",
        category: equipment.category || "other",
        installDate: equipment.installDate ? new Date(equipment.installDate).toISOString().split('T')[0] : "",
        cost: equipment.cost?.toString() || "",
        serialNumber: equipment.serialNumber || "",
        model: equipment.model || "",
        manufacturer: equipment.manufacturer || "",
        // Projector specific
        lumens: equipment.lumens?.toString() || "",
        resolution: equipment.resolution || "",
        lampHours: equipment.lampHours?.toString() || "",
        maxLampHours: equipment.maxLampHours?.toString() || "",
        // Sound specific
        channels: equipment.channels?.toString() || "",
        power: equipment.power?.toString() || "",
        frequency: equipment.frequency || "",
        // Climate specific
        capacity_btu: equipment.capacity_btu?.toString() || "",
        temperature_range: equipment.temperature_range || "",
        // Network specific
        mac_address: equipment.mac_address || "",
        ip_range: equipment.ip_range || "",
        port_count: equipment.port_count?.toString() || "",
      });
    }
  }, [equipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const baseData = {
        roomId,
        cinemaId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        ipAddress: formData.ipAddress || undefined,
        installDate: formData.installDate ? new Date(formData.installDate).getTime() : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        serialNumber: formData.serialNumber || undefined,
        model: formData.model || undefined,
        manufacturer: formData.manufacturer || undefined,
      };

      // Add category-specific fields
      const categoryData: any = {};
      
      if (formData.category === "projection") {
        if (formData.lumens) categoryData.lumens = parseInt(formData.lumens);
        if (formData.resolution) categoryData.resolution = formData.resolution;
        if (formData.lampHours) categoryData.lampHours = parseInt(formData.lampHours);
        if (formData.maxLampHours) categoryData.maxLampHours = parseInt(formData.maxLampHours);
      }
      
      if (formData.category === "sound") {
        if (formData.channels) categoryData.channels = parseInt(formData.channels);
        if (formData.power) categoryData.power = parseInt(formData.power);
        if (formData.frequency) categoryData.frequency = formData.frequency;
      }
      
      if (formData.category === "climate") {
        if (formData.capacity_btu) categoryData.capacity_btu = parseInt(formData.capacity_btu);
        if (formData.temperature_range) categoryData.temperature_range = formData.temperature_range;
      }
      
      if (formData.category === "network") {
        if (formData.mac_address) categoryData.mac_address = formData.mac_address;
        if (formData.ip_range) categoryData.ip_range = formData.ip_range;
        if (formData.port_count) categoryData.port_count = parseInt(formData.port_count);
      }

      const finalData = { ...baseData, ...categoryData };

      if (equipment) {
        await updateEquipment({ id: equipment._id, ...finalData });
      } else {
        await createEquipment(finalData);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving equipment:", error);
    }
  };

  const renderCategorySpecificFields = () => {
    switch (formData.category) {
      case "projection":
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Especificações de Projeção</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lumens
                </label>
                <input
                  type="number"
                  value={formData.lumens}
                  onChange={(e) => setFormData({ ...formData, lumens: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 4000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resolução
                </label>
                <input
                  type="text"
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 4K, 2K, HD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Horas da Lâmpada
                </label>
                <input
                  type="number"
                  value={formData.lampHours}
                  onChange={(e) => setFormData({ ...formData, lampHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Máx. Horas da Lâmpada
                </label>
                <input
                  type="number"
                  value={formData.maxLampHours}
                  onChange={(e) => setFormData({ ...formData, maxLampHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 2000"
                />
              </div>
            </div>
          </div>
        );

      case "sound":
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Especificações de Som</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Canais
                </label>
                <input
                  type="number"
                  value={formData.channels}
                  onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 7.1, 5.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Potência (W)
                </label>
                <input
                  type="number"
                  value={formData.power}
                  onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 1000"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequência
                </label>
                <input
                  type="text"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 20Hz - 20kHz"
                />
              </div>
            </div>
          </div>
        );

      case "climate":
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Especificações de Climatização</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Capacidade (BTU)
                </label>
                <input
                  type="number"
                  value={formData.capacity_btu}
                  onChange={(e) => setFormData({ ...formData, capacity_btu: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 60000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Faixa de Temperatura
                </label>
                <input
                  type="text"
                  value={formData.temperature_range}
                  onChange={(e) => setFormData({ ...formData, temperature_range: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 18°C - 24°C"
                />
              </div>
            </div>
          </div>
        );

      case "network":
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Especificações de Rede</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endereço MAC
                </label>
                <input
                  type="text"
                  value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 00:1B:44:11:3A:B7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Faixa de IP
                </label>
                <input
                  type="text"
                  value={formData.ip_range}
                  onChange={(e) => setFormData({ ...formData, ip_range: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 192.168.1.0/24"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Portas
                </label>
                <input
                  type="number"
                  value={formData.port_count}
                  onChange={(e) => setFormData({ ...formData, port_count: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 24"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {equipment ? "Editar Equipamento" : "Novo Equipamento"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Informações Básicas</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Equipamento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Projetor Christie CP2230, Amplificador QSC"
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
                <option value="electrical">Elétrico</option>
                <option value="network">Rede</option>
                <option value="other">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Descreva o equipamento, suas funções e características"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Série
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: ABC123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: CP2230, DCP2000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fabricante
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Christie, Barco, QSC"
              />
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Instalação
                </label>
                <input
                  type="date"
                  value={formData.installDate}
                  onChange={(e) => setFormData({ ...formData, installDate: e.target.value })}
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
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Category Specific Fields */}
          {renderCategorySpecificFields()}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {equipment ? "Atualizar" : "Criar"} Equipamento
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
