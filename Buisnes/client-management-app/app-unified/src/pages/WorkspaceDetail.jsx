import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { workspaceService } from '../services/workspaceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import ProjectStatusBadge from '../components/ProjectStatusBadge';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadWorkspace();
      loadProjects();
    }
  }, [id]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await workspaceService.getById(id);
      setWorkspace(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await workspaceService.getProjects(id);
      setProjects(data);
    } catch (err) {
      console.error('Projects load error:', err);
    }
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

  if (error && !workspace) {
    return (
      <Layout>
        <Link to="/workspaces" className="text-indigo-600 hover:text-indigo-800">← Back to Workspaces</Link>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!workspace) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link to="/workspaces" className="text-indigo-600 hover:text-indigo-800">← Back to Workspaces</Link>
          <Link to={`/workspaces/${id}/edit`}>
            <Button variant="primary">Edit Workspace</Button>
          </Link>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{workspace.name}</h1>
          {workspace.description && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{workspace.description}</p>
            </div>
          )}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
              <p className="text-sm text-gray-900">{workspace.client_name || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-sm text-gray-900">{new Date(workspace.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Projects in Workspace</h2>
            <Link to="/projects/create">
              <Button variant="secondary">+ New Project</Button>
            </Link>
          </div>
          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No projects in this workspace</p>
                <Link to="/projects/create">
                  <Button variant="primary">Create Project</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
