import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { taskService } from '../services/taskService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskFilters from '../components/TaskFilters';
import Button from '../components/Button';

const statusColumns = [
  { id: 'todo', title: 'Todo' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' },
];

function SortableTaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

function KanbanColumn({ id, title, tasks, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const taskIds = tasks.map((t) => t.id);
  
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-indigo-50 border-2 border-indigo-300 border-dashed' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [filters, setFilters] = useState({
    project_id: 'all',
    assignee_id: 'all',
    priority: 'all',
    status: 'all',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.project_id !== 'all') {
      filtered = filtered.filter((t) => t.project_id === filters.project_id);
    }

    if (filters.assignee_id !== 'all') {
      if (filters.assignee_id === 'unassigned') {
        filtered = filtered.filter((t) => !t.assignee_id);
      } else {
        filtered = filtered.filter((t) => t.assignee_id === filters.assignee_id);
      }
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    // Note: Status filter is handled by columns, so we don't filter by status here
    // But we can still apply it if needed for other views

    setFilteredTasks(filtered);
  };

  const getTasksByStatus = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = filteredTasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the task being dragged
    const activeTask = filteredTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column (status change)
    const overColumn = statusColumns.find((col) => col.id === overId);
    
    if (overColumn) {
      // Dropped on a column - change status
      if (activeTask.status !== overColumn.id) {
        try {
          await taskService.updateStatus(activeId, overColumn.id);
          await loadTasks();
        } catch (err) {
          setError('Failed to update task status');
          console.error('Status update error:', err);
        }
      }
    } else {
      // Dropped on another task - check if it's in a different column
      const overTask = filteredTasks.find((t) => t.id === overId);
      if (overTask && activeTask.status !== overTask.status) {
        // Move to the column of the task it was dropped on
        try {
          await taskService.updateStatus(activeId, overTask.status);
          await loadTasks();
        } catch (err) {
          setError('Failed to update task status');
          console.error('Status update error:', err);
        }
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      project_id: 'all',
      assignee_id: 'all',
      priority: 'all',
      status: 'all',
    });
  };

  const handleTaskUpdate = () => {
    loadTasks();
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <div className="flex gap-3">
            <Link to="/tasks/create">
              <Button variant="primary">+ New Task</Button>
            </Link>
            <Link to="/tasks">
              <Button variant="secondary">List View</Button>
            </Link>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TaskFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Kanban Columns */}
          <div className="lg:col-span-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                {statusColumns.map((column) => {
                  const columnTasks = getTasksByStatus(column.id);
                  return (
                    <KanbanColumn
                      key={column.id}
                      id={column.id}
                      title={column.title}
                      tasks={columnTasks}
                      onTaskClick={setSelectedTask}
                    />
                  );
                })}
              </div>
              <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
          />
        )}
      </div>
    </Layout>
  );
}
