import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { commentService } from '../services/commentService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import RequestStatusBadge from '../components/RequestStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import Button from '../components/Button';

export default function RequestDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequest();
      loadComments();
    }
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await requestService.getById(id);
      setRequest(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentService.getComments({ request_id: id });
      setComments(data);
    } catch (err) {
      console.error('Comments load error:', err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusUpdateLoading(true);
      await requestService.updateStatus(id, newStatus);
      await loadRequest();
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleCommentSubmit = async (content) => {
    try {
      setCommentLoading(true);
      setCommentError('');
      const newComment = await commentService.create({ request_id: id, content });
      setComments([...comments, newComment]);
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

  if (error && !request) {
    return (
      <Layout>
        <Link to="/requests" className="text-indigo-600 hover:text-indigo-800">← Back to Requests</Link>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!request) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/requests" className="text-indigo-600 hover:text-indigo-800">← Back to Requests</Link>
        {error && <ErrorMessage message={error} />}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
            <div className="flex gap-2">
              <RequestStatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {request.project_title && request.project_id && (
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Project</h3>
                  <Link to={`/projects/${request.project_id}`} className="text-indigo-600 hover:text-indigo-800">
                    {request.project_title}
                  </Link>
                </div>
                {isAdmin && (
                  <Link
                    to={`/tasks/create?project_id=${request.project_id}&request_id=${request.id}`}
                    className="mt-4"
                  >
                    <Button variant="primary" type="button">Create task from this request</Button>
                  </Link>
                )}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                <p className="text-sm text-gray-900 capitalize">{request.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <p className="text-sm text-gray-900">{new Date(request.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                <p className="text-sm text-gray-900">{new Date(request.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Update Status</h3>
              <div className="flex gap-2">
                {['new', 'in-progress', 'completed', 'rejected', 'on-hold'].map((status) => (
                  <Button
                    key={status}
                    variant={request.status === status ? 'primary' : 'secondary'}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={statusUpdateLoading || request.status === status}
                    className="capitalize"
                  >
                    {status.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

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
