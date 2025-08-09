import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-purple-50/20 to-pink-50/30 dark:from-primary-900/10 dark:via-purple-900/5 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="p-8">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg animate-float">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gradient">Meu Perfil</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                Gerencie suas informações pessoais e configurações de conta
              </p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-8">
          {/* Personal Information Card */}
          <div className="glass-card p-8 float-card">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                Informações Pessoais
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  placeholder="Seu nome"
                  defaultValue={user?.first_name || "Admin"}
                />
              </div>

              <div>
                <label className="form-label">Sobrenome</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  placeholder="Seu sobrenome"
                  defaultValue={user?.last_name || "User"}
                />
              </div>

              <div>
                <label className="form-label">Nome de usuário</label>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="Nome de usuário"
                  defaultValue={user?.username || "admin"}
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  defaultValue={user?.email || "admin@budgetly.com"}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button className="btn-secondary">
                Cancelar
              </button>
              <button className="btn-primary">
                Salvar Alterações
              </button>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="glass-card p-8 float-card">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <KeyIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                Alterar Senha
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="form-label">Senha atual</label>
                <input
                  type="password"
                  name="current_password"
                  className="form-input"
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div>
                <label className="form-label">Nova senha</label>
                <input
                  type="password"
                  name="new_password"
                  className="form-input"
                  placeholder="Digite sua nova senha"
                />
              </div>

              <div>
                <label className="form-label">Confirmar nova senha</label>
                <input
                  type="password"
                  name="confirm_password"
                  className="form-input"
                  placeholder="Confirme sua nova senha"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button className="btn-secondary">
                Cancelar
              </button>
              <button className="btn-primary">
                Alterar Senha
              </button>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="glass-card p-8 float-card">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                Configurações de Segurança
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50 rounded-card">
                <div>
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    Autenticação de Dois Fatores
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <button className="btn-primary">
                  Ativar 2FA
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50 rounded-card">
                <div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    Sessões Ativas
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Visualize e gerencie sessões ativas em dispositivos
                  </p>
                </div>
                <button className="btn-secondary">
                  Ver Sessões
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
