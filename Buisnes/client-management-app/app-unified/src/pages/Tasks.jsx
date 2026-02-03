import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { taskService } from '../services/taskService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskFilters from '../components/TaskFilters';
import KanbanView from '../components/KanbanView';
import Button from '../components/Button';

const TASKS_VIEW_KEY = 'tasks_view';

export default function Tasks() {
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem(TASKS_VIEW_KEY);
      return saved === 'list' ? 'list' : 'kanban';
    } catch {
      return 'kanban';
    }
  });
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    project_id: 'all',
    assignee_id: 'all',
    priority: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_VIEW_KEY, viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

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

    if (filters.status !== 'all') {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    setFilteredTasks(filtered);
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

  const handleStatusChange = async (taskId, newStatus) => {
    await taskService.updateStatus(taskId, newStatus);
    await loadTasks();
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
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <div className="flex gap-3">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
            <Link to="/tasks/create">
              <Button variant="primary">+ New Task</Button>
            </Link>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <TaskFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div className="lg:col-span-4">
            {viewMode === 'kanban' ? (
              <KanbanView
                filteredTasks={filteredTasks}
                onTaskClick={setSelectedTask}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <>
                {filteredTasks.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No tasks found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
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
