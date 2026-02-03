import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { requestService } from '../services/requestService';
import { projectService } from '../services/projectService';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreateRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('project_id');

  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: projectIdParam || '',
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Projects load error:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        ...formData,
        project_id: formData.project_id || null,
      };
      const created = await requestService.create(requestData);
      navigate(`/requests/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/requests" className="text-indigo-600 hover:text-indigo-800 inline-block">
          ← Back to Requests
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Request</h1>

          {error && <ErrorMessage message={error} className="mb-4" />}

          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project (Optional)
                </label>
                {loadingProjects ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">No Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                )}
                {projects.length === 0 && !loadingProjects && (
                  <p className="mt-1 text-sm text-gray-500">
                    No projects available. Requests can be created without a project.
                  </p>
                )}
              </div>

              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title for your request"
                required
                error={errors.title}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of your request (minimum 10 characters)"
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                    <option value="change">Change</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Request'
                  )}
                </Button>
                <Link to="/requests" className="flex-1">
                  <Button type="button" variant="secondary" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
