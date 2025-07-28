import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, CreditCardIcon, BanknotesIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showValues, setShowValues] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  // Mock data - later will come from API
  const summaryData = {
    totalEntradas: 8500.00,
    totalSaidas: 3200.00,
    previsaoEntradas: 12000.00,
    previsaoSaidas: 4500.00
  };

  const carteiras = [
    { id: 1, name: 'Banco do Brasil', type: 'Conta Corrente', balance: 5500.00, color: 'bg-yellow-500' },
    { id: 2, name: 'Santander', type: 'Conta Poupança', balance: 3200.00, color: 'bg-red-500' },
    { id: 3, name: 'Cartão Nubank', type: 'Cartão de Crédito', balance: -850.00, color: 'bg-purple-500' },
    { id: 4, name: 'Caixa Econômica', type: 'Conta Corrente', balance: 1800.00, color: 'bg-blue-500' }
  ];

  const gerenciamentoData = {
    contasAPagar: [
      { id: 1, description: 'Aluguel', amount: 1200.00, dueDate: '2025-08-05', category: 'Moradia' },
      { id: 2, description: 'Energia Elétrica', amount: 180.00, dueDate: '2025-08-10', category: 'Utilitários' },
      { id: 3, description: 'Internet', amount: 89.90, dueDate: '2025-08-15', category: 'Utilitários' }
    ],
    contasAReceber: [
      { id: 1, description: 'Salário', amount: 5000.00, dueDate: '2025-08-01', category: 'Renda' },
      { id: 2, description: 'Freelance', amount: 800.00, dueDate: '2025-08-20', category: 'Renda Extra' }
    ],
    entradas: [
      { id: 1, description: 'Salário Janeiro', amount: 5000.00, date: '2025-07-01', category: 'Renda' },
      { id: 2, description: 'Venda Produto', amount: 350.00, date: '2025-07-15', category: 'Vendas' }
    ],
    saidas: [
      { id: 1, description: 'Supermercado', amount: 280.00, date: '2025-07-25', category: 'Alimentação' },
      { id: 2, description: 'Combustível', amount: 120.00, date: '2025-07-26', category: 'Transporte' }
    ]
  };

  const formatCurrency = (value: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    
    return {
      start: start.toLocaleDateString('pt-BR'),
      end: end.toLocaleDateString('pt-BR')
    };
  };

  const monthRange = getCurrentMonthRange();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo, {user?.first_name || user?.username}!
          </p>
        </div>
      </div>

      {/* Área de Resumo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h3>
          <div className="flex items-center space-x-4">
            {/* Botão de esconder valores */}
            <button
              onClick={() => setShowValues(!showValues)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showValues ? (
                <EyeIcon className="h-5 w-5" />
              ) : (
                <EyeSlashIcon className="h-5 w-5" />
              )}
            </button>
            
            {/* Filtro de período */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="current-month">Mês Atual ({monthRange.start} - {monthRange.end})</option>
                <option value="last-month">Mês Anterior</option>
                <option value="current-year">Ano Atual</option>
                <option value="custom">Período Personalizado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards de resumo - 4 em linha */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <BanknotesIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-green-800">Total de Entradas</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(summaryData.totalEntradas)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <BanknotesIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-red-800">Total de Saídas</p>
                <p className="text-xl font-bold text-red-900">{formatCurrency(summaryData.totalSaidas)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-blue-800">Previsão Entradas</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(summaryData.previsaoEntradas)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-orange-800">Previsão Saídas</p>
                <p className="text-xl font-bold text-orange-900">{formatCurrency(summaryData.previsaoSaidas)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Carteiras */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carteiras</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {carteiras.map((carteira) => (
            <div key={carteira.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${carteira.color} rounded-lg flex items-center justify-center`}>
                  <CreditCardIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{carteira.name}</p>
                  <p className="text-xs text-gray-500">{carteira.type}</p>
                  <p className={`text-sm font-semibold ${carteira.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(carteira.balance)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de Gerenciamento - Grid 2x2 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Gerenciamento</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Contas a Pagar */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="text-md font-semibold text-red-800 mb-3">Contas a Pagar</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gerenciamentoData.contasAPagar.map((conta) => (
                <div key={conta.id} className="bg-white rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{conta.description}</p>
                      <p className="text-xs text-gray-500">{conta.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{formatCurrency(conta.amount)}</p>
                      <p className="text-xs text-gray-500">{conta.dueDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contas a Receber */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="text-md font-semibold text-green-800 mb-3">Contas a Receber</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gerenciamentoData.contasAReceber.map((conta) => (
                <div key={conta.id} className="bg-white rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{conta.description}</p>
                      <p className="text-xs text-gray-500">{conta.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{formatCurrency(conta.amount)}</p>
                      <p className="text-xs text-gray-500">{conta.dueDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entradas */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-md font-semibold text-blue-800 mb-3">Entradas Recentes</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gerenciamentoData.entradas.map((entrada) => (
                <div key={entrada.id} className="bg-white rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entrada.description}</p>
                      <p className="text-xs text-gray-500">{entrada.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{formatCurrency(entrada.amount)}</p>
                      <p className="text-xs text-gray-500">{entrada.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saídas */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="text-md font-semibold text-orange-800 mb-3">Saídas Recentes</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gerenciamentoData.saidas.map((saida) => (
                <div key={saida.id} className="bg-white rounded-md p-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{saida.description}</p>
                      <p className="text-xs text-gray-500">{saida.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600">{formatCurrency(saida.amount)}</p>
                      <p className="text-xs text-gray-500">{saida.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
