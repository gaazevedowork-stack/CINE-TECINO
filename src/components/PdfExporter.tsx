import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function PdfExporter() {
  const [isExporting, setIsExporting] = useState(false);

  const cinemas = useQuery(api.cinemas.list) || [];
  const allRooms = useQuery(api.rooms.list, {}) || [];

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Get maintenance history for all rooms
      const roomsWithHistory = await Promise.all(
        allRooms.map(async (room) => {
          // This would need to be implemented as a query that gets maintenance history
          // For now, we'll use the room data we have
          return {
            ...room,
            maintenanceHistory: [], // This would be populated with actual history
          };
        })
      );

      const data = {
        cinemas: cinemas.map(cinema => {
          const cinemaRooms = roomsWithHistory.filter(room => room.cinemaId === cinema._id);
          const activeRooms = cinemaRooms.filter(room => room.status === "active").length;
          const availability = cinemaRooms.length > 0 ? Math.round((activeRooms / cinemaRooms.length) * 100) : 0;
          
          return {
            ...cinema,
            totalRooms: cinemaRooms.length,
            activeRooms,
            availability,
            rooms: cinemaRooms,
          };
        }),
        exportDate: new Date().toLocaleString('pt-BR'),
      };

      const htmlContent = generatePDFHTML(data);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDFHTML = (data: any) => {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório do Sistema de Cinema - ${data.exportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: white;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #667eea;
        }
        
        .header h1 {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1rem;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 1.5rem;
            color: #2d3748;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .cinema-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .cinema-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            background: #f8fafc;
        }
        
        .cinema-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .cinema-info {
            margin-bottom: 8px;
            color: #4a5568;
        }
        
        .cinema-info strong {
            color: #2d3748;
        }
        
        .rooms-section {
            margin-top: 20px;
        }
        
        .room-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .room-name {
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 5px;
        }
        
        .room-details {
            font-size: 0.9rem;
            color: #4a5568;
        }
        
        .status-active { color: #10b981; }
        .status-maintenance { color: #f59e0b; }
        .status-stopped { color: #ef4444; }
        
        .maintenance-info {
            margin-top: 10px;
            padding: 10px;
            background: #f0f9ff;
            border-radius: 4px;
            font-size: 0.85rem;
        }
        
        .lamp-info {
            color: #0369a1;
        }
        
        .preventive-info {
            color: #7c3aed;
        }
        
        @media print {
            body { padding: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎬 Relatório do Sistema de Cinema</h1>
        <p>Relatório gerado em ${data.exportDate}</p>
    </div>
    
    <!-- Comparação entre Cinemas -->
    <div class="section">
        <h2 class="section-title">📊 Comparação entre Cinemas</h2>
        <div class="cinema-grid">
            ${data.cinemas.map((cinema: any) => `
                <div class="cinema-card">
                    <div class="cinema-name">${cinema.name}</div>
                    <div class="cinema-info"><strong>📍 Localização:</strong> ${cinema.location}</div>
                    <div class="cinema-info"><strong>🎭 Total de Salas:</strong> ${cinema.totalRooms}</div>
                    <div class="cinema-info"><strong>✅ Salas Ativas:</strong> ${cinema.activeRooms}</div>
                    <div class="cinema-info"><strong>📊 Disponibilidade:</strong> ${cinema.availability}%</div>
                    
                    <div class="rooms-section">
                        <h4 style="margin-bottom: 10px; color: #4a5568;">Salas:</h4>
                        ${cinema.rooms.map((room: any) => {
                          const statusClass = `status-${room.status}`;
                          const statusLabel = room.status === 'active' ? 'Ativa' : 
                                            room.status === 'maintenance' ? 'Manutenção' : 'Parada';
                          
                          return `
                            <div class="room-item">
                                <div class="room-name">${room.name} 
                                    <span class="${statusClass}">(${statusLabel})</span>
                                </div>
                                <div class="room-details">
                                    Capacidade: ${room.seating ? 
                                      room.seating.standard + room.seating.premium + room.seating.vip : 
                                      room.capacity || 0} lugares
                                    ${room.screenType ? ` • Tela: ${room.screenType}` : ''}
                                    ${room.soundSystem ? ` • Som: ${room.soundSystem}` : ''}
                                </div>
                                
                                ${room.projectorLamp ? `
                                    <div class="maintenance-info">
                                        <div class="lamp-info">
                                            <strong>💡 Lâmpada:</strong> ${room.projectorLamp.model} 
                                            (${room.projectorLamp.currentHours}/${room.projectorLamp.maxHours}h)
                                            <br>
                                            <strong>Última troca:</strong> ${new Date(room.projectorLamp.lastReplacementDate).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${room.preventiveMaintenance ? `
                                    <div class="maintenance-info">
                                        <div class="preventive-info">
                                            <strong>🔧 Preventivas:</strong><br>
                                            ${room.preventiveMaintenance.lastPreventiveA ? 
                                              `A: ${new Date(room.preventiveMaintenance.lastPreventiveA).toLocaleDateString('pt-BR')}` : 'A: Nunca'}
                                            ${room.preventiveMaintenance.lastPreventiveB ? 
                                              ` • B: ${new Date(room.preventiveMaintenance.lastPreventiveB).toLocaleDateString('pt-BR')}` : ' • B: Nunca'}
                                            ${room.preventiveMaintenance.lastPreventiveC ? 
                                              ` • C: ${new Date(room.preventiveMaintenance.lastPreventiveC).toLocaleDateString('pt-BR')}` : ' • C: Nunca'}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                          `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 0.9rem;">
        <p>Relatório gerado automaticamente pelo Sistema de Gestão de Cinema</p>
        <p>Data de geração: ${data.exportDate}</p>
    </div>
</body>
</html>`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Exportar Relatório PDF
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gere um relatório comparativo em formato PDF
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            📋 Conteúdo do Relatório
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Comparação entre todos os cinemas</li>
            <li>• Informações detalhadas de cada sala</li>
            <li>• Status das lâmpadas dos projetores</li>
            <li>• Histórico de manutenções preventivas</li>
            <li>• Últimas trocas de lâmpadas realizadas</li>
          </ul>
        </div>

        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Gerando PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar PDF
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Nota:</strong> O relatório será aberto em uma nova janela para impressão/salvamento como PDF. 
          Certifique-se de que o bloqueador de pop-ups esteja desabilitado.
        </p>
      </div>
    </div>
  );
}
