import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Client Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your projects and requests{' '}
            <span className="text-gray-400">•</span>{' '}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-gray-500">
            <span className="text-gray-400">Admin access?</span>{' '}
            <span className="text-gray-600">Use the same login - your account will show admin features automatically.</span>
          </p>
        </div>
        <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <ErrorMessage message={error} />
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="rounded-t-md"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="rounded-b-md"
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
