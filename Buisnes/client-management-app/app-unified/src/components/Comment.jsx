export default function Comment({ comment }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-indigo-600 font-medium text-sm">{comment.author_name?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{comment.author_name || 'Unknown User'}</p>
            <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
          </div>
        </div>
      </div>
      <div className="ml-11">
        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}
