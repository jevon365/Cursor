/**
 * Google Calendar API client for task storage.
 * Tasks are stored as events on a dedicated "Task Manager" calendar.
 * Task metadata (status, progress, labels) is stored in extended properties.
 */

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const TASK_CALENDAR_SUMMARY = 'Task Manager';

const TASK_STATUS = { TODO: 'todo', IN_PROGRESS: 'in-progress', DONE: 'done' };
export { TASK_STATUS };

const STATUS_KEY = 'taskStatus';
const PROGRESS_KEY = 'taskProgress';
const LABELS_KEY = 'taskLabels';
const PRIVATE_PREFIX = 'private-';

function privateKey(name) {
  return PRIVATE_PREFIX + name;
}

async function request(token, path, options = {}) {
  const url = path.startsWith('http') ? path : `${CALENDAR_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = new Error(res.statusText || 'Calendar API error');
    err.status = res.status;
    err.body = await res.text();
    throw err;
  }
  return res.json ? res.json() : res;
}

/**
 * Find or create the "Task Manager" calendar. Returns calendar id.
 */
export async function ensureTaskCalendar(token) {
  const list = await request(token, '/users/me/calendarList');
  const found = list.items?.find(
    (c) => c.summary === TASK_CALENDAR_SUMMARY && !c.primary
  );
  if (found) return found.id;

  const created = await request(token, '/calendars', {
    method: 'POST',
    body: JSON.stringify({
      summary: TASK_CALENDAR_SUMMARY,
      description: 'Tasks for Personal Management App',
    }),
  });
  return created.id;
}

/**
 * Map a Calendar API event to our task shape.
 */
function eventToTask(event) {
  const ext = event.extendedProperties?.private || {};
  const status = ext[privateKey(STATUS_KEY)] || TASK_STATUS.TODO;
  const progress = parseInt(ext[privateKey(PROGRESS_KEY)] || '0', 10);
  let labels = [];
  try {
    const raw = ext[privateKey(LABELS_KEY)];
    if (raw) labels = JSON.parse(raw);
  } catch (_) {}

  const start = event.start?.dateTime || event.start?.date;
  const due = start ? new Date(start).toISOString() : null;

  return {
    id: event.id,
    title: event.summary || 'Untitled',
    description: event.description || '',
    status,
    progress: Number.isNaN(progress) ? 0 : progress,
    labels,
    due,
    updated: event.updated,
  };
}

/**
 * Build event payload for create/update from task.
 */
function taskToEventBody(task, isAllDay = true) {
  const due = task.due ? new Date(task.due) : new Date();
  const dateStr = due.toISOString().slice(0, 10);
  const ext = {
    [privateKey(STATUS_KEY)]: task.status || TASK_STATUS.TODO,
    [privateKey(PROGRESS_KEY)]: String(task.progress ?? 0),
    [privateKey(LABELS_KEY)]: JSON.stringify(task.labels || []),
  };

  if (isAllDay) {
    return {
      summary: task.title,
      description: task.description || '',
      start: { date: dateStr },
      end: { date: dateStr },
      extendedProperties: { private: ext },
    };
  }
  const start = due.toISOString();
  const end = new Date(due.getTime() + 60 * 60 * 1000).toISOString();
  return {
    summary: task.title,
    description: task.description || '',
    start: { dateTime: start, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: end, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    extendedProperties: { private: ext },
  };
}

/**
 * List all task events from the given calendar (default: primary then Task Manager).
 */
export async function listTasks(token, calendarId) {
  if (!calendarId) {
    calendarId = await ensureTaskCalendar(token);
  }
  const timeMin = new Date();
  timeMin.setFullYear(timeMin.getFullYear() - 1);
  const res = await request(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events?` +
      `singleEvents=true&orderBy=startTime&timeMin=${timeMin.toISOString()}&maxResults=500`
  );
  const items = res.items || [];
  return items.map(eventToTask);
}

/**
 * Create a new task (event) on the task calendar.
 */
export async function createTask(token, task, calendarId) {
  if (!calendarId) {
    calendarId = await ensureTaskCalendar(token);
  }
  const body = taskToEventBody(task);
  const event = await request(token, `/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return eventToTask(event);
}

/**
 * Update an existing task (event).
 */
export async function updateTask(token, calendarId, eventId, task) {
  const body = taskToEventBody(task);
  const event = await request(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
  return eventToTask(event);
}

/**
 * Update only task status (for drag-drop).
 */
export async function updateTaskStatus(token, calendarId, eventId, status) {
  const res = await request(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`
  );
  const current = eventToTask(res);
  return updateTask(token, calendarId, eventId, { ...current, status });
}

/**
 * Delete a task (event).
 */
export async function deleteTask(token, calendarId, eventId) {
  await request(
    token,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE' }
  );
}
