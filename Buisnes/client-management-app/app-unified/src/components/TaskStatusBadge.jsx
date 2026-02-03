export default function TaskStatusBadge({ status }) {
  const statusConfig = {
    'todo': {
      label: 'Todo',
      className: 'bg-gray-100 text-gray-800',
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-yellow-100 text-yellow-800',
    },
    'review': {
      label: 'Review',
      className: 'bg-blue-100 text-blue-800',
    },
    'done': {
      label: 'Done',
      className: 'bg-green-100 text-green-800',
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
