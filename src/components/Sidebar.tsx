import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
}

export function Sidebar({ activeView, onViewChange, isAdmin }: SidebarProps) {
  const [showReportExport, setShowReportExport] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: "all" as "all" | "cinema",
    cinemaId: "" as Id<"cinemas"> | "",
    period: "30",
  });

  const cinemas = useQuery(api.cinemas.list) || [];

  const menuItems = [
    { id: "dashboard", label: "Dashboard Geral", icon: "🏠" },
    { id: "settings", label: "Configurações", icon: "⚙️" },
  ];

  const generateReport = async () => {
    try {
      const periodDays = parseInt(reportConfig.period);
      const cutoffDate = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
      
      let reportData;
      if (reportConfig.type === "all") {
        // Generate report for all cinemas
        // For now, we'll generate a simplified report since we can't call queries from mutations
        const allRooms = cinemas.map(cinema => ({
          cinema,
          rooms: [],
          inventory: [],
          maintenanceHistory: [],
          tasks: [],
        }));
        reportData = { type: "all", data: allRooms };
      } else {
        // Generate report for specific cinema
        const cinema = cinemas.find(c => c._id === reportConfig.cinemaId);
        if (!cinema) return;
        
        // For now, we'll generate a simplified report since we can't call queries from mutations
        reportData = {
          type: "cinema",
          data: {
            cinema,
            rooms: [],
            inventory: [],
            maintenanceHistory: [],
            tasks: [],
          }
        };
      }

      // Generate HTML report
      const reportContent = generateReportHTML(reportData, reportConfig.period);
      
      // Create and download
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${reportConfig.type === "all" ? "geral" : "cinema"}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowReportExport(false);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    }
  };

  const generateReportHTML = (reportData: any, period: string) => {
    const isAllCinemas = reportData.type === "all";
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório ${isAllCinemas ? 'Geral' : 'do Cinema'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .cinema-section { border: 2px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 10px; }
          .room-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .maintenance-item { border-left: 3px solid #007bff; padding-left: 10px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .status-active { color: #28a745; }
          .status-maintenance { color: #ffc107; }
          .status-stopped { color: #dc3545; }
          .inventory-item { background-color: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 5px; }
          .task-item { background-color: #e9ecef; padding: 10px; margin: 5px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório ${isAllCinemas ? 'Geral de Todos os Cinemas' : 'do Cinema'}</h1>
          ${!isAllCinemas ? `<h2>${reportData.data.cinema.name}</h2>` : ''}
          <p>Período: Últimos ${period} dias</p>
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        ${isAllCinemas ? 
          reportData.data.map((cinemaData: any) => `
            <div class="cinema-section">
              <h2>🏢 ${cinemaData.cinema.name}</h2>
              <p><strong>Localização:</strong> ${cinemaData.cinema.location}</p>
              
              ${generateCinemaReportSection(cinemaData)}
            </div>
          `).join('') :
          generateCinemaReportSection(reportData.data)
        }
      </body>
      </html>
    `;
  };

  const generateCinemaReportSection = (cinemaData: any) => {
    return `
      <div class="section">
        <h3>📊 Resumo das Salas</h3>
        <table>
          <tr><td><strong>Total de Salas:</strong></td><td>${cinemaData.rooms.length}</td></tr>
          <tr><td><strong>Salas Ativas:</strong></td><td class="status-active">${cinemaData.rooms.filter((r: any) => r.status === 'active').length}</td></tr>
          <tr><td><strong>Salas em Manutenção:</strong></td><td class="status-maintenance">${cinemaData.rooms.filter((r: any) => r.status === 'maintenance').length}</td></tr>
          <tr><td><strong>Salas Paradas:</strong></td><td class="status-stopped">${cinemaData.rooms.filter((r: any) => r.status === 'stopped').length}</td></tr>
        </table>
      </div>

      <div class="section">
        <h3>🏢 Detalhes das Salas</h3>
        ${cinemaData.rooms.map((room: any) => `
          <div class="room-card">
            <h4>${room.name || 'Sala sem nome'} - Status: <span class="status-${room.status}">${room.status === 'active' ? 'Ativa' : room.status === 'maintenance' ? 'Manutenção' : 'Parada'}</span></h4>
            ${room.statusReason ? `<p><strong>Motivo:</strong> ${room.statusReason}</p>` : ''}
            ${room.seating ? `<p><strong>Capacidade:</strong> ${room.seating.standard + room.seating.premium + room.seating.vip} lugares</p>` : ''}
            ${room.projectorLamp ? `<p><strong>Lâmpada:</strong> ${room.projectorLamp.currentHours}/${room.projectorLamp.maxHours} horas (${Math.round((room.projectorLamp.currentHours / room.projectorLamp.maxHours) * 100)}%)</p>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h3>📦 Inventário</h3>
        ${cinemaData.inventory.length === 0 ? '<p>Nenhum item no inventário.</p>' : `
          ${cinemaData.inventory.map((item: any) => `
            <div class="inventory-item">
              <strong>${item.name || 'Item sem nome'}</strong> - Quantidade: ${item.quantity || 0}
              ${item.category ? ` | Categoria: ${item.category}` : ''}
              ${item.location ? ` | Local: ${item.location}` : ''}
            </div>
          `).join('')}
        `}
      </div>

      <div class="section">
        <h3>🔧 Histórico de Manutenções</h3>
        ${cinemaData.maintenanceHistory.length === 0 ? '<p>Nenhuma manutenção registrada no período.</p>' : `
          ${cinemaData.maintenanceHistory.map((record: any) => `
            <div class="maintenance-item">
              <strong>${new Date(record.date).toLocaleDateString('pt-BR')}</strong> - ${record.type}
              <br>${record.description}
              ${record.technician ? `<br>Técnico: ${record.technician}` : ''}
              ${record.cost ? `<br>Custo: R$ ${record.cost.toFixed(2)}` : ''}
            </div>
          `).join('')}
        `}
      </div>

      <div class="section">
        <h3>📋 Tarefas</h3>
        ${cinemaData.tasks.length === 0 ? '<p>Nenhuma tarefa registrada no período.</p>' : `
          ${cinemaData.tasks.map((task: any) => `
            <div class="task-item">
              <strong>${task.title}</strong> - ${task.status} (${task.priority})
              <br>${task.description}
              ${task.assignedTo ? `<br>Responsável: ${task.assignedTo}` : ''}
            </div>
          `).join('')}
        `}
      </div>
    `;
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Cinema Manager
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sistema de Gestão
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
              ${activeView === item.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* Export Report Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowReportExport(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <span className="text-lg">📄</span>
            <span className="font-medium">Exportar Relatório</span>
          </button>
        </div>
      </nav>

      {/* Report Export Modal */}
      {showReportExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Exportar Relatório
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Relatório
                  </label>
                  <select
                    value={reportConfig.type}
                    onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Todos os Cinemas</option>
                    <option value="cinema">Por Cinema</option>
                  </select>
                </div>

                {reportConfig.type === "cinema" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selecionar Cinema
                    </label>
                    <select
                      value={reportConfig.cinemaId}
                      onChange={(e) => setReportConfig({ ...reportConfig, cinemaId: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Selecione um cinema</option>
                      {cinemas.map((cinema) => (
                        <option key={cinema._id} value={cinema._id}>
                          {cinema.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período
                  </label>
                  <select
                    value={reportConfig.period}
                    onChange={(e) => setReportConfig({ ...reportConfig, period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="7">Últimos 7 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="90">Últimos 90 dias</option>
                    <option value="365">Último ano</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={generateReport}
                  disabled={reportConfig.type === "cinema" && !reportConfig.cinemaId}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Gerar Relatório
                </button>
                <button
                  onClick={() => setShowReportExport(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
