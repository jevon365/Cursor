import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { showToast } from '../utils/toast';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  
  // All hooks must be called before any early returns
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'delete'
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Show loading state while auth is being checked (but preserve modal state)
  if (loading && !showDeleteModal) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  // Show error if user is not available (but preserve modal state)
  if (!user && !showDeleteModal) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <ErrorMessage message="Unable to load account information. Please try logging in again." />
        </div>
      </Layout>
    );
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setPasswordError('');
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!validatePassword()) {
      return;
    }

    setPasswordLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      showToast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Password is required to delete account');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      const data = await authService.deleteAccount(deletePassword);
      if (data?.message) showToast.success(data.message);
      else showToast.success('Account deleted successfully');
      // Clear auth state first
      logout();
      // Use window.location.href instead of navigate() to force full page reload
      // This prevents race conditions where components try to render during navigation
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Failed to delete account. Please try again.';
      const fallback = status === 404
        ? 'Account delete endpoint not found. Ensure backend is running and up to date.'
        : status === 401
          ? 'Password is incorrect.'
          : status === 400
            ? (err.response?.data?.error || 'Invalid request.')
            : msg;
      setDeleteError(fallback);
      setShowDeleteModal(false);
      showToast.error(fallback);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roles</label>
              <div className="mt-1 flex gap-2">
                {(user?.roles || (user?.role ? [user.role] : [])).map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab('delete')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'delete'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Delete Account
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                <Form onSubmit={handlePasswordSubmit}>
                  {passwordError && <ErrorMessage message={passwordError} className="mb-4" />}
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                      error={passwordErrors.currentPassword}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password (min 6 characters)"
                      required
                      error={passwordErrors.newPassword}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      required
                      error={passwordErrors.confirmPassword}
                    />
                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={passwordLoading}
                        className="w-full sm:w-auto"
                      >
                        {passwordLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </div>
            )}

            {/* Delete Account Tab */}
            {activeTab === 'delete' && (
              <div>
                <h2 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Once you delete your account, there is no going back. Please be certain.
                  This action cannot be undone and will permanently delete your account and all associated data.
                </p>

                {deleteError && <ErrorMessage message={deleteError} className="mb-4" />}

                <div className="space-y-4">
                  <Input
                    label="Confirm Password"
                    type="password"
                    name="deletePassword"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    placeholder="Enter your password to confirm"
                    required
                  />
                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteModal(true);
                      }}
                      disabled={!deletePassword || deleteLoading}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deleteLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Account'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data."
          confirmText="Yes, Delete Account"
          confirmVariant="danger"
          loading={deleteLoading}
        />
      </div>
    </Layout>
  );
}
