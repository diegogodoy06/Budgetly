import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import automationService from '../services/automationService';
import type { AutomationSettings } from '../types/automation';

interface AutomationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AutomationSettings | null;
  onSettingsChange: (settings: AutomationSettings | null) => void;
}

const AutomationSettingsModal: React.FC<AutomationSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings,
  onSettingsChange 
}) => {
  const [formData, setFormData] = useState({
    auto_learning_enabled: true,
    auto_learning_categorization: true,
    auto_learning_beneficiary: true,
    auto_suggest_rules: true,
    min_confidence_score: 0.8
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && settings) {
      setFormData({
        auto_learning_enabled: settings.auto_learning_enabled,
        auto_learning_categorization: settings.auto_learning_categorization,
        auto_learning_beneficiary: settings.auto_learning_beneficiary,
        auto_suggest_rules: settings.auto_suggest_rules,
        min_confidence_score: settings.min_confidence_score
      });
    }
  }, [isOpen, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      let updatedSettings;
      if (settings) {
        // Update existing settings
        updatedSettings = await automationService.updateSettings(formData);
      } else {
        // Create new settings (this might need a different endpoint)
        updatedSettings = await automationService.updateSettings(formData);
      }
      
      onSettingsChange(updatedSettings);
      toast.success('Configurações de automação atualizadas com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error updating automation settings:', error);
      toast.error('Erro ao atualizar configurações de automação');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Configurações de Automação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Auto Learning Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aprendizado Automático</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Ativar aprendizado automático
                  </label>
                  <p className="text-sm text-gray-500">
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

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Aprender categorização
                  </label>
                  <p className="text-sm text-gray-500">
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

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Aprender beneficiários
                  </label>
                  <p className="text-sm text-gray-500">
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

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sugerir regras automaticamente
                  </label>
                  <p className="text-sm text-gray-500">
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Avançadas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                    {Math.round(formData.min_confidence_score * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Define o nível mínimo de confiança necessário para que o sistema sugira uma nova regra automaticamente
                </p>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Como funciona o aprendizado automático?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Categorização:</strong> Quando você altera a categoria de uma transação, o sistema analisa padrões e pode sugerir regras para categorizar transações similares automaticamente.</li>
              <li>• <strong>Beneficiários:</strong> Quando você renomeia um beneficiário, o sistema pode criar regras para renomear transações similares no futuro.</li>
              <li>• <strong>Confiança:</strong> O sistema só sugere regras quando tem alta confiança de que elas serão úteis, baseado no nível configurado.</li>
            </ul>
          </div>

          {/* Current Settings Info */}
          {settings && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Informações das Configurações</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Criado em:</span>{' '}
                  {new Date(settings.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Atualizado em:</span>{' '}
                  {new Date(settings.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationSettingsModal;