import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { requestService } from '../services/requestService';
import { taskService } from '../services/taskService';
import { workspaceService } from '../services/workspaceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

export default function Dashboard() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [stats, setStats] = useState({
    projects: 0,
    requests: 0,
    tasks: 0,
    workspaces: 0,
    activeProjects: 0,
    pendingRequests: 0,
    activeTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsRes, requestsRes, tasksRes, workspacesRes] = await Promise.allSettled([
        projectService.getAll(),
        requestService.getAll(),
        taskService.getAll(),
        workspaceService.getAll(),
      ]);
      const projects = projectsRes.status === 'fulfilled' ? projectsRes.value : [];
      const requests = requestsRes.status === 'fulfilled' ? requestsRes.value : [];
      const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value : [];
      const workspaces = workspacesRes.status === 'fulfilled' ? workspacesRes.value : [];

      // Calculate stats
      const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
      const newStats = {
        projects: projects.length,
        requests: requests.length,
        tasks: tasks.length,
        workspaces: workspaces.length,
        activeProjects: activeProjectsCount,
        pendingRequests: requests.filter((r) => r.status === 'new' || r.status === 'in-progress').length,
        activeTasks: tasks.filter((t) => t.status === 'todo' || t.status === 'in-progress').length,
        activeProjectsCount: activeProjectsCount,
        onHoldProjects: projects.filter((p) => p.status === 'on-hold').length,
        completedProjects: projects.filter((p) => p.status === 'completed').length,
        archivedProjects: projects.filter((p) => p.status === 'archived').length,
      };

      setStats(newStats);

      // Create recent activity feed (last 10 items)
      const activity = [];
      
      // Add recent projects
      projects.slice(0, 5).forEach((project) => {
        activity.push({
          type: 'project',
          id: project.id,
          title: project.title,
          action: 'created',
          timestamp: project.created_at,
          link: `/projects/${project.id}`,
        });
      });

      // Add recent requests
      requests.slice(0, 5).forEach((request) => {
        activity.push({
          type: 'request',
          id: request.id,
          title: request.title,
          action: 'created',
          timestamp: request.created_at,
          link: `/requests/${request.id}`,
        });
      });

      // Sort by timestamp and take most recent 10
      activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activity.slice(0, 10));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate project status distribution
  const projectStatusData = async () => {
    try {
      const projects = await projectService.getAll();
      return {
        active: projects.filter((p) => p.status === 'active').length,
        'on-hold': projects.filter((p) => p.status === 'on-hold').length,
        completed: projects.filter((p) => p.status === 'completed').length,
        archived: projects.filter((p) => p.status === 'archived').length,
      };
    } catch (err) {
      return { active: 0, 'on-hold': 0, completed: 0, archived: 0 };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {isAdmin && (
            <div className="flex gap-3">
              <Link to="/projects/create">
                <Button variant="primary">+ New Project</Button>
              </Link>
              <Link to="/workspaces/create">
                <Button variant="secondary">+ New Workspace</Button>
              </Link>
            </div>
          )}
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.projects}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.activeProjects} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.requests}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pendingRequests} pending</p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.tasks}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats.activeTasks} active</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Workspaces</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.workspaces}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Active</span>
                  <span className="text-gray-900 font-medium">{stats.activeProjectsCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.activeProjectsCount / (stats.projects || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">On Hold</span>
                  <span className="text-gray-900 font-medium">{stats.onHoldProjects}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(stats.onHoldProjects / (stats.projects || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Completed</span>
                  <span className="text-gray-900 font-medium">{stats.completedProjects}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(stats.completedProjects / (stats.projects || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Archived</span>
                  <span className="text-gray-900 font-medium">{stats.archivedProjects}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-500 h-2 rounded-full"
                    style={{ width: `${(stats.archivedProjects / (stats.projects || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((item, index) => (
                    <Link
                      key={`${item.type}-${item.id}-${index}`}
                      to={item.link}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {item.type === 'project' ? (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.type} {item.action} • {formatTimeAgo(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
