import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Hook customizado para gerenciar autenticação
 * Inclui navegação automática e validação de token
 */
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Salva a rota atual para redirecionamento após login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook para redirecionamento após login
 */
export const useLoginRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook para validação de autenticação
 * Para Token authentication do Django, a validação é feita via API
 */
export const useTokenValidation = () => {
  const { logout } = useAuth();

  const validateTokenViaAPI = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return false;
      }

      // Faz uma requisição simples para verificar se o token é válido
      const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : '';
      const response = await fetch(`${API_URL}/api/auth/profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        logout();
        return false;
      }

      return true;
    } catch {
      logout();
      return false;
    }
  };

  return { validateTokenViaAPI };
};
