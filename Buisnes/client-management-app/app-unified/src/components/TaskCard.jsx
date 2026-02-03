import { Link } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';

export default function TaskCard({ task, onClick }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate < today) {
      return { text: date.toLocaleDateString(), className: 'text-red-600 font-medium' };
    } else if (taskDate.getTime() === today.getTime()) {
      return { text: 'Due today', className: 'text-orange-600 font-medium' };
    } else {
      return { text: date.toLocaleDateString(), className: 'text-gray-600' };
    }
  };

  const dueDateInfo = formatDate(task.due_date);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 text-sm flex-1">{task.title}</h3>
        <PriorityBadge priority={task.priority} />
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center text-gray-500">
          {task.assignee_name ? (
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {task.assignee_name}
            </span>
          ) : (
            <span className="text-gray-400">Unassigned</span>
          )}
        </div>
        {task.due_date && (
          <span className={dueDateInfo.className}>
            {dueDateInfo.text}
          </span>
        )}
      </div>

      {task.project_title && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <Link
            to={`/projects/${task.project_id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            {task.project_title}
          </Link>
        </div>
      )}
    </div>
  );
}
