import React, { useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import WelcomeScreen from './WelcomeScreen';

interface WorkspaceGuardProps {
  children: React.ReactNode;
}

export const WorkspaceGuard: React.FC<WorkspaceGuardProps> = ({ children }) => {
  const { workspaces, loading, currentWorkspace, setCurrentWorkspace } = useWorkspace();

  // Efeito para selecionar automaticamente um workspace quando necessário
  useEffect(() => {
    if (!loading && workspaces && workspaces.length > 0 && !currentWorkspace) {
      // Se há workspaces mas nenhum selecionado, seleciona o primeiro
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, loading, setCurrentWorkspace]);

  // Mostra loading enquanto carrega
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando workspaces...</p>
        </div>
      </div>
    );
  }

  // Se não tem workspaces, mostra tela de boas-vindas
  if (!workspaces || workspaces.length === 0) {
    return <WelcomeScreen />;
  }

  // Se tem workspaces mas nenhum está selecionado, mostra loading temporário
  if (!currentWorkspace && workspaces.length > 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Configurando workspace...</p>
        </div>
      </div>
    );
  }

  // Se tem workspace selecionado, mostra o conteúdo normal
  return <>{children}</>;
};
