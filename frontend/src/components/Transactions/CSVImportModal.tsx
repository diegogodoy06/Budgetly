import React, { useState, useRef } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, CheckIcon } from '@heroicons/react/24/outline';
import { transactionsAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface CSVPreviewData {
  headers: string[];
  preview_rows: string[][];
  total_rows: number;
  delimiter: string;
  suggested_mapping: Record<string, number>;
}

interface ColumnMapping {
  date?: number;
  amount?: number;
  credit?: number;
  debit?: number;
  description?: number;
  beneficiary?: number;
}

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Array<{ id: number; nome: string; tipo: string; banco?: string }>;
  onImportSuccess: () => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onImportSuccess
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing' | 'success'>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVPreviewData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    imported_count: number;
    skipped_count: number;
    total_rows: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Apenas arquivos CSV são aceitos');
      return;
    }

    setCsvFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await transactionsAPI.uploadCSVPreview(formData);
      setPreviewData(response);
      
      // Set initial column mapping from suggestions
      setColumnMapping(response.suggested_mapping);
      setStep('mapping');
      
    } catch (error) {
      console.error('Erro ao fazer upload do CSV:', error);
      toast.error('Erro ao processar arquivo CSV');
    }
  };

  const handleColumnMappingChange = (columnType: keyof ColumnMapping, columnIndex: number | null) => {
    setColumnMapping(prev => ({
      ...prev,
      [columnType]: columnIndex
    }));
  };

  const validateMapping = (): boolean => {
    if (columnMapping.date === undefined || columnMapping.date === null) {
      toast.error('É necessário mapear a coluna de data');
      return false;
    }
    
    if (!columnMapping.amount && (!columnMapping.credit || !columnMapping.debit)) {
      toast.error('É necessário mapear a coluna de valor ou as colunas de crédito e débito');
      return false;
    }
    
    if (!selectedAccount) {
      toast.error('É necessário selecionar uma conta bancária');
      return false;
    }
    
    return true;
  };

  const handleImport = async () => {
    if (!csvFile || !previewData || !validateMapping()) return;
    
    setImporting(true);
    setStep('importing');
    
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('column_mapping', JSON.stringify(columnMapping));
      formData.append('account_id', selectedAccount!.toString());
      
      const response = await transactionsAPI.importCSVTransactions(formData);
      setImportResults(response);
      setStep('success');
      
      toast.success(`${response.imported_count} transações importadas com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao importar transações:', error);
      toast.error('Erro ao importar transações do CSV');
      setStep('mapping');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (step === 'success' && importResults?.imported_count > 0) {
      onImportSuccess();
    }
    
    // Reset state
    setStep('upload');
    setCsvFile(null);
    setPreviewData(null);
    setColumnMapping({});
    setSelectedAccount(null);
    setImportResults(null);
    onClose();
  };

  const renderColumnSelect = (
    label: string,
    value: number | undefined,
    onChange: (value: number | null) => void,
    required: boolean = false
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : parseInt(e.target.value))}
        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Não mapear</option>
        {previewData?.headers.map((header, index) => (
          <option key={index} value={index}>
            {header}
          </option>
        ))}
      </select>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Importar Transações via CSV
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : step === 'mapping' || step === 'importing' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="flex items-center justify-center w-8 h-8 border-2 border-current rounded-full text-sm font-medium">
                    {step === 'mapping' || step === 'importing' || step === 'success' ? <CheckIcon className="w-5 h-5" /> : '1'}
                  </span>
                  <span className="ml-2 text-sm">Upload do arquivo</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step === 'mapping' || step === 'importing' || step === 'success' ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center ${step === 'mapping' ? 'text-blue-600' : step === 'importing' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="flex items-center justify-center w-8 h-8 border-2 border-current rounded-full text-sm font-medium">
                    {step === 'importing' || step === 'success' ? <CheckIcon className="w-5 h-5" /> : '2'}
                  </span>
                  <span className="ml-2 text-sm">Mapeamento</span>
                </div>
                <div className={`flex-1 h-0.5 mx-4 ${step === 'success' ? 'bg-green-600' : 'bg-gray-200'}`} />
                <div className={`flex items-center ${step === 'importing' ? 'text-blue-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="flex items-center justify-center w-8 h-8 border-2 border-current rounded-full text-sm font-medium">
                    {step === 'success' ? <CheckIcon className="w-5 h-5" /> : '3'}
                  </span>
                  <span className="ml-2 text-sm">Importação</span>
                </div>
              </div>
            </div>

            {/* Content based on step */}
            {step === 'upload' && (
              <div>
                <div className="text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Selecione um arquivo CSV
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Faça upload do extrato bancário em formato CSV
                  </p>
                  <div className="mt-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Selecionar arquivo
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-gray-600">
                  <p className="font-medium mb-2">Formatos suportados:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Delimitadores: vírgula, ponto e vírgula, pipe (|) ou tab</li>
                    <li>Colunas de valor único ou separadas (crédito/débito)</li>
                    <li>Formatos de data: DD/MM/AAAA, AAAA-MM-DD, DD-MM-AAAA</li>
                    <li>Primeira linha deve conter cabeçalhos</li>
                  </ul>
                </div>
              </div>
            )}

            {step === 'mapping' && previewData && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Mapping Configuration */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Configuração de Mapeamento
                    </h4>
                    
                    {/* Account Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conta Bancária <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedAccount ?? ''}
                        onChange={(e) => setSelectedAccount(e.target.value ? parseInt(e.target.value) : null)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecione uma conta</option>
                        {accounts.filter(acc => acc.tipo === 'conta-bancaria').map(account => (
                          <option key={account.id} value={account.id}>
                            {account.nome} {account.banco && `(${account.banco})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Column Mapping */}
                    {renderColumnSelect('Data', columnMapping.date, (value) => handleColumnMappingChange('date', value), true)}
                    
                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Escolha <strong>uma</strong> das opções abaixo:
                      </p>
                    </div>
                    
                    {renderColumnSelect('Valor (coluna única)', columnMapping.amount, (value) => handleColumnMappingChange('amount', value))}
                    
                    <div className="text-center text-gray-500 my-2">ou</div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {renderColumnSelect('Crédito/Entrada', columnMapping.credit, (value) => handleColumnMappingChange('credit', value))}
                      {renderColumnSelect('Débito/Saída', columnMapping.debit, (value) => handleColumnMappingChange('debit', value))}
                    </div>
                    
                    {renderColumnSelect('Descrição', columnMapping.description, (value) => handleColumnMappingChange('description', value))}
                    {renderColumnSelect('Beneficiário', columnMapping.beneficiary, (value) => handleColumnMappingChange('beneficiary', value))}
                  </div>

                  {/* Preview */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Prévia dos Dados
                    </h4>
                    <div className="text-sm text-gray-600 mb-2">
                      {previewData.total_rows} linhas total • Delimitador: {previewData.delimiter === ',' ? 'vírgula' : previewData.delimiter === ';' ? 'ponto e vírgula' : previewData.delimiter === '|' ? 'pipe' : 'tab'}
                    </div>
                    
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {previewData.headers.map((header, index) => (
                                <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {previewData.preview_rows.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'importing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Importando transações...</p>
              </div>
            )}

            {step === 'success' && importResults && (
              <div className="text-center py-8">
                <CheckIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Importação Concluída!
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✅ {importResults.imported_count} transações importadas</p>
                  <p>⏭️ {importResults.skipped_count} transações ignoradas (duplicadas)</p>
                  <p>📊 {importResults.total_rows} linhas processadas</p>
                  
                  {importResults.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 font-medium">Alguns erros ocorreram:</p>
                      <ul className="text-yellow-700 text-xs mt-1 list-disc list-inside">
                        {importResults.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 'upload' && (
              <button
                onClick={handleClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            )}
            
            {step === 'mapping' && (
              <>
                <button
                  onClick={handleImport}
                  disabled={!validateMapping()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importar Transações
                </button>
                <button
                  onClick={() => setStep('upload')}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Voltar
                </button>
              </>
            )}
            
            {step === 'success' && (
              <button
                onClick={handleClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Concluir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;