import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TechnicalReportProps {
  cinemaId: Id<"cinemas">;
}

export function TechnicalReport({ cinemaId }: TechnicalReportProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  const cinema = useQuery(api.cinemas.get, { id: cinemaId });
  const rooms = useQuery(api.rooms.listByCinema, { cinemaId }) || [];
  const allCinemas = useQuery(api.cinemas.list) || [];
  const maintenanceHistory = useQuery(api.maintenanceHistory.listByCinema, { cinemaId }) || [];

  if (!cinema) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  const generatePDFReport = () => {
    const reportData = {
      cinema,
      rooms,
      allCinemas,
      maintenanceHistory,
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
    };

    // Create a comprehensive report content
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Técnico - ${cinema.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .room-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .maintenance-item { border-left: 3px solid #007bff; padding-left: 10px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .status-active { color: #28a745; }
          .status-maintenance { color: #ffc107; }
          .status-stopped { color: #dc3545; }
          .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Técnico</h1>
          <h2>${cinema.name}</h2>
          <p>Localização: ${cinema.location}</p>
          <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <div class="section">
          <h3>Resumo Geral</h3>
          <table>
            <tr><td><strong>Total de Salas:</strong></td><td>${rooms.length}</td></tr>
            <tr><td><strong>Salas Ativas:</strong></td><td class="status-active">${rooms.filter(r => r.status === 'active').length}</td></tr>
            <tr><td><strong>Salas em Manutenção:</strong></td><td class="status-maintenance">${rooms.filter(r => r.status === 'maintenance').length}</td></tr>
            <tr><td><strong>Salas Paradas:</strong></td><td class="status-stopped">${rooms.filter(r => r.status === 'stopped').length}</td></tr>
          </table>
        </div>

        <div class="section">
          <h3>Detalhes das Salas</h3>
          ${rooms.map(room => `
            <div class="room-card">
              <h4>${room.name || 'Sala sem nome'} - Status: <span class="status-${room.status}">${room.status === 'active' ? 'Ativa' : room.status === 'maintenance' ? 'Manutenção' : 'Parada'}</span></h4>
              ${room.seating ? `<p><strong>Capacidade:</strong> ${room.seating.standard + room.seating.premium + room.seating.vip} lugares (${room.seating.standard} Padrão, ${room.seating.premium} Premium, ${room.seating.vip} VIP)</p>` : ''}
              ${room.projectorLamp ? `
                <p><strong>Lâmpada do Projetor:</strong> ${room.projectorLamp.model}</p>
                <p><strong>Horas de Uso:</strong> ${room.projectorLamp.currentHours}/${room.projectorLamp.maxHours} horas (${Math.round((room.projectorLamp.currentHours / room.projectorLamp.maxHours) * 100)}%)</p>
              ` : ''}
              ${room.preventiveMaintenance ? `
                <p><strong>Manutenções Preventivas:</strong></p>
                <ul>
                  ${room.preventiveMaintenance.lastPreventiveA ? `<li>Preventiva A: ${new Date(room.preventiveMaintenance.lastPreventiveA).toLocaleDateString('pt-BR')}</li>` : '<li>Preventiva A: Nunca realizada</li>'}
                  ${room.preventiveMaintenance.lastPreventiveB ? `<li>Preventiva B: ${new Date(room.preventiveMaintenance.lastPreventiveB).toLocaleDateString('pt-BR')}</li>` : '<li>Preventiva B: Nunca realizada</li>'}
                  ${room.preventiveMaintenance.lastPreventiveC ? `<li>Preventiva C: ${new Date(room.preventiveMaintenance.lastPreventiveC).toLocaleDateString('pt-BR')}</li>` : '<li>Preventiva C: Nunca realizada</li>'}
                </ul>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h3>Histórico de Manutenções (Últimos ${selectedPeriod} dias)</h3>
          ${maintenanceHistory.length === 0 ? '<p>Nenhuma manutenção registrada no período.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Técnico</th>
                  <th>Custo</th>
                </tr>
              </thead>
              <tbody>
                ${maintenanceHistory.slice(0, 20).map(record => `
                  <tr>
                    <td>${new Date(record.date).toLocaleDateString('pt-BR')}</td>
                    <td>${record.type === 'preventive_a' ? 'Preventiva A' : 
                         record.type === 'preventive_b' ? 'Preventiva B' : 
                         record.type === 'preventive_c' ? 'Preventiva C' : 
                         record.type === 'lamp_replacement' ? 'Troca de Lâmpada' : 
                         record.type === 'corrective' ? 'Corretiva' : record.type}</td>
                    <td>${record.description}</td>
                    <td>${record.technician || '-'}</td>
                    <td>${record.cost ? `R$ ${record.cost.toFixed(2)}` : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <div class="section">
          <h3>Comparação entre Cinemas</h3>
          <table>
            <thead>
              <tr>
                <th>Cinema</th>
                <th>Total de Salas</th>
                <th>Salas Ativas</th>
                <th>Última Preventiva A</th>
                <th>Última Preventiva B</th>
                <th>Última Preventiva C</th>
              </tr>
            </thead>
            <tbody>
              ${allCinemas.map(c => {
                const cinemaRooms = c._id === cinemaId ? rooms : [];
                const lastPreventiveA = cinemaRooms.reduce((latest, room) => {
                  const roomDate = room.preventiveMaintenance?.lastPreventiveA;
                  return roomDate && (!latest || roomDate > latest) ? roomDate : latest;
                }, null as number | null);
                const lastPreventiveB = cinemaRooms.reduce((latest, room) => {
                  const roomDate = room.preventiveMaintenance?.lastPreventiveB;
                  return roomDate && (!latest || roomDate > latest) ? roomDate : latest;
                }, null as number | null);
                const lastPreventiveC = cinemaRooms.reduce((latest, room) => {
                  const roomDate = room.preventiveMaintenance?.lastPreventiveC;
                  return roomDate && (!latest || roomDate > latest) ? roomDate : latest;
                }, null as number | null);
                
                return `
                  <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c._id === cinemaId ? rooms.length : '-'}</td>
                    <td>${c._id === cinemaId ? rooms.filter(r => r.status === 'active').length : '-'}</td>
                    <td>${lastPreventiveA ? new Date(lastPreventiveA).toLocaleDateString('pt-BR') : 'N/A'}</td>
                    <td>${lastPreventiveB ? new Date(lastPreventiveB).toLocaleDateString('pt-BR') : 'N/A'}</td>
                    <td>${lastPreventiveC ? new Date(lastPreventiveC).toLocaleDateString('pt-BR') : 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-tecnico-${cinema.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getMaintenanceStats = () => {
    const periodDays = parseInt(selectedPeriod);
    const cutoffDate = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
    const recentMaintenance = maintenanceHistory.filter(record => record.date >= cutoffDate);

    return {
      total: recentMaintenance.length,
      preventiveA: recentMaintenance.filter(r => r.type === "preventive_a").length,
      preventiveB: recentMaintenance.filter(r => r.type === "preventive_b").length,
      preventiveC: recentMaintenance.filter(r => r.type === "preventive_c").length,
      lampReplacements: recentMaintenance.filter(r => r.type === "lamp_replacement").length,
      corrective: recentMaintenance.filter(r => r.type === "corrective").length,
      totalCost: recentMaintenance.reduce((sum, r) => sum + (r.cost || 0), 0),
    };
  };

  const stats = getMaintenanceStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Relatório Técnico
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Análise detalhada das operações e manutenções
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          
          <button
            onClick={generatePDFReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            📄 Exportar Relatório
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {rooms.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total de Salas</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {rooms.filter(room => room.status === "active").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Salas Ativas</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {rooms.filter(room => room.status === "maintenance").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Em Manutenção</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {rooms.filter(room => room.status === "stopped").length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Salas Paradas</div>
        </div>
      </div>

      {/* Maintenance Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Manutenções nos Últimos {selectedPeriod} Dias
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.preventiveA}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Preventiva A</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.preventiveB}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Preventiva B</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.preventiveC}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Preventiva C</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.lampReplacements}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Troca Lâmpadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.corrective}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Corretivas</div>
          </div>
        </div>

        {stats.totalCost > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {stats.totalCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Custo Total</div>
            </div>
          </div>
        )}
      </div>

      {/* Cinema Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comparação entre Cinemas
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Cinema</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Localização</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total Salas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Salas Ativas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Última Preventiva A</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Última Preventiva B</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Última Preventiva C</th>
              </tr>
            </thead>
            <tbody>
              {allCinemas.map((c) => {
                const isCurrentCinema = c._id === cinemaId;
                const cinemaRooms = isCurrentCinema ? rooms : [];
                
                // Calculate latest preventive maintenance dates for current cinema
                const lastPreventiveA = cinemaRooms.reduce((latest, room) => {
                  const roomDate = room.preventiveMaintenance?.lastPreventiveA;
                  return roomDate && (!latest || roomDate > latest) ? roomDate : latest;
                }, null as number | null);
                
                const lastPreventiveB = cinemaRooms.reduce((latest, room) => {
                  const roomDate = room.preventiveMaintenance?.lastPreventiveB;
                  return roomDate && (!latest || roomDate > latest) ? roomDate : latest;
                }, null as number | null);
                
                const lastPreventiveC = cinemaRooms.reduce((latest, room) => {
                  const roomDate = room.preventiveMaintenance?.lastPreventiveC;
                  return roomDate && (!latest || roomDate > latest) ? roomDate : latest;
                }, null as number | null);

                return (
                  <tr key={c._id} className={`border-b border-gray-100 dark:border-gray-700 ${isCurrentCinema ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {c.name}
                        {isCurrentCinema && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Atual)</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {c.location}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {isCurrentCinema ? rooms.length : '-'}
                    </td>
                    <td className="py-3 px-4 text-green-600 dark:text-green-400">
                      {isCurrentCinema ? rooms.filter(r => r.status === 'active').length : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {lastPreventiveA ? new Date(lastPreventiveA).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {lastPreventiveB ? new Date(lastPreventiveB).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {lastPreventiveC ? new Date(lastPreventiveC).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
