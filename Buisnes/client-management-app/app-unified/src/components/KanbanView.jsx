import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

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

export default function KanbanView({ filteredTasks, onTaskClick, onStatusChange }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    const activeTaskData = filteredTasks.find((t) => t.id === activeId);
    if (!activeTaskData) return;

    const overColumn = statusColumns.find((col) => col.id === overId);

    if (overColumn) {
      if (activeTaskData.status !== overColumn.id) {
        try {
          await onStatusChange(activeId, overColumn.id);
        } catch (err) {
          console.error('Status update error:', err);
        }
      }
    } else {
      const overTask = filteredTasks.find((t) => t.id === overId);
      if (overTask && activeTaskData.status !== overTask.status) {
        try {
          await onStatusChange(activeId, overTask.status);
        } catch (err) {
          console.error('Status update error:', err);
        }
      }
    }
  };

  return (
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
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
