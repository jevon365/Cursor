import { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { requestService } from '../services/requestService';
import Form from './Form';
import Input from './Input';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import PriorityBadge from './PriorityBadge';

export default function TaskModal({ task, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee_id: '',
    project_id: '',
    request_id: '',
    due_date: '',
  });
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      loadData();
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee_id: task.assignee_id || '',
        project_id: task.project_id || '',
        request_id: task.request_id || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
      });
    }
  }, [task]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [projectsData, usersData] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);

      if (task?.project_id) {
        const requestsData = await requestService.getAll();
        setRequests(requestsData.filter((r) => r.project_id === task.project_id));
      }
    } catch (err) {
      setError('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updates = {
        ...formData,
        assignee_id: formData.assignee_id || null,
        project_id: formData.project_id || null,
        request_id: formData.request_id || null,
        due_date: formData.due_date || null,
      };
      await taskService.update(task.id, updates);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If project changes, reload requests
    if (name === 'project_id') {
      loadRequestsForProject(value);
    }
  };

  const loadRequestsForProject = async (projectId) => {
    if (!projectId) {
      setRequests([]);
      return;
    }
    try {
      const requestsData = await requestService.getAll();
      setRequests(requestsData.filter((r) => r.project_id === projectId));
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  if (!task) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && <ErrorMessage message={error} className="mb-4" />}

          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {formData.project_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request (Optional)</label>
                  <select
                    name="request_id"
                    value={formData.request_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">No Request</option>
                    {requests.map((request) => (
                      <option key={request.id} value={request.id}>
                        {request.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    name="assignee_id"
                    value={formData.assignee_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
