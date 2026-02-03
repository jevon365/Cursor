import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

export default function AssignClientModal({ isOpen, onClose, projectId, currentClientId, onSuccess }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(currentClientId || '');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedClientId(currentClientId || '');
      setError('');
      loadClients();
    }
  }, [isOpen, currentClientId]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const users = await userService.getAll();
      const clientUsers = Array.isArray(users)
        ? users.filter((u) => u.role === 'client' || (Array.isArray(u.roles) && u.roles.includes('client')))
        : [];
      setClients(clientUsers);
      if (!currentClientId && clientUsers.length > 0) {
        setSelectedClientId(clientUsers[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientId) return;
    try {
      setSubmitLoading(true);
      setError('');
      await projectService.update(projectId, { client_id: selectedClientId });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign client');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className="relative z-10 inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900" id="assign-client-title">
                Assign client
              </h3>
              <div className="mt-4">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 mb-1">
                      Client
                    </label>
                    <select
                      id="client-select"
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </>
                )}
                {error && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
              <Button type="submit" variant="primary" disabled={loading || submitLoading || !selectedClientId}>
                {submitLoading ? 'Saving...' : 'Assign'}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
