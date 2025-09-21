import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CalendarProps {
  cinemaId: Id<"cinemas">;
  isAdmin: boolean;
}

export function Calendar({ cinemaId, isAdmin }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    type: "maintenance" as const,
    roomId: "",
  });

  const rooms = useQuery(api.rooms.listByCinema, { cinemaId }) || [];
  const events = useQuery(api.events.listByCinema, { cinemaId }) || [];
  const createEvent = useMutation(api.events.create);
  const deleteEvent = useMutation(api.events.remove);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());

  const calendarDays = [];
  const current = new Date(startOfCalendar);
  
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getEventsForDate = (date: Date) => {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    return events.filter(event => 
      event.startTime >= dateStart.getTime() && 
      event.startTime <= dateEnd.getTime()
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
    const dateStr = date.toISOString().split('T')[0];
    setFormData({
      ...formData,
      startTime: `${dateStr}T09:00`,
      endTime: `${dateStr}T10:00`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createEvent({
        cinemaId,
        roomId: formData.roomId ? formData.roomId as Id<"rooms"> : undefined,
        title: formData.title,
        description: formData.description || undefined,
        startTime: new Date(formData.startTime).getTime(),
        endTime: new Date(formData.endTime).getTime(),
        type: formData.type,
        status: "scheduled",
      });
      
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        type: "maintenance",
        roomId: "",
      });
      setShowForm(false);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleDeleteEvent = async (eventId: Id<"events">) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      await deleteEvent({ id: eventId });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "maintenance": return "bg-yellow-500";
      case "cleaning": return "bg-blue-500";
      case "inspection": return "bg-purple-500";
      case "meeting": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case "maintenance": return "Manutenção";
      case "cleaning": return "Limpeza";
      case "inspection": return "Inspeção";
      case "meeting": return "Reunião";
      default: return type;
    }
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            →
          </button>
        </div>
        
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
        >
          Hoje
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(date);

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700
                  ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 text-gray-400' : ''}
                  ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
                onClick={() => isAdmin && handleDateClick(date)}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                `}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const room = event.roomId ? rooms.find(r => r._id === event.roomId) : null;
                    return (
                      <div
                        key={event._id}
                        className={`
                          text-xs p-1 rounded text-white truncate cursor-pointer
                          ${getEventTypeColor(event.type)}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAdmin && confirm(`Excluir evento "${event.title}"?`)) {
                            handleDeleteEvent(event._id);
                          }
                        }}
                        title={`${event.title}${room ? ` - ${room.name}` : ''}\n${new Date(event.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        {event.title}
                        {room && ` (${room.name})`}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Novo Evento - {selectedDate?.toLocaleDateString('pt-BR')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="maintenance">Manutenção</option>
                    <option value="cleaning">Limpeza</option>
                    <option value="inspection">Inspeção</option>
                    <option value="meeting">Reunião</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sala (opcional)
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Geral</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Criar Evento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedDate(null);
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
