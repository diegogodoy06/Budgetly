import api from './api';

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: File | null;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export const profileAPI = {
  // Atualizar perfil do usuário
  updateProfile: async (data: UpdateProfileData) => {
    const formData = new FormData();
    
    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await api.put('/api/auth/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Alterar senha
  changePassword: async (data: ChangePasswordData) => {
    const response = await api.post('/api/auth/change-password/', data);
    return response.data;
  },

  // Obter perfil atual
  getProfile: async () => {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  },
};
