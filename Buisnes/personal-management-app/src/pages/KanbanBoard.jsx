import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../context/AuthContext';
import * as calendarService from '../services/calendarService';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { id: calendarService.TASK_STATUS.TODO, title: 'To do' },
  { id: calendarService.TASK_STATUS.IN_PROGRESS, title: 'In progress' },
  { id: calendarService.TASK_STATUS.DONE, title: 'Done' },
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
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-stone-100 rounded-xl p-4 transition-colors ${
        isOver ? 'ring-2 ring-stone-400 ring-offset-2' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-stone-700">{title}</h3>
        <span className="text-sm text-stone-500 bg-white px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {tasks.map((task) => (
          <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-6 text-stone-400 text-sm">No tasks</div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [calendarId, setCalendarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [modalTask, setModalTask] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const loadTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const calId = await calendarService.ensureTaskCalendar(token);
      setCalendarId(calId);
      const list = await calendarService.listTasks(token, calId);
      setTasks(list);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !token || !calendarId) return;

    const activeId = active.id;
    const overId = over.id;
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    const overColumn = COLUMNS.find((col) => col.id === overId);
    const newStatus = overColumn
      ? overColumn.id
      : (tasks.find((t) => t.id === overId)?.status ?? task.status);

    if (newStatus === task.status) return;

    try {
      await calendarService.updateTaskStatus(token, calendarId, task.id, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      setError('Failed to update status');
      loadTasks();
    }
  };

  const handleSaveTask = async (taskData) => {
    if (!token || !calendarId) return;
    try {
      if (isNewTask) {
        const created = await calendarService.createTask(token, taskData, calendarId);
        setTasks((prev) => [...prev, created]);
      } else {
        const updated = await calendarService.updateTask(
          token,
          calendarId,
          taskData.id,
          taskData
        );
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }
      setModalTask(null);
      setIsNewTask(false);
    } catch (err) {
      setError(err.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask || !token || !calendarId) return;
    try {
      await calendarService.deleteTask(token, calendarId, selectedTask.id);
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setSelectedTask(null);
      setModalTask(null);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const openNewTask = () => {
    setModalTask({
      title: '',
      description: '',
      status: calendarService.TASK_STATUS.TODO,
      progress: 0,
      due: null,
      labels: [],
    });
    setIsNewTask(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-stone-500">Loading tasks…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-stone-800">Board</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadTasks}
            className="px-3 py-1.5 text-sm bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={openNewTask}
            className="px-3 py-1.5 text-sm bg-stone-800 text-white rounded-lg hover:bg-stone-700"
          >
            New task
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={getTasksByStatus(col.id)}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setModalTask(task);
                setIsNewTask(false);
              }}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      {modalTask && (
        <TaskModal
          task={modalTask}
          isNew={isNewTask}
          onClose={() => {
            setModalTask(null);
            setSelectedTask(null);
            setIsNewTask(false);
          }}
          onSave={handleSaveTask}
          onDelete={isNewTask ? undefined : handleDeleteTask}
        />
      )}
    </div>
  );
}
