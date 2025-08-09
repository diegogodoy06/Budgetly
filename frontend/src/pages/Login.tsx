import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginRedirect } from '@/hooks/useAuth';
import { EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@budgetly.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const { login } = useAuth();
  useLoginRedirect(); // Hook para redirecionar após login

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      // O redirecionamento é feito pelo hook useLoginRedirect
    } catch (err: any) {
      const message = err.response?.data?.message || 'Credenciais inválidas. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@budgetly.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-soft-100 to-primary-100 dark:from-dark-600 dark:via-dark-500 dark:to-dark-400 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-300 dark:bg-primary-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-primary-200 dark:bg-primary-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Theme toggle button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-full glass-card hover:scale-105 transition-all duration-300 z-10"
        title={darkMode ? 'Modo claro' : 'Modo escuro'}
      >
        {darkMode ? (
          <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Login card */}
      <div className="relative w-full max-w-md p-8 glass-card float-card z-10">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-black text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-black text-gradient mb-2">Budgetly</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Sistema de Controle Financeiro Pessoal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
              Entrar na sua conta
            </h2>
          </div>

          {error && (
            <div className="p-4 rounded-button bg-danger-50/80 dark:bg-danger-900/30 border border-danger-200/50 dark:border-danger-800/50 backdrop-blur-sm">
              <div className="text-sm text-danger-700 dark:text-danger-400 font-medium">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input pr-10"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Demo credentials info */}
          <div className="p-4 rounded-button bg-primary-50/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-800 dark:text-primary-200 font-semibold">Credenciais de Demonstração</p>
                <p className="text-xs text-primary-600 dark:text-primary-300 font-medium">admin@budgetly.com / admin123</p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Usar
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
                Cadastre-se aqui
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
