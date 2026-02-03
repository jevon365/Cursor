import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { workspaceService } from '../services/workspaceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await workspaceService.getAll();
      setWorkspaces(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load workspaces');
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Workspaces</h1>
          <Link to="/workspaces/create">
            <Button variant="primary">+ New Workspace</Button>
          </Link>
        </div>

        {error && <ErrorMessage message={error} />}

        {workspaces.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No workspaces found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                to={`/workspaces/${workspace.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{workspace.name}</h3>
                {workspace.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workspace.description}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Client: {workspace.client_name || 'N/A'}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(workspace.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
