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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-purple-50/20 to-pink-50/30 dark:from-primary-900/10 dark:via-purple-900/5 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        {/* Header com Saudação e Workspace */}
        <div className="p-8">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <span className="text-4xl text-gray-700 dark:text-gray-300 font-extralight">Olá, </span>
              <span className="text-4xl text-gradient font-black">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.first_name || 'Usuário'
                }
              </span>
            </div>
          {currentWorkspace && (
            <div className="glass-card px-6 py-4 float-card">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white text-sm font-black">W</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{currentWorkspace.nome}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Workspace Ativo</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seção Principal - Financeiro + Notícias */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Coluna Esquerda - Dados Financeiros (2/3) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Filtros de Período */}
          <div className="glass-card p-6 float-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Filtragem por Mês</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowValues(!showValues)}
                  className="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                  title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
                >
                  {showValues ? (
                    <EyeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                  title="Filtro personalizado"
                >
                  <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Navegação de Meses */}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>

              <div className="flex space-x-2">
                {getVisibleMonths().map(({ month, year, offset }) => (
                  <button
                    key={`${month}-${year}`}
                    onClick={() => handleMonthSelect(month, year)}
                    className={`px-4 py-2 rounded-button text-sm font-bold transition-all duration-300 ${
                      offset === 0
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'bg-white/30 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/20'
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
                className="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Filtro de Data Personalizado */}
            {showDateFilter && (
              <div className="mt-6 glass-card p-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Período Personalizado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Data Início</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Data Fim</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="btn-primary"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saldo Previsto */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-card p-8 float-card border border-primary-200/50 dark:border-primary-700/50">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg animate-float">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">Saldo Previsto</h3>
                {loadingDashboard ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-black text-gradient">{formatCurrency(dashboardData.saldoPrevisto)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getMonthName(currentMonth)} {currentYear}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Grid de Entradas e Saídas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entradas Realizadas */}
            <div className="glass-card p-6 float-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowUpIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400">Entradas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-green-600 dark:text-green-400">{formatCurrency(dashboardData.totalEntradas)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Realizadas</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Saídas Realizadas */}
            <div className="glass-card p-6 float-card">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ArrowDownIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400">Saídas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-red-600 dark:text-red-400">{formatCurrency(dashboardData.totalSaidas)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Realizadas</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Entradas Previstas */}
            <div className="card-flat p-6 float-card border-2 border-dashed border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-xl flex items-center justify-center border-2 border-dashed border-green-300 dark:border-green-600">
                  <ArrowUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400">Entradas Previstas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-green-600 dark:text-green-400">{formatCurrency(dashboardData.previsaoEntradas)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">A receber</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Saídas Previstas */}
            <div className="card-flat p-6 float-card border-2 border-dashed border-red-200 dark:border-red-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-xl flex items-center justify-center border-2 border-dashed border-red-300 dark:border-red-600">
                  <ArrowDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400">Saídas Previstas</h3>
                  {loadingDashboard ? (
                    <div className="animate-pulse">
                      <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-red-600 dark:text-red-400">{formatCurrency(dashboardData.previsaoSaidas)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">A pagar</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Categorias */}
          <div className="glass-card p-8 float-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Gastos por Categoria</h3>
              </div>
              
              {/* Filtro por tipo de transação */}
              <div className="flex items-center space-x-3">
                <select
                  value={transactionTypeFilter}
                  onChange={(e) => setTransactionTypeFilter(e.target.value as 'todas' | 'bancos' | 'cartoes')}
                  className="form-select"
                >
                  <option value="todas">Todas</option>
                  <option value="bancos">Bancos</option>
                  <option value="cartoes">Cartões</option>
                </select>
              </div>
            </div>

            {/* Gráfico de barras horizontais */}
            <div className="space-y-4">
              {loadingCategories ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : categoriesData.length > 0 ? (
                categoriesData.map((item, index) => {
                  const maxValue = categoriesData[0]?.value || 1;
                  const percentage = (item.value / maxValue) * 100;
                  
                  return (
                    <div key={item.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate flex-1">
                          {item.category}
                        </span>
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100 ml-3">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${
                            index === 0 ? 'bg-gradient-to-r from-purple-600 to-purple-500' :
                            index === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-400' :
                            index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-300' :
                            'bg-gradient-to-r from-purple-300 to-purple-200'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Nenhuma movimentação encontrada para este período</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {getMonthName(currentMonth)} {currentYear}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna Direita - Notícias (1/3) */}
        <div className="xl:col-span-1">
          <div className="glass-card p-8 h-full float-card">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mr-3 animate-pulse"></div>
              Notícias & Dicas
            </h3>
            
            <div className="space-y-6">
              {/* Card de Notícia 1 */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200/50 dark:border-primary-700/50 rounded-card p-6 float-card">
                <h4 className="text-sm font-bold text-primary-900 dark:text-primary-100 mb-3">Nova ferramenta de análise</h4>
                <p className="text-xs text-primary-700 dark:text-primary-300 mb-4 leading-relaxed">Descubra insights sobre seus gastos mensais com nossa nova funcionalidade de categorização automática.</p>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-bold">Há 2 horas</span>
              </div>

              {/* Card de Notícia 2 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50 rounded-card p-6 float-card">
                <h4 className="text-sm font-bold text-green-900 dark:text-green-100 mb-3">Dica: Economia doméstica</h4>
                <p className="text-xs text-green-700 dark:text-green-300 mb-4 leading-relaxed">5 estratégias simples para reduzir gastos fixos e aumentar sua reserva de emergência.</p>
                <span className="text-xs text-green-600 dark:text-green-400 font-bold">Há 5 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Resumo - Contas a Pagar e Receber */}
      <div className="glass-card p-8 float-card">
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-8">Resumo</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contas a Pagar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Contas a Pagar</h3>
              <select
                value={filtroContasPagar}
                onChange={(e) => setFiltroContasPagar(e.target.value)}
                className="form-select"
              >
                <option value="todas">Todas</option>
                <option value="hoje">Hoje</option>
                <option value="amanha">Amanhã</option>
                <option value="mes">Este mês</option>
                <option value="atrasada">Atrasadas</option>
              </select>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loadingDashboard ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse glass-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                filtrarContas(contasPagar, filtroContasPagar).map((conta) => (
                  <div key={conta.id} className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200/50 dark:border-red-700/50 rounded-card p-4 float-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{conta.descricao}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-red-600 dark:text-red-400">{formatCurrency(conta.valor)}</p>
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(conta.status)}`}>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Contas a Receber</h3>
              <select
                value={filtroContasReceber}
                onChange={(e) => setFiltroContasReceber(e.target.value)}
                className="form-select"
              >
                <option value="todas">Todas</option>
                <option value="hoje">Hoje</option>
                <option value="amanha">Amanhã</option>
                <option value="mes">Este mês</option>
                <option value="atrasada">Atrasadas</option>
              </select>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loadingDashboard ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse glass-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                filtrarContas(contasReceber, filtroContasReceber).map((conta) => (
                  <div key={conta.id} className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50 rounded-card p-4 float-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{conta.descricao}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-green-600 dark:text-green-400">{formatCurrency(conta.valor)}</p>
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(conta.status)}`}>
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
    </div>
  );
};

export default Dashboard;
