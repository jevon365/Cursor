import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { workspaceService } from '../services/workspaceService';
import { userService } from '../services/userService';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateWorkspace() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', client_id: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingData(true);
      const usersData = await userService.getAll();
      setUsers(usersData.filter((u) => u.role === 'client'));
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoadingData(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.client_id) newErrors.client_id = 'Client is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const created = await workspaceService.create(formData);
      navigate(`/workspaces/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
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
        <Link to="/workspaces" className="text-indigo-600 hover:text-indigo-800">← Back to Workspaces</Link>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Workspace</h1>
          {error && <ErrorMessage message={error} className="mb-4" />}
          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input label="Name" name="name" value={formData.name} onChange={handleChange} required error={errors.name} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client <span className="text-red-500">*</span></label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.client_id ? 'border-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select a client</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
                {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Workspace'}
                </Button>
                <Link to="/workspaces" className="flex-1">
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
