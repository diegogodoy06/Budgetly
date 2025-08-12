import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { transactionsAPI, accountsAPI, creditCardsAPI } from '@/services/api';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

  // Estados para dados do dashboard
  const [dashboardData, setDashboardData] = useState<any>({
    saldoPrevisto: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    previsaoEntradas: 0,
    previsaoSaidas: 0,
    saldoInicial: 0,
    saldoAtual: 0
  });
  
  // Estados para gráficos
  const [balanceChartData, setBalanceChartData] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  
  // Estados para cartões e transações
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  // Loading states
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

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

  // Função para carregar dados principais do dashboard
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

      // Calcular saldos
      const saldoInicial = 5000; // TODO: Buscar saldo inicial real
      const saldoAtual = saldoInicial + totalEntradas - totalSaidas;
      const saldoPrevisto = saldoAtual + previsaoEntradas - previsaoSaidas;

      console.log('💰 Dashboard: Dados calculados:', {
        totalEntradas,
        totalSaidas,
        previsaoEntradas,
        previsaoSaidas,
        saldoInicial,
        saldoAtual,
        saldoPrevisto
      });

      setDashboardData({
        saldoPrevisto,
        totalEntradas,
        totalSaidas,
        previsaoEntradas,
        previsaoSaidas,
        saldoInicial,
        saldoAtual
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Função para carregar dados dos gráficos
  const loadChartsData = async () => {
    if (!currentWorkspace) return;
    
    setLoadingCharts(true);
    try {
      // Carregar dados do gráfico de linha (últimos 6 meses)
      const balanceData = [];
      for (let i = 5; i >= 0; i--) {
        let month = currentMonth - i;
        let year = currentYear;
        
        if (month < 0) {
          month = 12 + month;
          year = currentYear - 1;
        }
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        const params = {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        };

        const transactions = await transactionsAPI.getAll(params);
        const confirmedTransactions = transactions.filter(t => t.confirmada);
        
        const entradas = confirmedTransactions
          .filter(t => t.tipo === 'entrada')
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor)), 0);
        const saidas = confirmedTransactions
          .filter(t => t.tipo === 'saida')
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.valor)), 0);
        
        // Simular saldo (em um app real, você teria o saldo inicial de cada mês)
        const saldo = 5000 + entradas - saidas + (i * 500); // Simulação
        
        balanceData.push({
          month: getMonthName(month),
          saldo: saldo,
          entradas: entradas,
          saidas: saidas
        });
      }
      
      setBalanceChartData(balanceData);

      // Carregar dados do gráfico de categorias (pizza)
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      const categoryParams = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      const categoryData = await transactionsAPI.byCategory(categoryParams);
      
      const processedCategoryData = Object.entries(categoryData || {})
        .map(([categoryName, value]) => ({
          name: categoryName,
          value: Math.abs(Number(value)),
          originalValue: Number(value)
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8 categorias

      setCategoriesData(processedCategoryData);

    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
    } finally {
      setLoadingCharts(false);
    }
  };

  // Função para carregar cartões de crédito
  const loadCreditCards = async () => {
    if (!currentWorkspace) return;
    
    setLoadingCards(true);
    try {
      const cards = await creditCardsAPI.getAll();
      setCreditCards(cards.slice(0, 3)); // Mostrar apenas 3 cartões
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  // Função para carregar transações recentes
  const loadRecentTransactions = async () => {
    if (!currentWorkspace) return;
    
    setLoadingTransactions(true);
    try {
      const transactions = await transactionsAPI.getAll({ limit: 5 });
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Erro ao carregar transações recentes:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Efeito para recarregar dados quando mês mudar
  useEffect(() => {
    loadDashboardData();
    loadChartsData();
    loadCreditCards();
    loadRecentTransactions();
  }, [currentMonth, currentYear, currentWorkspace]);

  // Cores para o gráfico de pizza
  const COLORS = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F3F4F6', '#E5E7EB', '#D1D5DB'];

  // Função para formatar valor no tooltip do gráfico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{`${label}: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-purple-50/20 to-pink-50/30 dark:from-primary-900/10 dark:via-purple-900/5 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        {/* Header com Saudação e Filtro Global de Mês */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="text-left">
            <span className="text-4xl text-gray-700 dark:text-gray-300 font-extralight">Olá, </span>
            <span className="text-4xl text-gradient font-black">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user?.first_name || 'Usuário'
              }
            </span>
          </div>

          {/* Filtro Global de Mês - Clean e Elegante */}
          <div className="glass-card p-4 float-card">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>

                <div className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-bold shadow-lg">
                  {getMonthName(currentMonth)} {currentYear}
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
                  className="p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

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
            </div>
          </div>
        </div>

        {/* Primeira Linha: Cards Financeiros + Meus Cartões */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cards Financeiros (2/3) */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Entradas */}
              <div className="glass-card p-6 float-card border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ArrowUpIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Entradas</h3>
                    {loadingDashboard ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    ) : (
                      <p className="text-lg font-black text-green-600 dark:text-green-400">{formatCurrency(dashboardData.totalEntradas)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Entradas Previstas */}
              <div className="glass-card p-6 float-card border border-green-200/50 dark:border-green-700/50 border-dashed">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-xl flex items-center justify-center border-2 border-dashed border-green-300 dark:border-green-600">
                    <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Entr. P.</h3>
                    {loadingDashboard ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    ) : (
                      <p className="text-lg font-black text-green-600 dark:text-green-400">{formatCurrency(dashboardData.previsaoEntradas)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Saídas */}
              <div className="glass-card p-6 float-card border border-red-200/50 dark:border-red-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <ArrowDownIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Saídas</h3>
                    {loadingDashboard ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    ) : (
                      <p className="text-lg font-black text-red-600 dark:text-red-400">{formatCurrency(dashboardData.totalSaidas)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Saídas Previstas */}
              <div className="glass-card p-6 float-card border border-red-200/50 dark:border-red-700/50 border-dashed">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-800 dark:to-red-700 rounded-xl flex items-center justify-center border-2 border-dashed border-red-300 dark:border-red-600">
                    <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Saídas P.</h3>
                    {loadingDashboard ? (
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    ) : (
                      <p className="text-lg font-black text-red-600 dark:text-red-400">{formatCurrency(dashboardData.previsaoSaidas)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meus Cartões (1/3) */}
          <div className="xl:col-span-1">
            <div className="glass-card p-6 float-card h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCardIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Meus Cartões</h3>
              </div>
              
              <div className="space-y-4">
                {loadingCards ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : creditCards.length > 0 ? (
                  creditCards.map((card, index) => (
                    <div key={card.id} className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{card.nome}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">**** {card.numero?.slice(-4) || '****'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(card.limite || 0)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Limite</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CreditCardIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Nenhum cartão cadastrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Segunda Linha: Gráfico de Linhas + Meus Cartões (continuação) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Gráfico de Linha - Money Flow (2/3) */}
          <div className="xl:col-span-2">
            <div className="glass-card p-8 float-card">
              {/* Cabeçalho do Gráfico com Informações de Saldo */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Money Flow</h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{getMonthName(currentMonth)} {currentYear}</span>
                </div>
                
                {/* Informações de Saldo no Cabeçalho */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Saldo Inicial</p>
                    <p className="text-lg font-black text-gray-900 dark:text-gray-100">{formatCurrency(dashboardData.saldoInicial)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Saldo Atual</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">{formatCurrency(dashboardData.saldoAtual)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Saldo Previsto</p>
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400">{formatCurrency(dashboardData.saldoPrevisto)}</p>
                  </div>
                </div>
              </div>

              {/* Gráfico de Linha */}
              <div className="h-80">
                {loadingCharts ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="saldo" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: '#8B5CF6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Espaço para Meus Cartões (continuação) - pode ser usado para mais cartões ou outras informações */}
          <div className="xl:col-span-1">
            <div className="glass-card p-6 float-card h-full">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Resumo do Mês</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Entradas</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(dashboardData.totalEntradas)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Saídas</span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(dashboardData.totalSaidas)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Resultado</span>
                    <span className={`text-sm font-bold ${(dashboardData.totalEntradas - dashboardData.totalSaidas) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(dashboardData.totalEntradas - dashboardData.totalSaidas)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terceira Linha: Gráfico de Pizza + Últimas Transações */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Gráfico de Pizza - Despesas por Categoria (2/3) */}
          <div className="xl:col-span-2">
            <div className="glass-card p-8 float-card">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Despesas por Categoria</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Pizza */}
                <div className="h-80">
                  {loadingCharts ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    </div>
                  ) : categoriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoriesData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={false}
                        >
                          {categoriesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <ChartBarIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Nenhuma despesa encontrada</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legenda do Gráfico */}
                <div className="space-y-3">
                  {categoriesData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Últimas Transações (1/3) */}
          <div className="xl:col-span-1">
            <div className="glass-card p-6 float-card h-full">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Últimas Transações</h3>
              </div>
              
              <div className="space-y-3">
                {loadingTransactions ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse glass-card p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          </div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="glass-card p-3 hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {transaction.descricao}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(transaction.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className={`text-sm font-bold ${transaction.tipo === 'entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {transaction.tipo === 'entrada' ? '+' : '-'}{formatCurrency(Math.abs(parseFloat(transaction.valor)))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Nenhuma transação recente</p>
                  </div>
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
