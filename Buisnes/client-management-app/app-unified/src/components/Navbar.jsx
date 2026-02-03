import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { user, logout, hasRole, roles } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const showClient = hasRole('client');
  const showAdmin = hasRole('admin');

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold">
              Management App
            </Link>
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/projects')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/requests"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/requests')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  Requests
                </Link>
                {showClient && !showAdmin && (
                  <Link
                    to="/requests/create"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/requests/create')
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                    }`}
                  >
                    New Request
                  </Link>
                )}
                {showAdmin && (
                  <>
                    <Link
                      to="/workspaces"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/workspaces')
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                      }`}
                    >
                      Workspaces
                    </Link>
                    <Link
                      to="/tasks"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/tasks') || isActive('/kanban')
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                      }`}
                    >
                      Tasks
                    </Link>
                    <Link
                      to="/users"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/users')
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                      }`}
                    >
                      Users
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-sm">{user.name}</span>
                  {roles.map((role) => (
                    <span key={role} className="text-xs bg-indigo-700 px-2 py-1 rounded">
                      {role}
                    </span>
                  ))}
                </div>
                <Link
                  to="/account"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/account')
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  }`}
                  title="Account Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
