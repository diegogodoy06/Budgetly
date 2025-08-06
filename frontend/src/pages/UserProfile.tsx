import React, { useState } from 'react';
import { 
  UserIcon,
  CameraIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/profileAPI';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  
  // Estados para os dados do formulário
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: null as File | null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    // Aplicar máscara para telefone
    if (field === 'phone') {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, '');
      
      // Aplica a máscara (11) 99999-9999
      if (numbers.length <= 11) {
        let masked = numbers;
        if (numbers.length > 2) {
          masked = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        }
        if (numbers.length > 7) {
          masked = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
        value = masked;
      }
    }
    
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      // Salvar dados do perfil
      const profileUpdateData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        avatar: profileData.avatar
      };

      await profileAPI.updateProfile(profileUpdateData);

      // Se há mudança de senha
      if (profileData.currentPassword && profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          toast.error('As senhas não coincidem');
          return;
        }

        await profileAPI.changePassword({
          old_password: profileData.currentPassword,
          new_password: profileData.newPassword
        });

        toast.success('Senha alterada com sucesso!');
      }

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
      
      // Limpar campos de senha
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Restaurar dados originais
    setProfileData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: null,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setAvatarPreview(user?.avatar || null);
    setIsEditing(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Meu Perfil
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar Perfil
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card de Informações Pessoais */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Informações Pessoais
            </h3>
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                    <CameraIcon className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {profileData.first_name} {profileData.last_name}
                </h4>
                <p className="text-sm text-gray-500">{profileData.email}</p>
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1">
                    Clique no ícone da câmera para alterar sua foto
                  </p>
                )}
              </div>
            </div>

            {/* Formulário de dados pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome"
                  />
                ) : (
                  <p className="text-sm text-gray-900 py-2">{profileData.first_name || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sobrenome
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu sobrenome"
                  />
                ) : (
                  <p className="text-sm text-gray-900 py-2">{profileData.last_name || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="seu@email.com"
                  />
                ) : (
                  <p className="text-sm text-gray-900 py-2">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <p className="text-sm text-gray-900 py-2">{profileData.phone || 'Não informado'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Segurança (apenas quando editando) */}
      {isEditing && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-6">
              <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Alterar Senha
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={profileData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite a nova senha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={profileData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirme a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Dica de Segurança:</strong> Use uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
