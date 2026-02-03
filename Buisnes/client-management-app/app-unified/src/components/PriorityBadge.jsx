export default function PriorityBadge({ priority }) {
  const priorityConfig = {
    'low': {
      label: 'Low',
      className: 'bg-gray-100 text-gray-800',
    },
    'medium': {
      label: 'Medium',
      className: 'bg-blue-100 text-blue-800',
    },
    'high': {
      label: 'High',
      className: 'bg-orange-100 text-orange-800',
    },
    'urgent': {
      label: 'Urgent',
      className: 'bg-red-100 text-red-800',
    },
  };

  const config = priorityConfig[priority] || {
    label: priority,
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
