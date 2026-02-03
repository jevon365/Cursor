import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { workspaceService } from '../services/workspaceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProjectStatusBadge from '../components/ProjectStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SearchInput from '../components/SearchInput';
import SortSelect from '../components/SortSelect';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import { paginate } from '../utils/pagination';
import { showToast } from '../utils/toast';
import { exportProjectsToCSV } from '../utils/export';

export default function Projects() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    workspace_id: 'all',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, filters, searchQuery, sortBy]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projectsData, workspacesData] = await Promise.all([
        projectService.getAll(),
        workspaceService.getAll(),
      ]);
      setProjects(projectsData);
      setWorkspaces(workspacesData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load projects');
      console.error('Projects load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (filters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter((p) => p.priority === filters.priority);
    }

    if (filters.workspace_id !== 'all') {
      filtered = filtered.filter((p) => p.workspace_id === filters.workspace_id);
    }

    setFilteredProjects(filtered);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProjects(new Set(filteredProjects.map((p) => p.id)));
    } else {
      setSelectedProjects(new Set());
    }
  };

  const handleSelectProject = (projectId) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedProjects.size === 0) return;

    try {
      const updates = Array.from(selectedProjects).map((id) =>
        projectService.update(id, { status: newStatus })
      );
      await Promise.all(updates);
      await loadData();
      setSelectedProjects(new Set());
      showToast.success(`Updated ${selectedProjects.size} project(s) successfully`);
    } catch (err) {
      setError('Failed to update projects');
      showToast.error('Failed to update projects');
      console.error('Bulk update error:', err);
    }
  };

  const handleBulkArchive = async () => {
    await handleBulkStatusUpdate('archived');
  };

  const { paginatedItems, totalPages } = paginate(filteredProjects, currentPage, itemsPerPage);

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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                exportProjectsToCSV(filteredProjects);
                showToast.success('Projects exported successfully');
              }}
            >
              Export CSV
            </Button>
            {isAdmin && (
              <Link to="/projects/create">
                <Button variant="primary">+ New Project</Button>
              </Link>
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Search and Sort */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search projects by title, description, or client..."
              />
            </div>
            <div className="w-full sm:w-48">
              <SortSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'created_desc', label: 'Newest First' },
                  { value: 'created_asc', label: 'Oldest First' },
                  { value: 'title_asc', label: 'Title A-Z' },
                  { value: 'title_desc', label: 'Title Z-A' },
                  { value: 'status_asc', label: 'Status A-Z' },
                  { value: 'status_desc', label: 'Status Z-A' },
                  { value: 'priority_asc', label: 'Priority Low-High' },
                  { value: 'priority_desc', label: 'Priority High-Low' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Filters and Bulk Actions */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            {isAdmin && (
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Workspace</label>
                <select
                  value={filters.workspace_id}
                  onChange={(e) => setFilters({ ...filters, workspace_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Workspaces</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isAdmin && selectedProjects.size > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">
                {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
              </span>
              <Button variant="secondary" onClick={handleBulkArchive}>
                Archive Selected
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleBulkStatusUpdate('active')}
              >
                Set Active
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleBulkStatusUpdate('on-hold')}
              >
                Set On Hold
              </Button>
            </div>
          )}
        </div>

        {/* Projects Table */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isAdmin && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                    )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedItems.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProjects.has(project.id)}
                          onChange={() => handleSelectProject(project.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.client_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={project.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/projects/${project.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                      </td>
                    )}
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
