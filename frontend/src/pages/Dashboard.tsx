import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { transactionsAPI, accountsAPI } from '@/services/api';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  // Escutar mudanças de workspace
  useEffect(() => {
    const handleWorkspaceChange = (event: CustomEvent) => {
      console.log('🔄 Dashboard detectou mudança de workspace:', event.detail);
      const { previousWorkspace, newWorkspace } = event.detail;
      
      if (previousWorkspace?.id !== newWorkspace?.id) {
        console.log('✨ Recarregando dados do dashboard para novo workspace');
        setTimeout(() => {
          console.log('✅ Dados do dashboard atualizados');
        }, 500);
      }
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    };
  }, []);
  
  const [showValues, setShowValues] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Estados para o gráfico de categorias
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'todas' | 'bancos' | 'cartoes'>('todas');

  // Estados para dados do dashboard
  const [dashboardData, setDashboardData] = useState<any>({
    saldoPrevisto: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    previsaoEntradas: 0,
    previsaoSaidas: 0
  });
  const [contasPagar, setContasPagar] = useState<any[]>([]);
  const [contasReceber, setContasReceber] = useState<any[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Filtros para contas
  const [filtroContasPagar, setFiltroContasPagar] = useState('todas');
  const [filtroContasReceber, setFiltroContasReceber] = useState('todas');

  const formatCurrency = (value: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month];
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

  const handleMonthSelect = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Função para carregar dados das categorias
  const loadCategoriesData = async () => {
    if (!currentWorkspace) return;
    
    setLoadingCategories(true);
    try {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      let params: any = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      // Aplicar filtro por tipo de transação
      if (transactionTypeFilter === 'bancos') {
        // Buscar contas bancárias (excluir cartões)
        const accounts = await accountsAPI.getAll();
        const bankAccountIds = accounts.map(acc => acc.id);
        params.account__in = bankAccountIds.join(',');
        params.credit_card__isnull = true; // Excluir transações de cartão
      } else if (transactionTypeFilter === 'cartoes') {
        // Buscar apenas transações de cartão de crédito
        params.account__isnull = true; // Excluir transações de conta
        // Não precisamos filtrar por cartão específico, apenas garantir que tem credit_card
      }

      const data = await transactionsAPI.byCategory(params);
      
      // Processar dados e ordenar por valor (maior para menor)
      const processedData = Object.entries(data || {})
        .map(([categoryName, value]) => ({
          category: categoryName,
          value: Math.abs(Number(value)),
          originalValue: Number(value)
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Mostrar apenas top 10

      setCategoriesData(processedData);
    } catch (error) {
      console.error('Erro ao carregar dados das categorias:', error);
      setCategoriesData([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Efeito para recarregar dados quando mês ou filtro mudar
  useEffect(() => {
    loadCategoriesData();
  }, [currentMonth, currentYear, transactionTypeFilter, currentWorkspace]);

  // Função para carregar dados do dashboard
  const loadDashboardData = async () => {
    if (!currentWorkspace) return;
    
    setLoadingDashboard(true);
    try {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      const params = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      console.log('🔍 Dashboard: Carregando dados com params:', params);

      // Buscar transações do período
      const transactions = await transactionsAPI.getAll(params);
      
      console.log(`📊 Dashboard: ${transactions.length} transações encontradas para ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`);
      console.log('📊 Dashboard: Primeiras 3 transações:', transactions.slice(0, 3));
      
      // Processar dados realizados (transações confirmadas)
      const confirmedTransactions = transactions.filter(t => t.confirmada);
      console.log(`✅ Dashboard: ${confirmedTransactions.length} transações confirmadas`);
      
      const totalEntradas = confirmedTransactions
        .filter(t => t.tipo === 'entrada')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor)), 0);
      const totalSaidas = confirmedTransactions
        .filter(t => t.tipo === 'saida')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor)), 0);

      // Processar dados previstos (transações não confirmadas)
      const pendingTransactions = transactions.filter(t => !t.confirmada);
      console.log(`⏳ Dashboard: ${pendingTransactions.length} transações pendentes`);
      
      const previsaoEntradas = pendingTransactions
        .filter(t => t.tipo === 'entrada')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor)), 0);
      const previsaoSaidas = pendingTransactions
        .filter(t => t.tipo === 'saida')
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor)), 0);

      // Calcular saldo previsto
      const saldoPrevisto = totalEntradas - totalSaidas + previsaoEntradas - previsaoSaidas;

      console.log('💰 Dashboard: Dados calculados:', {
        totalEntradas,
        totalSaidas,
        previsaoEntradas,
        previsaoSaidas,
        saldoPrevisto
      });

      setDashboardData({
        saldoPrevisto,
        totalEntradas,
        totalSaidas,
        previsaoEntradas,
        previsaoSaidas
      });

      // Processar contas a pagar e receber
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);

      const processarContas = (transacoes: any[], tipo: 'saida' | 'entrada') => {
        return transacoes
          .filter(t => t.tipo === tipo && !t.confirmada)
          .map(t => {
            const vencimento = new Date(t.data);
            let status = 'mes';
            
            if (vencimento < hoje) {
              status = 'atrasada';
            } else if (vencimento.toDateString() === hoje.toDateString()) {
              status = 'hoje';
            } else if (vencimento.toDateString() === amanha.toDateString()) {
              status = 'amanha';
            }
            
            return {
              id: t.id,
              descricao: t.descricao,
              vencimento: t.data,
              valor: Math.abs(parseFloat(t.valor)),
              status
            };
          })
          .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
      };

      setContasPagar(processarContas(transactions, 'saida'));
      setContasReceber(processarContas(transactions, 'entrada'));

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Efeito para recarregar dados do dashboard quando mês mudar
  useEffect(() => {
    loadDashboardData();
  }, [currentMonth, currentYear, currentWorkspace]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hoje': return 'bg-blue-100 text-blue-800';
      case 'amanha': return 'bg-yellow-100 text-yellow-800';
      case 'mes': return 'bg-green-100 text-green-800';
      case 'atrasada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hoje': return 'Hoje';
      case 'amanha': return 'Amanhã';
      case 'mes': return 'Este mês';
      case 'atrasada': return 'Atrasada';
      default: return 'Outras';
    }
  };

  const filtrarContas = (contas: any[], filtro: string) => {
    if (filtro === 'todas') return contas;
    return contas.filter(conta => conta.status === filtro);
  };

  return (
    <div className="space-y-6">
      {/* Header com Saudação e Workspace */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <span className="text-3xl text-gray-700 font-light">Olá, </span>
            <span className="text-3xl text-gray-700 font-bold">{user?.first_name || 'Usuário'}</span>
          </div>
          {currentWorkspace && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-bold">W</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{currentWorkspace.nome}</p>
                  <p className="text-xs text-blue-600">Workspace Ativo</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seção Principal - Financeiro + Notícias */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Dados Financeiros (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Filtros de Período */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-gray-700">Filtragem por Mês</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowValues(!showValues)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
                >
                  {showValues ? (
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Filtro personalizado"
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Navegação de Meses */}
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
              </button>

              <div className="flex space-x-1">
                {getVisibleMonths().map(({ month, year, offset }) => (
                  <button
                    key={`${month}-${year}`}
                    onClick={() => handleMonthSelect(month, year)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      offset === 0
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {getMonthName(month)} {year}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Filtro de Data Personalizado */}
            {showDateFilter && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-xs font-medium text-gray-700 mb-2">Período Personalizado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Data Início</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Data Fim</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saldo Previsto */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-700 mb-1">Saldo Previsto</h3>
                {loadingDashboard ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.saldoPrevisto)}</p>
                    <p className="text-xs text-gray-600 mt-1">{getMonthName(currentMonth)} {currentYear}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Grid de Entradas e Saídas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entradas Realizadas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <ArrowUpIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">Entradas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(dashboardData.totalEntradas)}</p>
                      <p className="text-xs text-gray-500">Realizadas</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Saídas Realizadas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <ArrowDownIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">Saídas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(dashboardData.totalSaidas)}</p>
                      <p className="text-xs text-gray-500">Realizadas</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Entradas Previstas */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-green-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300">
                  <ArrowUpIcon className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">Entradas Previstas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(dashboardData.previsaoEntradas)}</p>
                      <p className="text-xs text-gray-500">A receber</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Saídas Previstas */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-red-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center border-2 border-dashed border-red-300">
                  <ArrowDownIcon className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-600">Saídas Previstas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(dashboardData.previsaoSaidas)}</p>
                      <p className="text-xs text-gray-500">A pagar</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Categorias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Gastos por Categoria</h3>
              </div>
              
              {/* Filtro por tipo de transação */}
              <div className="flex items-center space-x-2">
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value as 'todas' | 'bancos' | 'cartoes')}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="todas">Todas</option>
                  <option value="bancos">Bancos</option>
                  <option value="cartoes">Cartões</option>
                </select>
              </div>
            </div>

            {/* Gráfico de barras horizontais */}
            <div className="space-y-3">
              {loadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : categoriesData.length > 0 ? (
                categoriesData.map((item, index) => {
                  const maxValue = categoriesData[0]?.value || 1;
                  const percentage = (item.value / maxValue) * 100;
                  
                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 truncate flex-1">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-gray-900 ml-2">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-purple-600' :
                            index === 1 ? 'bg-purple-500' :
                            index === 2 ? 'bg-purple-400' :
                            'bg-purple-300'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma movimentação encontrada para este período</p>
                  <p className="text-sm text-gray-500">
                    {getMonthName(currentMonth)} {currentYear}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita - Notícias (1/3) */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Notícias & Dicas
            </h3>
            
            <div className="space-y-4">
              {/* Card de Notícia 1 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Nova ferramenta de análise</h4>
                <p className="text-xs text-blue-700 mb-3">Descubra insights sobre seus gastos mensais com nossa nova funcionalidade de categorização automática.</p>
                <span className="text-xs text-blue-600 font-medium">Há 2 horas</span>
              </div>

              {/* Card de Notícia 2 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-2">Dica: Economia doméstica</h4>
                <p className="text-xs text-green-700 mb-3">5 estratégias simples para reduzir gastos fixos e aumentar sua reserva de emergência.</p>
                <span className="text-xs text-green-600 font-medium">Há 5 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Resumo - Contas a Pagar e Receber */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumo</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contas a Pagar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Contas a Pagar</h3>
              <select
                value={filtroContasPagar}
                onChange={(e) => setFiltroContasPagar(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="todas">Todas</option>
                <option value="hoje">Hoje</option>
                <option value="amanha">Amanhã</option>
                <option value="mes">Este mês</option>
                <option value="atrasada">Atrasadas</option>
              </select>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loadingDashboard ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                filtrarContas(contasPagar, filtroContasPagar).map((conta) => (
                  <div key={conta.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{conta.descricao}</p>
                        <p className="text-xs text-gray-600">{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatCurrency(conta.valor)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conta.status)}`}>
                          {getStatusLabel(conta.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contas a Receber */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Contas a Receber</h3>
              <select
                value={filtroContasReceber}
                onChange={(e) => setFiltroContasReceber(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todas">Todas</option>
                <option value="hoje">Hoje</option>
                <option value="amanha">Amanhã</option>
                <option value="mes">Este mês</option>
                <option value="atrasada">Atrasadas</option>
              </select>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loadingDashboard ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                filtrarContas(contasReceber, filtroContasReceber).map((conta) => (
                  <div key={conta.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{conta.descricao}</p>
                        <p className="text-xs text-gray-600">{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{formatCurrency(conta.valor)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conta.status)}`}>
                          {getStatusLabel(conta.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
