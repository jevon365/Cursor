import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function TaskFilters({ filters, onFilterChange, onClearFilters }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        projectService.getAll(),
        userService.getAll(),
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load filter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters =
    filters.project_id !== 'all' ||
    filters.assignee_id !== 'all' ||
    filters.priority !== 'all' ||
    filters.status !== 'all';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
        <select
          value={filters.project_id}
          onChange={(e) => onFilterChange('project_id', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
        <select
          value={filters.assignee_id}
          onChange={(e) => onFilterChange('assignee_id', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="all">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}
