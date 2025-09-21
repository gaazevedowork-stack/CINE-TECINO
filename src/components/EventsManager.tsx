import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface EventsManagerProps {
  isAdmin: boolean;
}

export function EventsManager({ isAdmin }: EventsManagerProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedCinema, setSelectedCinema] = useState<Id<"cinemas"> | "">("");
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    type: "other" as const,
    customType: "",
    cinemaId: "" as Id<"cinemas"> | "",
    roomId: "" as Id<"rooms"> | "",
  });

  const cinemas = useQuery(api.cinemas.list) || [];
  const allEvents = useQuery(api.events.list) || [];
  const selectedCinemaRooms = selectedCinema ? 
    useQuery(api.rooms.listByCinema, { cinemaId: selectedCinema }) || [] : [];

  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.update);
  const deleteEvent = useMutation(api.events.remove);

  // Group events by cinema
  const eventsByCinema = cinemas.map(cinema => ({
    cinema,
    events: allEvents.filter(event => event.cinemaId === cinema._id)
      .sort((a, b) => a.startTime - b.startTime)
  }));

  const resetForm = () => {
    setEventFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      type: "other",
      customType: "",
      cinemaId: "",
      roomId: "",
    });
    setEditingEvent(null);
    setSelectedCinema("");
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setSelectedCinema(event.cinemaId);
    setEventFormData({
      title: event.title,
      description: event.description || "",
      startTime: new Date(event.startTime).toISOString().slice(0, 16),
      endTime: new Date(event.endTime).toISOString().slice(0, 16),
      type: event.type,
      customType: event.type === "other" ? event.description || "" : "",
      cinemaId: event.cinemaId,
      roomId: event.roomId || "",
    });
    setShowEventForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!eventFormData.cinemaId) {
        alert("Por favor, selecione um cinema.");
        return;
      }

      const data = {
        title: eventFormData.title,
        description: eventFormData.type === "other" && eventFormData.customType ? 
          eventFormData.customType : eventFormData.description,
        startTime: new Date(eventFormData.startTime).getTime(),
        endTime: new Date(eventFormData.endTime).getTime(),
        type: eventFormData.type,
        status: "scheduled" as const,
        cinemaId: eventFormData.cinemaId as Id<"cinemas">,
        roomId: eventFormData.roomId || undefined,
      };

      if (editingEvent) {
        await updateEvent({ id: editingEvent._id, ...data });
      } else {
        await createEvent(data);
      }

      resetForm();
      setShowEventForm(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Erro ao salvar evento. Tente novamente.");
    }
  };

  const handleDelete = async (id: Id<"events">) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      await deleteEvent({ id });
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      maintenance: "Manutenção",
      cleaning: "Limpeza",
      inspection: "Inspeção",
      meeting: "Reunião",
      preventive: "Preventiva",
      events: "Eventos",
      other: "Outros",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      cleaning: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      inspection: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      meeting: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      preventive: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      events: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Eventos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie eventos e atividades programadas
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowEventForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Novo Evento
          </button>
        )}
      </div>

      {/* Events by Cinema */}
      <div className="space-y-6">
        {eventsByCinema.map(({ cinema, events }) => (
          <div key={cinema._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🏢 {cinema.name}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {events.length} evento{events.length !== 1 ? 's' : ''}
                </span>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📅</div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhum evento programado para este cinema
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => (
                    <div key={event._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                              {getEventTypeLabel(event.type)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.status === "scheduled" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
                              event.status === "in_progress" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
                              event.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}>
                              {event.status === "scheduled" ? "Agendado" :
                               event.status === "in_progress" ? "Em Andamento" :
                               event.status === "completed" ? "Concluído" : "Cancelado"}
                            </span>
                          </div>
                          
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {event.title}
                          </h4>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            📅 {new Date(event.startTime).toLocaleDateString('pt-BR')} às {new Date(event.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {event.description}
                            </p>
                          )}
                          
                          {event.roomId && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              🏢 Sala específica
                            </p>
                          )}
                        </div>
                        
                        {isAdmin && (
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(event._id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {eventsByCinema.every(({ events }) => events.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum evento cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece adicionando o primeiro evento ao sistema
          </p>
          {isAdmin && (
            <button
              onClick={() => {
                resetForm();
                setShowEventForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Adicionar Primeiro Evento
            </button>
          )}
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingEvent ? "Editar Evento" : "Novo Evento"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título do Evento
                  </label>
                  <input
                    type="text"
                    value={eventFormData.title}
                    onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cinema
                    </label>
                    <select
                      value={eventFormData.cinemaId}
                      onChange={(e) => {
                        const cinemaId = e.target.value as Id<"cinemas">;
                        setEventFormData({ ...eventFormData, cinemaId, roomId: "" });
                        setSelectedCinema(cinemaId);
                      }}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sala (Opcional)
                    </label>
                    <select
                      value={eventFormData.roomId}
                      onChange={(e) => setEventFormData({ ...eventFormData, roomId: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={!selectedCinema}
                    >
                      <option value="">Todas as salas</option>
                      {selectedCinemaRooms.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.name || `Sala ${room._id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={eventFormData.type}
                    onChange={(e) => setEventFormData({ ...eventFormData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="maintenance">Manutenção</option>
                    <option value="cleaning">Limpeza</option>
                    <option value="inspection">Inspeção</option>
                    <option value="meeting">Reunião</option>
                    <option value="preventive">Preventiva</option>
                    <option value="events">Eventos</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                {eventFormData.type === "other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição do Evento
                    </label>
                    <textarea
                      value={eventFormData.customType}
                      onChange={(e) => setEventFormData({ ...eventFormData, customType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Descreva o evento..."
                      required
                    />
                  </div>
                )}

                {eventFormData.type !== "other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição (Opcional)
                    </label>
                    <textarea
                      value={eventFormData.description}
                      onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={2}
                      placeholder="Detalhes adicionais..."
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data e Hora de Início
                    </label>
                    <input
                      type="datetime-local"
                      value={eventFormData.startTime}
                      onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data e Hora de Término
                    </label>
                    <input
                      type="datetime-local"
                      value={eventFormData.endTime}
                      onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {editingEvent ? "Atualizar" : "Criar"} Evento
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
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
