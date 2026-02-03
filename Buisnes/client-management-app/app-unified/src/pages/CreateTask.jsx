import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { requestService } from '../services/requestService';
import { userService } from '../services/userService';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('project_id');
  const requestIdParam = searchParams.get('request_id');

  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee_id: '',
    project_id: projectIdParam || '',
    request_id: requestIdParam || '',
    due_date: '',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      loadRequestsForProject(formData.project_id);
    }
  }, [formData.project_id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [projectsData, usersData] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);

      if (projectIdParam) {
        const requestsData = await requestService.getAll();
        setRequests(requestsData.filter((r) => r.project_id === projectIdParam));
      }
    } catch (err) {
      setError('Failed to load form data');
    } finally {
      setLoadingData(false);
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

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        assignee_id: formData.assignee_id || null,
        project_id: formData.project_id || null,
        request_id: formData.request_id || null,
        due_date: formData.due_date || null,
      };
      const created = await taskService.create(taskData);
      navigate(`/tasks/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (loadingData) {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/tasks" className="text-indigo-600 hover:text-indigo-800">← Back to Tasks</Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Task</h1>

          {error && <ErrorMessage message={error} className="mb-4" />}

          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                error={errors.title}
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
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
                <Link to="/tasks" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">Cancel</Button>
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
