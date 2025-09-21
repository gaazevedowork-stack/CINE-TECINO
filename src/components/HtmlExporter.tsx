import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function HtmlExporter() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"complete" | "summary">("complete");

  const cinemas = useQuery(api.cinemas.list) || [];
  const allRooms = useQuery(api.rooms.list, {}) || [];
  const allTasks = useQuery(api.tasks.list, {}) || [];
  const allEvents = useQuery(api.events.list) || [];
  const criticalAlerts = useQuery(api.equipment.getCriticalAlerts, {}) || [];

  const exportToHTML = async () => {
    setIsExporting(true);
    
    try {
      const data = {
        cinemas: cinemas.map(cinema => {
          const cinemaRooms = allRooms.filter(room => room.cinemaId === cinema._id);
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
        rooms: allRooms,
        tasks: allTasks,
        events: allEvents,
        criticalAlerts,
        exportDate: new Date().toLocaleString('pt-BR'),
        exportType,
      };

      const htmlContent = generateHTML(data);
      
      // Create and download the file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-cinema-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao exportar HTML:', error);
      alert('Erro ao exportar HTML. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateHTML = (data: any) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "active": return "#10b981";
        case "maintenance": return "#f59e0b";
        case "stopped": return "#ef4444";
        default: return "#6b7280";
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "active": return "Ativa";
        case "maintenance": return "Manutenção";
        case "stopped": return "Parada";
        default: return status;
      }
    };

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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.8rem;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #718096;
            font-size: 0.9rem;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .card-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .card p {
            margin-bottom: 8px;
            color: #4a5568;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            color: white;
            margin-left: 10px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .table th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .table td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .table tr:hover {
            background: #f7fafc;
        }
        
        .alert {
            background: #fed7d7;
            border: 1px solid #feb2b2;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .alert-title {
            font-weight: 600;
            color: #c53030;
            margin-bottom: 10px;
        }
        
        .footer {
            background: #2d3748;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 0.9rem;
        }
        
        @media print {
            body { padding: 0; }
            .container { box-shadow: none; }
            .card:hover { transform: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Relatório do Sistema de Cinema</h1>
            <p>Relatório ${data.exportType === 'complete' ? 'Completo' : 'Resumido'} gerado em ${data.exportDate}</p>
        </div>
        
        <div class="content">
            <!-- Estatísticas Gerais -->
            <div class="section">
                <h2 class="section-title">📊 Estatísticas Gerais</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${data.cinemas.length}</div>
                        <div class="stat-label">Cinemas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${data.rooms.length}</div>
                        <div class="stat-label">Salas Totais</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${data.rooms.filter((r: any) => r.status === 'active').length}</div>
                        <div class="stat-label">Salas Ativas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${data.criticalAlerts.length}</div>
                        <div class="stat-label">Alertas Críticos</div>
                    </div>
                </div>
            </div>

            ${data.criticalAlerts.length > 0 ? `
            <!-- Alertas Críticos -->
            <div class="section">
                <h2 class="section-title">🚨 Alertas Críticos</h2>
                <div class="alert">
                    <div class="alert-title">Equipamentos que precisam de atenção imediata:</div>
                    ${data.criticalAlerts.map((alert: any) => `
                        <p>• <strong>${alert.name}</strong> - Status: ${alert.status === 'maintenance' ? 'Manutenção' : 'Substituição'}</p>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Cinemas -->
            <div class="section">
                <h2 class="section-title">🏢 Cinemas</h2>
                <div class="grid">
                    ${data.cinemas.map((cinema: any) => `
                        <div class="card">
                            <div class="card-title">${cinema.name}</div>
                            <p><strong>📍 Localização:</strong> ${cinema.location}</p>
                            <p><strong>🎭 Total de Salas:</strong> ${cinema.totalRooms}</p>
                            <p><strong>✅ Salas Ativas:</strong> ${cinema.activeRooms}</p>
                            <p><strong>📊 Disponibilidade:</strong> ${cinema.availability}%</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${data.exportType === 'complete' ? `
            <!-- Salas Detalhadas -->
            <div class="section">
                <h2 class="section-title">🎭 Salas por Cinema</h2>
                ${data.cinemas.map((cinema: any) => `
                    <div style="margin-bottom: 30px;">
                        <h3 style="color: #667eea; margin-bottom: 15px;">${cinema.name}</h3>
                        <div class="grid">
                            ${cinema.rooms.map((room: any) => `
                                <div class="card">
                                    <div class="card-title">${room.name}
                                        <span class="status-badge" style="background-color: ${getStatusColor(room.status)}">
                                            ${getStatusLabel(room.status)}
                                        </span>
                                    </div>
                                    <p><strong>👥 Capacidade:</strong> ${room.capacity} lugares</p>
                                    <p><strong>🎬 Tipo de Tela:</strong> ${room.screenType || 'N/A'}</p>
                                    <p><strong>🔊 Sistema de Som:</strong> ${room.soundSystem || 'N/A'}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Tarefas Pendentes -->
            ${data.tasks.filter((t: any) => t.status !== 'done').length > 0 ? `
            <div class="section">
                <h2 class="section-title">📋 Tarefas Pendentes</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tarefa</th>
                            <th>Sala</th>
                            <th>Prioridade</th>
                            <th>Status</th>
                            <th>Prazo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.tasks.filter((t: any) => t.status !== 'done').map((task: any) => {
                            const room = data.rooms.find((r: any) => r._id === task.roomId);
                            return `
                                <tr>
                                    <td>${task.title}</td>
                                    <td>${room ? room.name : 'Geral'}</td>
                                    <td>
                                        <span style="color: ${task.priority === 'high' ? '#e53e3e' : task.priority === 'medium' ? '#d69e2e' : '#38a169'}">
                                            ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                        </span>
                                    </td>
                                    <td>${task.status === 'todo' ? 'A fazer' : task.status === 'in_progress' ? 'Em andamento' : 'Concluída'}</td>
                                    <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            <!-- Próximos Eventos -->
            ${data.events.filter((e: any) => e.startTime > Date.now()).length > 0 ? `
            <div class="section">
                <h2 class="section-title">📅 Próximos Eventos</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Sala</th>
                            <th>Data/Hora</th>
                            <th>Tipo</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.events.filter((e: any) => e.startTime > Date.now()).slice(0, 10).map((event: any) => {
                            const room = data.rooms.find((r: any) => r._id === event.roomId);
                            return `
                                <tr>
                                    <td>${event.title}</td>
                                    <td>${room ? room.name : 'Geral'}</td>
                                    <td>${new Date(event.startTime).toLocaleString('pt-BR')}</td>
                                    <td>${event.type}</td>
                                    <td>${event.status}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Relatório gerado automaticamente pelo Sistema de Gestão de Cinema</p>
            <p>Data de geração: ${data.exportDate}</p>
        </div>
    </div>
</body>
</html>`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Exportar Relatório HTML
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gere um relatório completo em formato HTML
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Relatório
          </label>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as "complete" | "summary")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="summary">Resumo Executivo</option>
            <option value="complete">Relatório Completo</option>
          </select>
        </div>

        <button
          onClick={exportToHTML}
          disabled={isExporting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Gerando Relatório...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar HTML
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>Resumo Executivo:</strong> Inclui estatísticas gerais e informações dos cinemas.<br />
          <strong>Relatório Completo:</strong> Inclui todas as informações, tarefas e eventos detalhados.
        </p>
      </div>
    </div>
  );
}
