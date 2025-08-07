import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/types';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // Função para salvar dados de autenticação
  const setAuthData = (userData: User, authToken: string, refreshToken?: string) => {
    console.log('💾 Salvando dados de autenticação:', {
      userEmail: userData.email,
      tokenLength: authToken.length,
      hasRefreshToken: !!refreshToken
    });
    
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    console.log('✅ Dados salvos no estado e localStorage');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        console.log('🔐 AuthContext - Inicializando auth, token salvo:', !!savedToken);
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          console.log('🔍 Token e usuário encontrados, validando...');
          // Verifica se o token ainda é válido fazendo uma requisição ao perfil
          try {
            console.log('📞 Fazendo requisição para validar token...');
            const userProfile = await authAPI.getProfile();
            console.log('✅ Token válido, definindo dados de autenticação');
            setToken(savedToken);
            setUser(userProfile);
          } catch (error) {
            console.log('❌ Token inválido, limpando dados:', error);
            // Token inválido, limpa os dados
            clearAuthData();
          }
        } else {
          console.log('⚠️ Token ou usuário não encontrados no localStorage');
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        clearAuthData();
      } finally {
        console.log('🏁 Inicialização de autenticação concluída');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      console.log('🔐 Iniciando processo de login...');
      const response = await authAPI.login(data);
      console.log('✅ Login bem-sucedido, resposta recebida:', {
        hasUser: !!response.user,
        hasToken: !!response.token,
        userEmail: response.user?.email
      });
      
      setAuthData(response.user, response.token, response.refresh);
      
      console.log('💾 Dados de autenticação salvos no localStorage');
      
      // Teste imediato após login
      console.log('🧪 Testando autenticação imediatamente após login...');
      try {
        const testResult = await authAPI.testAuth();
        console.log('✅ Teste de autenticação passou:', testResult);
      } catch (testError) {
        console.error('❌ Teste de autenticação falhou imediatamente após login:', testError);
      }
      
      toast.success(response.message || 'Login realizado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(data);
      
      setAuthData(response.user, response.token);
      
      toast.success(response.message || 'Conta criada com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearAuthData();
      toast.success('Logout realizado com sucesso!');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  console.log('🔍 AuthContext value atualizado:', {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated: !!user && !!token,
    isLoading
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
