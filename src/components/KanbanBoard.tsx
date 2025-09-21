import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface KanbanBoardProps {
  cinemaId: Id<"cinemas">;
  isAdmin: boolean;
}

export function KanbanBoard({ cinemaId, isAdmin }: KanbanBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assignedTo: "",
    dueDate: "",
    category: "maintenance" as const,
  });

  const tasks = useQuery(api.tasks.listByCinema, { cinemaId }) || [];
  const rooms = useQuery(api.rooms.listByCinema, { cinemaId }) || [];
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const todoTasks = tasks.filter(task => task.status === "todo");
  const inProgressTasks = tasks.filter(task => task.status === "in_progress");
  const doneTasks = tasks.filter(task => task.status === "done");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTask({
        cinemaId,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
        category: formData.category,
      });
      
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        dueDate: "",
        category: "maintenance",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleStatusChange = async (taskId: Id<"tasks">, newStatus: "todo" | "in_progress" | "done") => {
    await updateTask({ id: taskId, status: newStatus });
  };

  const handleDelete = async (taskId: Id<"tasks">) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      await deleteTask({ id: taskId });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const TaskCard = ({ task }: { task: any }) => {
    const room = task.roomId ? rooms.find(r => r._id === task.roomId) : null;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
            {task.title}
          </h4>
          {isAdmin && (
            <button
              onClick={() => handleDelete(task._id)}
              className="text-gray-400 hover:text-red-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {task.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          
          {room && (
            <span className="text-gray-500 dark:text-gray-400">
              Sala {room.name}
            </span>
          )}
        </div>
        
        {task.assignedTo && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            👤 {task.assignedTo}
          </div>
        )}
        
        {task.dueDate && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </div>
        )}
      </div>
    );
  };

  const Column = ({ title, tasks, status, color }: { 
    title: string; 
    tasks: any[]; 
    status: "todo" | "in-progress" | "done";
    color: string;
  }) => (
    <div className="flex-1 min-w-0">
      <div className={`${color} rounded-lg p-3 mb-4`}>
        <h3 className="font-semibold text-white text-center">
          {title} ({tasks.length})
        </h3>
      </div>
      
      <div className="space-y-2 min-h-[400px]">
        {tasks.map((task) => (
          <div key={task._id}>
            <TaskCard task={task} />
            {isAdmin && (
              <div className="flex gap-1 mb-2">
                {status !== "todo" && (
                  <button
                    onClick={() => handleStatusChange(task._id, "todo")}
                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    ← A Fazer
                  </button>
                )}
                {status !== "in-progress" && (
                  <button
                    onClick={() => handleStatusChange(task._id, "in_progress")}
                    className="text-xs px-2 py-1 bg-blue-200 hover:bg-blue-300 rounded"
                  >
                    Em Progresso
                  </button>
                )}
                {status !== "done" && (
                  <button
                    onClick={() => handleStatusChange(task._id, "done")}
                    className="text-xs px-2 py-1 bg-green-200 hover:bg-green-300 rounded"
                  >
                    Concluído →
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quadro de Tarefas
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Nova Tarefa
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column
          title="A Fazer"
          tasks={todoTasks}
          status="todo"
          color="bg-gray-600"
        />
        <Column
          title="Em Progresso"
          tasks={inProgressTasks}
          status="in-progress"
          color="bg-blue-600"
        />
        <Column
          title="Concluído"
          tasks={doneTasks}
          status="done"
          color="bg-green-600"
        />
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nova Tarefa
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
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
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
                    <option value="maintenance">Manutenção</option>
                    <option value="cleaning">Limpeza</option>
                    <option value="technical">Técnica</option>
                    <option value="administrative">Administrativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Criar Tarefa
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
