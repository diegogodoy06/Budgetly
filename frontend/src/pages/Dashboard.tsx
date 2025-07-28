import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, CreditCardIcon, BanknotesIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showValues, setShowValues] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getVisibleMonths = () => {
    const months = [];
    for (let i = -2; i <= 2; i++) {
      let month = currentMonth + i;
      let year = currentYear;
      
      if (month < 0) {
        month = 12 + month;
        year = currentYear - 1;
      } else if (month > 11) {
        month = month - 12;
        year = currentYear + 1;
      }
      
      months.push({ month, year, offset: i });
    }
    return months;
  };

  return (
    <div className="space-y-8">
      {/* Header Atualizado */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Olá, {user?.first_name || user?.username}
        </h1>
        
        {/* Navegação de Meses */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex space-x-2">
            {getVisibleMonths().map(({ month, year, offset }) => (
              <button
                key={`${month}-${year}`}
                onClick={() => {
                  setCurrentMonth(month);
                  setCurrentYear(year);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  offset === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getMonthName(month).slice(0, 3)} {year}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Botão de esconder valores */}
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-4"
            title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showValues ? (
              <EyeIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <EyeSlashIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          {/* Filtro de data personalizado */}
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Filtro de período"
          >
            <CalendarIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Popup de filtro de data */}
        {showDateFilter && (
          <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data Início</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowDateFilter(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  console.log('Aplicar filtro:', dateRange);
                  setShowDateFilter(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Área de Resumo Atualizada */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-green-800">Entradas</p>
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
              <p className="text-sm font-medium text-red-800">Saídas</p>
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

      {/* Área de Carteiras */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Carteiras</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {carteiras.map((carteira) => (
            <div key={carteira.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${carteira.color} rounded-lg flex items-center justify-center`}>
                  {carteira.type === 'Cartão de Crédito' ? (
                    <CreditCardIcon className="h-6 w-6 text-white" />
                  ) : (
                    <BanknotesIcon className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{carteira.name}</p>
                  <p className="text-xs text-gray-500">{carteira.type}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className={`text-lg font-semibold ${carteira.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(carteira.balance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gerenciamento */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Gerenciamento</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Contas a Pagar */}
              {gerenciamentoData.contasAPagar.map((conta) => (
                <tr key={`pagar-${conta.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      {conta.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Conta a Pagar
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {conta.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(conta.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-red-600">
                    {formatCurrency(conta.amount)}
                  </td>
                </tr>
              ))}
              
              {/* Contas a Receber */}
              {gerenciamentoData.contasAReceber.map((conta) => (
                <tr key={`receber-${conta.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {conta.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Conta a Receber
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {conta.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(conta.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                    {formatCurrency(conta.amount)}
                  </td>
                </tr>
              ))}
              
              {/* Entradas */}
              {gerenciamentoData.entradas.map((entrada) => (
                <tr key={`entrada-${entrada.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {entrada.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Entrada
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {entrada.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(entrada.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">
                    {formatCurrency(entrada.amount)}
                  </td>
                </tr>
              ))}
              
              {/* Saídas */}
              {gerenciamentoData.saidas.map((saida) => (
                <tr key={`saida-${saida.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      {saida.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Saída
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {saida.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(saida.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-orange-600">
                    {formatCurrency(saida.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
