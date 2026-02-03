import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { projectService } from '../services/projectService';
import { workspaceService } from '../services/workspaceService';
import { userService } from '../services/userService';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: '',
    workspace_id: '',
    status: 'active',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [projectData, usersData, workspacesData] = await Promise.all([
        projectService.getById(id),
        userService.getAll(),
        workspaceService.getAll(),
      ]);
      setProject(projectData);
      setFormData({
        title: projectData.title || '',
        description: projectData.description || '',
        client_id: projectData.client_id || '',
        workspace_id: projectData.workspace_id || '',
        status: projectData.status || 'active',
        priority: projectData.priority || 'medium',
      });
      setUsers(usersData.filter((u) => u.role === 'client'));
      setWorkspaces(workspacesData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
      console.error('Data load error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
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
      await projectService.update(id, {
        ...formData,
        workspace_id: formData.workspace_id || null,
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
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

  if (!project) {
    return (
      <Layout>
        <ErrorMessage message={error || 'Project not found'} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to={`/projects/${id}`} className="text-indigo-600 hover:text-indigo-800 inline-block">
          ← Back to Project
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Project</h1>
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
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.client_id ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select a client</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workspace</label>
                <select
                  name="workspace_id"
                  value={formData.workspace_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No Workspace</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link to={`/projects/${id}`} className="flex-1">
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
