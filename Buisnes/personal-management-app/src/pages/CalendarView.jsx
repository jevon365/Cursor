import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as calendarService from '../services/calendarService';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function weekDays(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    days.push(x);
  }
  return days;
}

function formatDay(date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarView() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const calId = await calendarService.ensureTaskCalendar(token);
      const list = await calendarService.listTasks(token, calId);
      setTasks(list);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const days = weekDays(weekStart);
  const goPrev = () => {
    setWeekStart((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };
  const goNext = () => {
    setWeekStart((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };
  const goToday = () => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    setWeekStart(d);
  };

  const tasksByDay = {};
  days.forEach((d) => {
    tasksByDay[formatDay(d)] = [];
  });
  tasks.forEach((task) => {
    if (!task.due) return;
    const key = task.due.slice(0, 10);
    if (tasksByDay[key]) tasksByDay[key].push(task);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-stone-500">Loading calendar…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-stone-800">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="p-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-1.5 text-sm bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goNext}
            className="p-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700"
          >
            Next
          </button>
          <button
            type="button"
            onClick={loadTasks}
            className="px-3 py-1.5 text-sm bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <p className="text-sm text-stone-500">
        Week of {weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-7 gap-2 overflow-x-auto">
        {days.map((d) => {
          const key = formatDay(d);
          const dayTasks = tasksByDay[key] || [];
          const isToday = key === formatDay(new Date());
          return (
            <div
              key={key}
              className={`min-w-[120px] rounded-xl border p-3 ${
                isToday ? 'border-stone-400 bg-stone-50' : 'border-stone-200 bg-white'
              }`}
            >
              <div className="text-sm font-medium text-stone-700 mb-2">
                {DAY_NAMES[d.getDay()]} {d.getDate()}
              </div>
              <ul className="space-y-1">
                {dayTasks.map((task) => (
                  <li
                    key={task.id}
                    className="text-xs p-2 rounded bg-stone-100 text-stone-800 truncate"
                    title={task.title}
                  >
                    {task.title}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
