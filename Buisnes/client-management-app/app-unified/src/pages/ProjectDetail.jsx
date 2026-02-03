import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import { requestService } from '../services/requestService';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProjectStatusBadge from '../components/ProjectStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import RequestStatusBadge from '../components/RequestStatusBadge';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import Button from '../components/Button';
import AssignClientModal from '../components/AssignClientModal';
import { toast } from 'react-toastify';

export default function ProjectDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [assignClientModalOpen, setAssignClientModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
      loadRequests();
      loadTasks();
      loadComments();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getById(id);
      setProject(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const allRequests = await requestService.getAll();
      setRequests(allRequests.filter((r) => r.project_id === id));
    } catch (err) {
      console.error('Requests load error:', err);
    }
  };

  const loadTasks = async () => {
    try {
      const allTasks = await taskService.getAll({ project_id: id });
      setTasks(allTasks);
    } catch (err) {
      console.error('Tasks load error:', err);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentService.getComments({ project_id: id });
      setComments(data);
    } catch (err) {
      console.error('Comments load error:', err);
    }
  };

  const handleAssignClientSuccess = () => {
    loadProject();
    toast.success('Client assigned');
  };

  const handleCommentSubmit = async (content) => {
    try {
      setCommentLoading(true);
      setCommentError('');
      const newComment = await commentService.create({ project_id: id, content });
      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
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

  if (error && !project) {
    return (
      <Layout>
        <Link to="/projects" className="text-indigo-600 hover:text-indigo-800">← Back to Projects</Link>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!project) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Link to="/projects" className="text-indigo-600 hover:text-indigo-800">← Back to Projects</Link>
          {isAdmin && (
            <Link to={`/projects/${id}/edit`}>
              <Button variant="primary">Edit Project</Button>
            </Link>
          )}
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <div className="flex gap-2">
              <ProjectStatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
          </div>

          {project.description && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-900">{project.client_name ? `${project.client_name}${project.client_email ? ` (${project.client_email})` : ''}` : 'No client assigned'}</p>
                {isAdmin && (
                  <Button variant="secondary" className="text-sm" onClick={() => setAssignClientModalOpen(true)}>
                    {project.client_id ? 'Change client' : 'Assign client'}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-sm text-gray-900">{new Date(project.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-sm text-gray-900">{new Date(project.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Associated Requests</h2>
            </div>
            <div className="p-6">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No requests for this project</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Link
                      key={request.id}
                      to={`/requests/${request.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{request.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                        <RequestStatusBadge status={request.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
            </div>
            <div className="p-6">
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks for this project</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">{task.assignee_name || 'Unassigned'}</p>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <AssignClientModal
          isOpen={assignClientModalOpen}
          onClose={() => setAssignClientModalOpen(false)}
          projectId={id}
          currentClientId={project.client_id}
          onSuccess={handleAssignClientSuccess}
        />

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Comments</h2>
          <div className="mb-8 pb-8 border-b border-gray-200">
            <CommentForm onSubmit={handleCommentSubmit} loading={commentLoading} error={commentError} />
          </div>
          <CommentList comments={comments} loading={false} />
        </div>
      </div>
    </Layout>
  );
}
