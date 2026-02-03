import { useState } from 'react';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

export default function CommentForm({ onSubmit, loading = false, error = '' }) {
  const [content, setContent] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Add a comment</label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading || !content.trim()}>
          {loading ? <><LoadingSpinner size="sm" className="mr-2" />Posting...</> : 'Post Comment'}
        </Button>
      </div>
    </form>
  );
}
