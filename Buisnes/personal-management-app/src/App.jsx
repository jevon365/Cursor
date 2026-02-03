import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from './context/AuthContext';
import KanbanBoard from './pages/KanbanBoard';
import CalendarView from './pages/CalendarView';

const VIEW_KEY = 'personal-management-view';

function App() {
  const { token, logout, isSignedIn } = useAuth();
  const [view, setViewState] = useState(() => localStorage.getItem(VIEW_KEY) || 'kanban');

  const setView = (v) => {
    localStorage.setItem(VIEW_KEY, v);
    setViewState(v);
  };

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    onSuccess: (res) => {
      if (res.access_token) {
        localStorage.setItem('google_access_token', res.access_token);
        if (res.expires_in) {
          const expiry = Date.now() + res.expires_in * 1000;
          localStorage.setItem('google_token_expiry', String(expiry));
        }
        window.location.reload();
      }
    },
    onError: (err) => console.error('Login failed:', err),
  });

  if (!isSignedIn || !token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-200">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Personal Management App</h1>
          <p className="text-stone-600 text-sm mb-6">
            Sign in with Google to sync tasks with your calendar.
          </p>
          <button
            type="button"
            onClick={() => login()}
            className="w-full py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign in with Google
          </button>
          <p className="text-xs text-stone-500 mt-4">
            Add <code className="bg-stone-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in .env for production.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-stone-800">Personal Management App</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'kanban' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            Board
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${view === 'calendar' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 rounded-lg text-sm bg-stone-100 text-stone-600 hover:bg-stone-200"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4">
        {view === 'kanban' && <KanbanBoard />}
        {view === 'calendar' && <CalendarView />}
      </main>
    </div>
  );
}

export default App;
