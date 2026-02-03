import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SearchInput from '../components/SearchInput';
import SortSelect from '../components/SortSelect';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import ConfirmationModal from '../components/ConfirmationModal';
import { paginate } from '../utils/pagination';
import { showToast } from '../utils/toast';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, user: null, action: null });
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
      showToast.error('Failed to load users');
      console.error('Users load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((u) => {
        const roles = u.roles || (u.role ? [u.role] : []);
        const rolesStr = roles.join(' ').toLowerCase();
        return (
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          rolesStr.includes(query)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'email_asc':
          return a.email.localeCompare(b.email);
        case 'email_desc':
          return b.email.localeCompare(a.email);
        case 'role_asc': {
          const aRoles = (a.roles || (a.role ? [a.role] : [])).join(', ');
          const bRoles = (b.roles || (b.role ? [b.role] : [])).join(', ');
          return aRoles.localeCompare(bRoles);
        }
        case 'role_desc': {
          const aRoles = (a.roles || (a.role ? [a.role] : [])).join(', ');
          const bRoles = (b.roles || (b.role ? [b.role] : [])).join(', ');
          return bRoles.localeCompare(aRoles);
        }
        case 'created_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'created_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleRoleToggle = (user) => {
    const currentRoles = user.roles || (user.role ? [user.role] : []);
    const isAdmin = currentRoles.includes('admin');
    
    setConfirmModal({
      isOpen: true,
      user,
      action: isAdmin ? 'demote' : 'promote'
    });
  };

  const confirmRoleChange = async () => {
    const { user, action } = confirmModal;
    if (!user) return;

    setUpdatingUserId(user.id);
    try {
      const currentRoles = user.roles || (user.role ? [user.role] : []);
      let newRoles;
      
      if (action === 'promote') {
        // Add admin role
        newRoles = [...new Set([...currentRoles, 'admin'])];
      } else {
        // Remove admin role, keep client
        newRoles = currentRoles.filter(role => role !== 'admin');
        if (newRoles.length === 0) {
          newRoles = ['client'];
        }
      }

      await userService.updateRoles(user.id, newRoles);
      showToast.success(`User ${action === 'promote' ? 'promoted to admin' : 'demoted to client'} successfully`);
      
      // Reload users
      await loadUsers();
      setConfirmModal({ isOpen: false, user: null, action: null });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update user role';
      showToast.error(errorMessage);
      console.error('Role update error:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getUserRoles = (user) => {
    return user.roles || (user.role ? [user.role] : []);
  };

  const isUserAdmin = (user) => {
    return getUserRoles(user).includes('admin');
  };

  const isCurrentUser = (user) => {
    return currentUser?.id === user.id;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const { paginatedItems, totalPages } = paginate(filteredUsers, currentPage, itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Search and Sort */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search users by name, email, or role..."
              />
            </div>
            <div className="w-full sm:w-48">
              <SortSelect
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'created_desc', label: 'Newest First' },
                  { value: 'created_asc', label: 'Oldest First' },
                  { value: 'name_asc', label: 'Name A-Z' },
                  { value: 'name_desc', label: 'Name Z-A' },
                  { value: 'email_asc', label: 'Email A-Z' },
                  { value: 'email_desc', label: 'Email Z-A' },
                  { value: 'role_asc', label: 'Role A-Z' },
                  { value: 'role_desc', label: 'Role Z-A' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((user) => {
                    const isAdmin = isUserAdmin(user);
                    const isSelf = isCurrentUser(user);
                    const isUpdating = updatingUserId === user.id;
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                            {isSelf && (
                              <span className="ml-2 text-xs text-gray-500">(You)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {getUserRoles(user).map((role, idx) => (
                              <span key={idx} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {isSelf ? (
                            <span className="text-gray-400 text-xs">Cannot modify own role</span>
                          ) : (
                            <Button
                              variant={isAdmin ? 'danger' : 'primary'}
                              size="sm"
                              onClick={() => handleRoleToggle(user)}
                              disabled={isUpdating}
                              className="text-xs"
                            >
                              {isUpdating ? (
                                <>
                                  <LoadingSpinner size="sm" className="mr-1" />
                                  Updating...
                                </>
                              ) : (
                                isAdmin ? 'Demote to Client' : 'Promote to Admin'
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
          onConfirm={confirmRoleChange}
          title={confirmModal.action === 'promote' ? 'Promote to Admin' : 'Demote to Client'}
          message={
            confirmModal.user
              ? `Are you sure you want to ${confirmModal.action === 'promote' ? 'promote' : 'demote'} ${confirmModal.user.name} (${confirmModal.user.email})?`
              : ''
          }
          confirmText={confirmModal.action === 'promote' ? 'Promote' : 'Demote'}
          cancelText="Cancel"
          variant={confirmModal.action === 'promote' ? 'primary' : 'danger'}
          loading={updatingUserId === confirmModal.user?.id}
        />
      </div>
    </Layout>
  );
}
