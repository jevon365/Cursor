import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { projectService } from '../services/projectService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import RequestStatusBadge from '../components/RequestStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import SearchInput from '../components/SearchInput';
import SortSelect from '../components/SortSelect';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import { paginate } from '../utils/pagination';
import { showToast } from '../utils/toast';
import { exportRequestsToCSV } from '../utils/export';

export default function Requests() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    project_id: 'all',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters, searchQuery, sortBy]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [requestsData, projectsData] = await Promise.all([
        requestService.getAll(),
        projectService.getAll(),
      ]);
      setRequests(requestsData);
      setProjects(projectsData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];
    if (filters.status !== 'all') filtered = filtered.filter((r) => r.status === filters.status);
    if (filters.category !== 'all') filtered = filtered.filter((r) => r.category === filters.category);
    if (filters.priority !== 'all') filtered = filtered.filter((r) => r.priority === filters.priority);
    if (filters.project_id !== 'all') filtered = filtered.filter((r) => r.project_id === filters.project_id);
    setFilteredRequests(filtered);
  };

  const handleSelectAll = (e) => {
    setSelectedRequests(e.target.checked ? new Set(filteredRequests.map((r) => r.id)) : new Set());
  };

  const { paginatedItems, totalPages } = paginate(filteredRequests, currentPage, itemsPerPage);

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedRequests.size === 0) return;
    try {
      await Promise.all(Array.from(selectedRequests).map((id) => requestService.updateStatus(id, newStatus)));
      await loadData();
      setSelectedRequests(new Set());
      showToast.success(`Updated ${selectedRequests.size} request(s) successfully`);
    } catch (err) {
      setError('Failed to update requests');
      showToast.error('Failed to update requests');
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
          <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                exportRequestsToCSV(filteredRequests);
                showToast.success('Requests exported successfully');
              }}
            >
              Export CSV
            </Button>
            {hasRole('client') && !hasRole('admin') && (
              <Link to="/requests/create">
                <Button variant="primary">+ New Request</Button>
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
                placeholder="Search requests by title, description, or project..."
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

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4 items-end mb-4">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
                <option value="change">Change</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filters.project_id}
                onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isAdmin && selectedRequests.size > 0 && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-700">{selectedRequests.size} selected</span>
              <Button variant="secondary" onClick={() => handleBulkStatusUpdate('in-progress')}>
                Set In Progress
              </Button>
              <Button variant="secondary" onClick={() => handleBulkStatusUpdate('completed')}>
                Set Completed
              </Button>
              <Button variant="secondary" onClick={() => handleBulkStatusUpdate('on-hold')}>
                Set On Hold
              </Button>
            </div>
          )}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <input type="checkbox" checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0} onChange={handleSelectAll} className="rounded" />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRequests.has(request.id)}
                          onChange={() => {
                            const newSet = new Set(selectedRequests);
                            newSet.has(request.id) ? newSet.delete(request.id) : newSet.add(request.id);
                            setSelectedRequests(newSet);
                          }}
                          className="rounded"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <Link to={`/requests/${request.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        {request.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{request.project_title || 'N/A'}</td>
                    <td className="px-6 py-4"><RequestStatusBadge status={request.status} /></td>
                    <td className="px-6 py-4"><PriorityBadge priority={request.priority} /></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <Link to={`/requests/${request.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                    </td>
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
