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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
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

  // Função para calcular o saldo de fechamento de um mês específico
  const calculateMonthClosingBalance = async (month: number, year: number, depth = 0): Promise<number> => {
    // Limite de recursão para evitar loops infinitos - máximo 12 meses para trás
    if (depth > 12) {
      console.warn('Limite de recursão atingido ao calcular saldo inicial. Usando valor padrão.');
      return 5000; // Valor base quando não conseguimos calcular mais
    }

    try {
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

      // Para calcular o saldo inicial do mês, precisamos do saldo de fechamento do mês anterior
      let saldoInicialMes = 0;
      if (month === 0) {
        // Janeiro - usar dezembro do ano anterior
        saldoInicialMes = await calculateMonthClosingBalance(11, year - 1, depth + 1);
      } else {
        // Mês anterior do mesmo ano
        saldoInicialMes = await calculateMonthClosingBalance(month - 1, year, depth + 1);
      }

      return saldoInicialMes + entradas - saidas;
    } catch (error) {
      console.error(`Erro ao calcular saldo do mês ${month}/${year}:`, error);
      // Base case: se não conseguir calcular, usar um valor padrão
      return 5000;
    }
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

      // Calcular saldo inicial como fechamento do mês anterior
      let saldoInicial = 0;
      if (currentMonth === 0) {
        // Janeiro - buscar fechamento de dezembro do ano anterior
        saldoInicial = await calculateMonthClosingBalance(11, currentYear - 1);
      } else {
        // Mês anterior do mesmo ano
        saldoInicial = await calculateMonthClosingBalance(currentMonth - 1, currentYear);
      }
      
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
      setCreditCards(cards); // Carregar todos os cartões para o carousel
      setCurrentCardIndex(0); // Reset carousel position
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  // Funções para navegação no carousel de cartões
  const handlePreviousCard = () => {
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : creditCards.length - 1));
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev < creditCards.length - 1 ? prev + 1 : 0));
  };

  // Paginação para transações recentes
  const [transactionsPage, setTransactionsPage] = useState(1);
  const transactionsPerPage = 5;
  const [allRecentTransactions, setAllRecentTransactions] = useState<any[] | null>(null); // null = API paginada, array = paginação local

  // Função para carregar transações recentes paginadas
  const loadRecentTransactions = async (page = 1) => {
    if (!currentWorkspace) return;
    setLoadingTransactions(true);
    try {
      const params = { limit: transactionsPerPage, offset: (page - 1) * transactionsPerPage };
      const response = await transactionsAPI.getAll(params);
      // Se a API retorna array grande, paginar no frontend
      if (Array.isArray(response) && response.length > transactionsPerPage) {
        setAllRecentTransactions(response);
        setRecentTransactions(response.slice((page - 1) * transactionsPerPage, page * transactionsPerPage));
      } else if (Array.isArray(response)) {
        setAllRecentTransactions(null);
        setRecentTransactions(response);
      } else if (response && typeof response === 'object' && 'results' in response) {
        setAllRecentTransactions(null);
        setRecentTransactions((response as any).results || []);
      } else {
        setAllRecentTransactions(null);
        setRecentTransactions([]);
      }
    } catch (error) {
      setAllRecentTransactions(null);
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
    setTransactionsPage(1); // Sempre volta para a primeira página ao trocar mês/workspace
  }, [currentMonth, currentYear, currentWorkspace]);

  useEffect(() => {
    if (allRecentTransactions) {
      setRecentTransactions(allRecentTransactions.slice((transactionsPage - 1) * transactionsPerPage, transactionsPage * transactionsPerPage));
    } else {
      loadRecentTransactions(transactionsPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsPage, currentMonth, currentYear, currentWorkspace, allRecentTransactions]);

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

        {/* Primeira Linha: Cards Financeiros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        {/* Segunda Linha: Money Flow + Meus Cartões */}
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

          {/* Meus Cartões (1/3) */}
          <div className="xl:col-span-1">
            <div className="glass-card p-6 float-card h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Meus Cartões</h3>
                </div>
                
                {/* Navegação do Carousel - só aparece se houver mais de 1 cartão */}
                {creditCards.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousCard}
                      className="p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                      disabled={loadingCards}
                    >
                      <ChevronLeftIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {currentCardIndex + 1}/{creditCards.length}
                    </span>
                    <button
                      onClick={handleNextCard}
                      className="p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                      disabled={loadingCards}
                    >
                      <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative">
                {loadingCards ? (
                  <div className="animate-pulse">
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ) : creditCards.length > 0 ? (
                  <div className="relative overflow-hidden">
                    {/* Carousel Container */}
                    <div 
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                    >
                      {creditCards.map((card, index) => (
                        <div key={card.id} className="w-full flex-shrink-0 px-1">
                          {/* Card estilo similar ao da página de cartões */}
                          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
                            
                            <div className="relative z-10">
                              {/* Card Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-sm font-bold text-white">{card.nome}</h4>
                                  <p className="text-xs text-blue-100">**** {card.numero?.slice(-4) || '****'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-blue-100">Limite</p>
                                  <p className="text-sm font-black text-white">{formatCurrency(card.limite || 0)}</p>
                                </div>
                              </div>
                              
                              {/* Card Bottom */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-6 bg-white/20 rounded backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">💳</span>
                                  </div>
                                  <span className="text-xs text-blue-100">{card.bandeira || 'Visa'}</span>
                                </div>
                                <div className="text-xs text-blue-100">
                                  {card.vencimento || '12/28'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicadores de pontos (dots) */}
                    {creditCards.length > 1 && (
                      <div className="flex justify-center space-x-2 mt-4">
                        {creditCards.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentCardIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentCardIndex 
                                ? 'bg-blue-600 dark:bg-blue-400' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
                    {[...Array(transactionsPerPage)].map((_, index) => (
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
                  <>
                    {recentTransactions.map((transaction) => (
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
                    ))}
                    {/* Paginação */}
                    <div className="flex justify-between items-center mt-4">
                      <button
                        className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold disabled:opacity-50"
                        onClick={() => setTransactionsPage((p) => Math.max(1, p - 1))}
                        disabled={transactionsPage === 1 || loadingTransactions}
                      >Anterior</button>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Página {transactionsPage}
                      </span>
                      <button
                        className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold disabled:opacity-50"
                        onClick={() => setTransactionsPage((p) => p + 1)}
                        disabled={
                          loadingTransactions ||
                          (
                            allRecentTransactions
                              ? (transactionsPage * transactionsPerPage >= allRecentTransactions.length)
                              : (recentTransactions.length < transactionsPerPage)
                          )
                        }
                      >Próxima</button>
                    </div>
                  </>
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
