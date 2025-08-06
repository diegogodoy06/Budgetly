import React, { useState } from 'react';
import { 
  CogIcon,
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const AppSettings: React.FC = () => {
  // Estados para as configurações
  const [settings, setSettings] = useState({
    // Configurações gerais
    language: 'pt-BR',
    currency: 'BRL',
    theme: 'light',
    
    // Notificações
    emailNotifications: true,
    pushNotifications: false,
    budgetAlerts: true,
    transactionAlerts: true,
    
    // Privacidade e Segurança
    twoFactorAuth: false,
    sessionTimeout: 30,
    dataBackup: true,
    analyticsTracking: false,
    
    // Dashboard
    defaultDashboardView: 'overview',
    showQuickActions: true,
    compactMode: false,
    
    // Relatórios
    defaultReportPeriod: 'monthly',
    includeInactiveCategories: false,
    autoGenerateReports: false
  });

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Aqui você salvaria as configurações no backend
    console.log('Configurações salvas:', settings);
    alert('Configurações salvas com sucesso!');
  };

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label, 
    description 
  }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Configurações da Aplicação
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Personalize a experiência do Budgetly de acordo com suas preferências
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleSaveSettings}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Salvar Configurações
          </button>
        </div>
      </div>

      {/* Configurações Gerais */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <CogIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Configurações Gerais
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moeda Padrão
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tema da Interface
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <BellIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Notificações
            </h3>
          </div>
          
          <div className="space-y-6">
            <ToggleSwitch
              enabled={settings.emailNotifications}
              onChange={(value) => handleSettingChange('emailNotifications', value)}
              label="Notificações por Email"
              description="Receber resumos financeiros e alertas por email"
            />
            
            <ToggleSwitch
              enabled={settings.pushNotifications}
              onChange={(value) => handleSettingChange('pushNotifications', value)}
              label="Notificações Push"
              description="Receber notificações em tempo real no navegador"
            />
            
            <ToggleSwitch
              enabled={settings.budgetAlerts}
              onChange={(value) => handleSettingChange('budgetAlerts', value)}
              label="Alertas de Orçamento"
              description="Ser notificado quando ultrapassar limites de orçamento"
            />
            
            <ToggleSwitch
              enabled={settings.transactionAlerts}
              onChange={(value) => handleSettingChange('transactionAlerts', value)}
              label="Alertas de Transação"
              description="Notificações para novas transações e gastos importantes"
            />
          </div>
        </div>
      </div>

      {/* Privacidade e Segurança */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Privacidade e Segurança
            </h3>
          </div>
          
          <div className="space-y-6">
            <ToggleSwitch
              enabled={settings.twoFactorAuth}
              onChange={(value) => handleSettingChange('twoFactorAuth', value)}
              label="Autenticação de Dois Fatores"
              description="Adicionar uma camada extra de segurança à sua conta"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeout de Sessão (minutos)
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
                <option value={0}>Sem timeout</option>
              </select>
            </div>
            
            <ToggleSwitch
              enabled={settings.dataBackup}
              onChange={(value) => handleSettingChange('dataBackup', value)}
              label="Backup Automático"
              description="Fazer backup dos seus dados automaticamente"
            />
            
            <ToggleSwitch
              enabled={settings.analyticsTracking}
              onChange={(value) => handleSettingChange('analyticsTracking', value)}
              label="Análise de Uso"
              description="Permitir coleta de dados para melhorar a aplicação"
            />
          </div>
        </div>
      </div>

      {/* Interface do Dashboard */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Interface do Dashboard
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visualização Padrão
              </label>
              <select
                value={settings.defaultDashboardView}
                onChange={(e) => handleSettingChange('defaultDashboardView', e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Visão Geral</option>
                <option value="detailed">Detalhada</option>
                <option value="simple">Simplificada</option>
              </select>
            </div>
            
            <ToggleSwitch
              enabled={settings.showQuickActions}
              onChange={(value) => handleSettingChange('showQuickActions', value)}
              label="Ações Rápidas"
              description="Mostrar botões de ações rápidas no dashboard"
            />
            
            <ToggleSwitch
              enabled={settings.compactMode}
              onChange={(value) => handleSettingChange('compactMode', value)}
              label="Modo Compacto"
              description="Reduzir espaçamentos para mostrar mais informações"
            />
          </div>
        </div>
      </div>

      {/* Relatórios */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Configurações de Relatórios
            </h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período Padrão dos Relatórios
              </label>
              <select
                value={settings.defaultReportPeriod}
                onChange={(e) => handleSettingChange('defaultReportPeriod', e.target.value)}
                className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            
            <ToggleSwitch
              enabled={settings.includeInactiveCategories}
              onChange={(value) => handleSettingChange('includeInactiveCategories', value)}
              label="Incluir Categorias Inativas"
              description="Mostrar categorias inativas nos relatórios"
            />
            
            <ToggleSwitch
              enabled={settings.autoGenerateReports}
              onChange={(value) => handleSettingChange('autoGenerateReports', value)}
              label="Gerar Relatórios Automaticamente"
              description="Criar relatórios mensais automaticamente"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
