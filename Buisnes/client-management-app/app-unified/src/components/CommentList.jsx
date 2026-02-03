import Comment from './Comment';
import LoadingSpinner from './LoadingSpinner';

export default function CommentList({ comments, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }
  if (!comments || comments.length === 0) {
    return <div className="text-center py-8 text-gray-500"><p>No comments yet.</p></div>;
  }
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
