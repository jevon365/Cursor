import { useState, useEffect } from 'react';
import { TASK_STATUS } from '../services/calendarService';

export default function TaskModal({ task, onClose, onSave, onDelete, isNew }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(TASK_STATUS.TODO);
  const [progress, setProgress] = useState(0);
  const [due, setDue] = useState('');
  const [labelsStr, setLabelsStr] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || TASK_STATUS.TODO);
      setProgress(task.progress ?? 0);
      setDue(task.due ? task.due.slice(0, 10) : '');
      setLabelsStr(Array.isArray(task.labels) ? task.labels.join(', ') : '');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const labels = labelsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      ...task,
      title: title.trim() || 'Untitled',
      description: description.trim(),
      status,
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
      due: due || null,
      labels,
    });
    onClose();
  };

  const handleDelete = () => {
    if (isNew) {
      onClose();
      return;
    }
    if (typeof onDelete === 'function' && window.confirm('Delete this task?')) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">
            {isNew ? 'New task' : 'Edit task'}
          </h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
              placeholder="Task title"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 min-h-[80px]"
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
            >
              <option value={TASK_STATUS.TODO}>To do</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In progress</option>
              <option value={TASK_STATUS.DONE}>Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Progress %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value) || 0)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Due date</label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value || '')}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Labels (comma-separated)</label>
            <input
              type="text"
              value={labelsStr}
              onChange={(e) => setLabelsStr(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
              placeholder="work, personal, ..."
            />
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <div>
              {!isNew && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
