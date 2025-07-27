import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/AuthLayout';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Entrar na sua conta
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Cadastre-se aqui
            </Link>
          </span>
        </div>

        <div className="text-center">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-xs text-gray-600 mb-2">Dados para teste:</p>
            <p className="text-xs text-gray-800">
              <strong>Email:</strong> admin@budgetly.com<br />
              <strong>Senha:</strong> admin123
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};
export default Login;
