// Utilitário para debug da API
export const debugAPIState = () => {
  const token = localStorage.getItem('token');
  const workspaceId = localStorage.getItem('current_workspace_id');
  
  console.log('🔍 DEBUG API STATE:');
  console.log('  📋 Token presente:', !!token);
  console.log('  📋 Token (primeiros 20 chars):', token?.substring(0, 20) + '...');
  console.log('  🏢 Workspace ID:', workspaceId);
  console.log('  🌐 API Base URL:', (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000');
  
  return {
    hasToken: !!token,
    hasWorkspace: !!workspaceId,
    token: token?.substring(0, 20) + '...',
    workspaceId,
    apiUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
  };
};

export const testCategoriesAPI = async () => {
  try {
    const debugInfo = debugAPIState();
    console.log('🧪 Testando API de categorias...', debugInfo);
    
    const response = await fetch('http://localhost:8000/api/categories/categories/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Workspace-ID': localStorage.getItem('current_workspace_id') || '',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status, errorText);
      return { error: true, status: response.status, message: errorText };
    }
    
    const data = await response.json();
    console.log('✅ Dados recebidos:', data);
    return { error: false, data };
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    return { error: true, message: 'Network error', details: error };
  }
};
