import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { transactionsAPI, accountsAPI, categoriesAPI, creditCardsAPI } from '@/services/api';
import type { Transaction, Account, Category, CreditCard } from '@/types';
import toast from 'react-hot-toast';

interface Filtros {
  descricao: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  carteiras: number[];
  categorias: number[];
}

type TipoMovimentacao = 'todas' | 'entradas' | 'saidas' | 'contas-receber' | 'contas-pagar';

interface UseTransactionsReturn {
  // Data states
  transactions: Transaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  loading: boolean;
  
  // Pagination states
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  
  // Filter states
  filtros: Filtros;
  filtroContaAtiva: 'todas' | 'bancos' | 'cartoes' | number;
  mostrarFiltros: boolean;
  abaAtiva: TipoMovimentacao;
  
  // Computed data
  transacoesFiltradas: Transaction[];
  
  // Functions
  carregarDados: (page?: number) => Promise<void>;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  setFiltroContaAtiva: React.Dispatch<React.SetStateAction<'todas' | 'bancos' | 'cartoes' | number>>;
  setMostrarFiltros: React.Dispatch<React.SetStateAction<boolean>>;
  setAbaAtiva: React.Dispatch<React.SetStateAction<TipoMovimentacao>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
  contarFiltrosAtivos: () => number;
  obterNomeFiltroAtivo: () => string;
  calcularSaldoFiltrado: () => number;
  toggleItemFiltro: (lista: number[], item: number) => number[];
  formatarMoeda: (valor: string | number) => string;
}

export const useTransactions = (): UseTransactionsReturn => {
  const { currentWorkspace } = useWorkspace();
  
  // Função para limpar dados quando workspace muda
  const limparDados = () => {
    setTransactions([]);
    setAccounts([]);
    setCategories([]);
    setCreditCards([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
    setHasNextPage(false);
    setLoading(true);
  };
  
  // Estados para dados carregados das APIs
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para paginação robusta
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  // Estados para filtros de conta específicos
  const [filtroContaAtiva, setFiltroContaAtiva] = useState<'todas' | 'bancos' | 'cartoes' | number>('todas');
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<TipoMovimentacao>('todas');

  const [filtros, setFiltros] = useState<Filtros>({
    descricao: '',
    periodo: {
      inicio: '',
      fim: ''
    },
    carteiras: [],
    categorias: []
  });

  // Carregar dados das APIs
  useEffect(() => {
    carregarDados();
  }, [currentWorkspace?.id]); // Recarregar quando workspace mudar

  // Escutar mudanças de workspace
  useEffect(() => {
    const handleWorkspaceChange = () => {
      console.log('🔄 useTransactions detectou mudança de workspace');
      limparDados();
      // carregarDados será chamado pelo useEffect de currentWorkspace
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange);
    };
  }, []);

  const carregarDados = async (page: number = 1) => {
    if (!currentWorkspace) {
      limparDados();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Carregando dados de transações para workspace:', currentWorkspace.nome, 'página:', page);
      
      const [transactionsResponse, accountsData, categoriesData, creditCardsData] = await Promise.all([
        transactionsAPI.getAll({ page }),
        accountsAPI.getAll(),
        categoriesAPI.getAll(),
        creditCardsAPI.getAll()
      ]);

      // Verificar se é uma resposta paginada ou lista simples
      if (transactionsResponse && typeof transactionsResponse === 'object' && 'results' in transactionsResponse) {
        // Resposta paginada
        const paginatedResponse = transactionsResponse as any;
        setTransactions(paginatedResponse.results || []);
        setTotalCount(paginatedResponse.count || 0);
        setTotalPages(Math.ceil((paginatedResponse.count || 0) / 1000)); // Baseado no PAGE_SIZE
        setHasNextPage(!!paginatedResponse.next);
        setCurrentPage(page);
        console.log('✅ Dados paginados carregados - Transações:', paginatedResponse.results?.length, 'Total:', paginatedResponse.count);
      } else {
        // Lista simples (sem paginação)
        const transactionsArray = Array.isArray(transactionsResponse) ? transactionsResponse : [];
        setTransactions(transactionsArray);
        setTotalCount(transactionsArray.length);
        setTotalPages(1);
        setHasNextPage(false);
        setCurrentPage(1);
        console.log('✅ Dados simples carregados - Transações:', transactionsArray.length);
      }

      setAccounts(accountsData);
      setCategories(categoriesData);
      setCreditCards(creditCardsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar transações baseado na aba ativa e filtros
  const transacoesFiltradas = transactions.filter(transaction => {
    // Filtro por aba (tipo)
    let passaAba = false;
    switch (abaAtiva) {
      case 'entradas':
        passaAba = transaction.tipo === 'entrada' && transaction.confirmada;
        break;
      case 'saidas':
        passaAba = transaction.tipo === 'saida' && transaction.confirmada;
        break;
      case 'contas-receber':
        passaAba = transaction.tipo === 'entrada' && !transaction.confirmada;
        break;
      case 'contas-pagar':
        passaAba = transaction.tipo === 'saida' && !transaction.confirmada;
        break;
      case 'todas':
      default:
        passaAba = true;
        break;
    }
    
    if (!passaAba) return false;

    // Novo filtro por tipo de conta
    if (filtroContaAtiva !== 'todas') {
      if (filtroContaAtiva === 'bancos') {
        // Mostrar apenas transações de contas bancárias
        if (!transaction.account || transaction.credit_card) return false;
      } else if (filtroContaAtiva === 'cartoes') {
        // Mostrar apenas transações de cartões de crédito
        if (!transaction.credit_card) return false;
      } else if (typeof filtroContaAtiva === 'number') {
        // Mostrar apenas transações de uma conta/cartão específico
        const temConta = transaction.account === filtroContaAtiva;
        const temCartao = transaction.credit_card === filtroContaAtiva;
        if (!temConta && !temCartao) return false;
      }
    }

    // Filtro por descrição
    if (filtros.descricao && !transaction.descricao.toLowerCase().includes(filtros.descricao.toLowerCase())) {
      return false;
    }

    // Filtro por período
    if (filtros.periodo.inicio && transaction.data < filtros.periodo.inicio) {
      return false;
    }
    if (filtros.periodo.fim && transaction.data > filtros.periodo.fim) {
      return false;
    }

    // Filtro por carteiras (contas e cartões) - mantido para compatibilidade
    if (filtros.carteiras.length > 0) {
      const temConta = transaction.account && filtros.carteiras.includes(transaction.account);
      const temContaDestino = transaction.to_account && filtros.carteiras.includes(transaction.to_account);
      const temCartao = transaction.credit_card && filtros.carteiras.includes(transaction.credit_card);
      
      if (!temConta && !temContaDestino && !temCartao) {
        return false;
      }
    }

    // Filtro por categorias
    if (filtros.categorias.length > 0) {
      if (!transaction.category || !filtros.categorias.includes(transaction.category)) {
        return false;
      }
    }

    return true;
  });

  const formatarMoeda = (valor: string | number) => {
    const numericValue = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const limparFiltros = () => {
    setFiltros({
      descricao: '',
      periodo: { inicio: '', fim: '' },
      carteiras: [],
      categorias: []
    });
    toast.success('Filtros limpos');
  };

  const aplicarFiltros = () => {
    setMostrarFiltros(false);
    
    // Contar filtros ativos
    let filtrosAtivos = 0;
    if (filtros.descricao) filtrosAtivos++;
    if (filtros.periodo.inicio || filtros.periodo.fim) filtrosAtivos++;
    if (filtros.carteiras.length > 0) filtrosAtivos++;
    if (filtros.categorias.length > 0) filtrosAtivos++;
    
    if (filtrosAtivos > 0) {
      toast.success(`${filtrosAtivos} filtro(s) aplicado(s)`);
    } else {
      toast('Nenhum filtro ativo');
    }
  };

  // Função para contar filtros ativos
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.descricao) count++;
    if (filtros.periodo.inicio || filtros.periodo.fim) count++;
    if (filtros.carteiras.length > 0) count++;
    if (filtros.categorias.length > 0) count++;
    return count;
  };

  // Função para obter o nome da conta/filtro ativo
  const obterNomeFiltroAtivo = () => {
    if (filtroContaAtiva === 'todas') return 'Todas as Contas';
    if (filtroContaAtiva === 'bancos') return 'Todas as Contas Bancárias';
    if (filtroContaAtiva === 'cartoes') return 'Todos os Cartões';
    
    // Procurar conta específica
    const conta = accounts.find(acc => acc.id === filtroContaAtiva);
    if (conta) return conta.nome;
    
    // Procurar cartão específico  
    const cartao = creditCards.find(card => card.id === filtroContaAtiva);
    if (cartao) return cartao.nome;
    
    return 'Filtro Desconhecido';
  };

  // Função para calcular saldo total das transações filtradas
  const calcularSaldoFiltrado = () => {
    return transacoesFiltradas.reduce((total, transaction) => {
      const valor = parseFloat(transaction.valor);
      if (transaction.tipo === 'entrada') {
        return total + valor;
      } else {
        return total - valor;
      }
    }, 0);
  };

  const toggleItemFiltro = (lista: number[], item: number) => {
    return lista.includes(item) 
      ? lista.filter(id => id !== item)
      : [...lista, item];
  };

  return {
    // Data states
    transactions,
    accounts,
    creditCards,
    categories,
    loading,
    
    // Pagination states
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    
    // Filter states
    filtros,
    filtroContaAtiva,
    mostrarFiltros,
    abaAtiva,
    
    // Computed data
    transacoesFiltradas,
    
    // Functions
    carregarDados,
    setFiltros,
    setFiltroContaAtiva,
    setMostrarFiltros,
    setAbaAtiva,
    setCurrentPage,
    setTransactions,
    aplicarFiltros,
    limparFiltros,
    contarFiltrosAtivos,
    obterNomeFiltroAtivo,
    calcularSaldoFiltrado,
    toggleItemFiltro,
    formatarMoeda,
  };
};