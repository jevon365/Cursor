export default function TaskCard({ task, onClick }) {
  const due = task.due
    ? new Date(task.due).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: task.due.slice(0, 4) !== String(new Date().getFullYear()) ? 'numeric' : undefined,
      })
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow transition-shadow cursor-pointer text-left"
    >
      <h3 className="font-medium text-stone-900 text-sm truncate">{task.title}</h3>
      {task.description && (
        <p className="text-xs text-stone-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2 gap-2">
        {task.progress !== undefined && task.progress > 0 && (
          <span className="text-xs text-stone-500">{task.progress}%</span>
        )}
        {due && (
          <span className="text-xs text-stone-500 ml-auto">{due}</span>
        )}
      </div>
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.labels.slice(0, 3).map((l) => (
            <span
              key={l}
              className="text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-600"
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
