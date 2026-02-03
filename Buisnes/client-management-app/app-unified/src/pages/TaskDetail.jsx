import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PriorityBadge from '../components/PriorityBadge';
import TaskStatusBadge from '../components/TaskStatusBadge';
import TaskModal from '../components/TaskModal';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import Button from '../components/Button';

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadTask();
      loadComments();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getById(id);
      setTask(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentService.getComments({ task_id: id });
      setComments(data);
    } catch (err) {
      console.error('Comments load error:', err);
    }
  };

  const handleCommentSubmit = async (content) => {
    try {
      setCommentLoading(true);
      setCommentError('');
      const newComment = await commentService.create({ task_id: id, content });
      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpdate = () => {
    loadTask();
    setShowModal(false);
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

  if (error && !task) {
    return (
      <Layout>
        <Link to="/tasks" className="text-indigo-600 hover:text-indigo-800">← Back to Tasks</Link>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!task) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link to="/tasks" className="text-indigo-600 hover:text-indigo-800">← Back to Tasks</Link>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Edit Task
          </Button>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {task.description && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.project_title && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Project</h3>
                <Link
                  to={`/projects/${task.project_id}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {task.project_title}
                </Link>
              </div>
            )}
            {task.request_title && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Request</h3>
                <Link
                  to={`/requests/${task.request_id}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {task.request_title}
                </Link>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Assignee</h3>
              <p className="text-sm text-gray-900">{task.assignee_name || 'Unassigned'}</p>
            </div>
            {task.due_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                <p className="text-sm text-gray-900">{new Date(task.due_date).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-sm text-gray-900">{new Date(task.created_at).toLocaleDateString()}</p>
            </div>
            {task.completed_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Completed</h3>
                <p className="text-sm text-gray-900">{new Date(task.completed_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Comments</h2>
          <div className="mb-8 pb-8 border-b border-gray-200">
            <CommentForm onSubmit={handleCommentSubmit} loading={commentLoading} error={commentError} />
          </div>
          <CommentList comments={comments} loading={false} />
        </div>

        {showModal && (
          <TaskModal
            task={task}
            onClose={() => setShowModal(false)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </Layout>
  );
}
