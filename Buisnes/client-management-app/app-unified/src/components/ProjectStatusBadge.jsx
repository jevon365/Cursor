export default function ProjectStatusBadge({ status }) {
  const statusConfig = {
    'active': {
      label: 'Active',
      className: 'bg-green-100 text-green-800',
    },
    'on-hold': {
      label: 'On Hold',
      className: 'bg-yellow-100 text-yellow-800',
    },
    'completed': {
      label: 'Completed',
      className: 'bg-blue-100 text-blue-800',
    },
    'archived': {
      label: 'Archived',
      className: 'bg-gray-100 text-gray-800',
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
