import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CogIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import automationService from '../services/automationService';
import type { AutomationSettings } from '../types/automation';
import { useWorkspace } from '../contexts/WorkspaceContext';

const WorkspaceSettingsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [formData, setFormData] = useState({
    auto_learning_enabled: true,
    auto_learning_categorization: true,
    auto_learning_beneficiary: true,
    auto_suggest_rules: true,
    min_confidence_score: 0.8
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await automationService.getSettings();
      setSettings(settingsData);
      if (settingsData) {
        setFormData({
          auto_learning_enabled: settingsData.auto_learning_enabled,
          auto_learning_categorization: settingsData.auto_learning_categorization,
          auto_learning_beneficiary: settingsData.auto_learning_beneficiary,
          auto_suggest_rules: settingsData.auto_suggest_rules,
          min_confidence_score: settingsData.min_confidence_score
        });
      }
    } catch (error) {
      console.error('Error loading automation settings:', error);
      // It's OK if settings don't exist yet, we'll create them on save
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const updatedSettings = await automationService.updateSettings(formData);
      setSettings(updatedSettings);
      toast.success('Configurações do workspace atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating workspace settings:', error);
      toast.error('Erro ao atualizar configurações do workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <CogIcon className="h-6 w-6 text-gray-500 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Configurações do Workspace
                </h1>
                <p className="text-sm text-gray-500">
                  {currentWorkspace?.nome || 'Workspace Atual'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Automation Settings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Configurações de Automação</h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure como o sistema de automação funciona neste workspace
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Auto Learning Section */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  Aprendizado Automático
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Ativar aprendizado automático
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Permite que o sistema aprenda com suas ações manuais e sugira novas regras
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.auto_learning_enabled}
                      onChange={(e) => handleInputChange('auto_learning_enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Aprender categorização
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          Cria regras automáticas quando você categoriza transações manualmente
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.auto_learning_categorization}
                        onChange={(e) => handleInputChange('auto_learning_categorization', e.target.checked)}
                        disabled={!formData.auto_learning_enabled}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Aprender beneficiários
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          Cria regras automáticas quando você renomeia beneficiários
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.auto_learning_beneficiary}
                        onChange={(e) => handleInputChange('auto_learning_beneficiary', e.target.checked)}
                        disabled={!formData.auto_learning_enabled}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Sugerir regras automaticamente
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Mostra notificações com sugestões de novas regras baseadas no seu comportamento
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.auto_suggest_rules}
                      onChange={(e) => handleInputChange('auto_suggest_rules', e.target.checked)}
                      disabled={!formData.auto_learning_enabled}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Confidence Score Section */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2" />
                  Configurações Avançadas
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Nível mínimo de confiança
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={formData.min_confidence_score}
                      onChange={(e) => handleInputChange('min_confidence_score', parseFloat(e.target.value))}
                      disabled={!formData.auto_learning_enabled}
                      className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 slider"
                    />
                    <span className="text-sm font-semibold text-blue-600 min-w-[3rem] bg-blue-100 px-2 py-1 rounded">
                      {Math.round(formData.min_confidence_score * 100)}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Define o nível mínimo de confiança necessário para que o sistema sugira uma nova regra automaticamente
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-3">Como funciona o aprendizado automático?</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="font-semibold mr-2">Categorização:</span>
                    <span>Quando você altera a categoria de uma transação, o sistema analisa padrões e pode sugerir regras para categorizar transações similares automaticamente.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold mr-2">Beneficiários:</span>
                    <span>Quando você renomeia um beneficiário, o sistema pode criar regras para renomear transações similares no futuro.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold mr-2">Confiança:</span>
                    <span>O sistema só sugere regras quando tem alta confiança de que elas serão úteis, baseado no nível configurado.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Settings Info */}
          {settings && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Informações das Configurações</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Criado em:</span>
                  <span>{new Date(settings.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Atualizado em:</span>
                  <span>{new Date(settings.updated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </div>
              ) : (
                'Salvar Configurações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;