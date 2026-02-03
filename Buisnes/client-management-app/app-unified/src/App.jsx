import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ClientOnlyRoute from './components/ClientOnlyRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import Requests from './pages/Requests';
import RequestDetail from './pages/RequestDetail';
import CreateRequest from './pages/CreateRequest';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import CreateWorkspace from './pages/CreateWorkspace';
import EditWorkspace from './pages/EditWorkspace';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import CreateTask from './pages/CreateTask';
import UserManagement from './pages/UserManagement';
import Account from './pages/Account';
import LoadingSpinner from './components/LoadingSpinner';

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRoles={['admin', 'client']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute requiredRoles={['admin', 'client']}>
            <Projects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <CreateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute requiredRoles={['admin', 'client']}>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <EditProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute requiredRoles={['admin', 'client']}>
            <Requests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/create"
        element={
          <ProtectedRoute requiredRoles={['admin', 'client']}>
            <ClientOnlyRoute>
              <CreateRequest />
            </ClientOnlyRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:id"
        element={
          <ProtectedRoute requiredRoles={['admin', 'client']}>
            <RequestDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Workspaces />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/create"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <CreateWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:id"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <WorkspaceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspaces/:id/edit"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <EditWorkspace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/create"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <CreateTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <TaskDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kanban"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Navigate to="/tasks" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute requiredRoles={['admin', 'client']}>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<RootRedirect />}
      />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
