import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  WalletIcon,
  TagIcon,
  BuildingOfficeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { transactionsAPI, accountsAPI, categoriesAPI, creditCardsAPI } from '@/services/api';
import type { Transaction, Account, Category, CreditCard } from '@/types';
import CategorySelector from '@/components/CategorySelector';
import toast from 'react-hot-toast';

interface Filtros {
  descricao: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  carteiras: number[];
  categorias: number[];
  centrosCusto: number[];
}

type TipoMovimentacao = 'todas' | 'entradas' | 'saidas' | 'contas-receber' | 'contas-pagar';

interface TransactionForm {
  account?: number;
  to_account?: number;
  credit_card?: number;
  tipo: 'entrada' | 'saida' | 'transferencia';
  valor: number;
  descricao: string;
  observacoes: string;
  data: string;
  category?: number;
  cost_center?: number;
  total_parcelas: number;
  tipo_recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  data_fim_recorrencia?: string;
}

const Transactions: React.FC = () => {
  
  // Estados para dados carregados das APIs
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<TipoMovimentacao>('todas');
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [transactionEditando, setTransactionEditando] = useState<Transaction | null>(null);
  const [isRecorrente, setIsRecorrente] = useState(false);
  
  const [filtros, setFiltros] = useState<Filtros>({
    descricao: '',
    periodo: {
      inicio: '',
      fim: ''
    },
    carteiras: [],
    categorias: [],
    centrosCusto: []
  });

  const [formData, setFormData] = useState<TransactionForm>({
    tipo: 'saida',
    valor: 0,
    descricao: '',
    observacoes: '',
    data: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD local
    total_parcelas: 1,
    tipo_recorrencia: 'nenhuma'
  });

  // Carregar dados das APIs
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [transactionsData, accountsData, categoriesData, creditCardsData] = await Promise.all([
        transactionsAPI.getAll(),
        accountsAPI.getAll(),
        categoriesAPI.getAll(),
        creditCardsAPI.getAll()
      ]);

      setTransactions(transactionsData);
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

  // Filtrar transações baseado na aba ativa
  const transacoesFiltradas = transactions.filter(transaction => {
    switch (abaAtiva) {
      case 'entradas':
        return transaction.tipo === 'entrada';
      case 'saidas':
        return transaction.tipo === 'saida';
      case 'todas':
      default:
        return true;
    }
  });

  const formatarMoeda = (valor: string | number) => {
    const numericValue = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  };

  const parseValorInput = (valorString: string): number => {
    if (!valorString) return 0;
    // Remove tudo exceto números
    const numericString = valorString.replace(/\D/g, '');
    if (!numericString) return 0;
    // Converte para centavos e depois para reais
    const centavos = parseInt(numericString);
    return centavos / 100;
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseValorInput(inputValue);
    setFormData(prev => ({ ...prev, valor: numericValue }));
  };

  const formatarValorDisplay = (valor: number): string => {
    if (valor === 0) return '';
    // Converte para centavos para manipulação
    const centavos = Math.round(valor * 100);
    const reais = Math.floor(centavos / 100);
    const centavosRestantes = centavos % 100;
    
    if (centavos < 100) {
      // Menos de 1 real, mostra só os centavos
      return `0,${centavosRestantes.toString().padStart(2, '0')}`;
    } else {
      // 1 real ou mais
      return `${reais.toLocaleString('pt-BR')},${centavosRestantes.toString().padStart(2, '0')}`;
    }
  };

  const formatarData = (data: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getContaOuCartaoNome = (transaction: Transaction): string => {
    if (transaction.account_name) {
      return transaction.account_name;
    } else if (transaction.credit_card) {
      const cartao = creditCards.find(card => card.id === transaction.credit_card);
      return cartao ? cartao.nome : 'Cartão não encontrado';
    }
    return 'Conta não especificada';
  };

  const getContaDisplay = (transaction: Transaction) => {
    const nome = getContaOuCartaoNome(transaction);
    const isCartao = transaction.credit_card && !transaction.account_name;
    
    return (
      <div className="flex items-center">
        {isCartao && (
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" title="Cartão de Crédito"></div>
        )}
        <span className={isCartao ? 'text-orange-700' : 'text-gray-900'}>
          {nome}
        </span>
      </div>
    );
  };

  const getCategoriaDisplay = (transaction: Transaction) => {
    if (!transaction.category_name) {
      return 'Sem categoria';
    }

    // Se tiver informação de categoria pai (future enhancement)
    // Por enquanto, apenas exibe o nome da categoria
    return transaction.category_name;
  };

  const abrirPopupAdicionar = () => {
    setTransactionEditando(null);
    setIsRecorrente(false);
    setFormData({
      tipo: 'saida',
      valor: 0,
      descricao: '',
      observacoes: '',
      data: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD local
      total_parcelas: 1,
      tipo_recorrencia: 'nenhuma'
    });
    setMostrarPopup(true);
  };

  const abrirPopupEditar = (transaction: Transaction) => {
    setTransactionEditando(transaction);
    setIsRecorrente(transaction.tipo_recorrencia !== 'nenhuma');
    setFormData({
      account: transaction.account,
      credit_card: transaction.credit_card,
      tipo: transaction.tipo,
      valor: parseFloat(transaction.valor),
      descricao: transaction.descricao,
      observacoes: transaction.observacoes,
      data: transaction.data,
      category: transaction.category,
      cost_center: transaction.cost_center,
      total_parcelas: transaction.total_parcelas,
      tipo_recorrencia: transaction.tipo_recorrencia,
      data_fim_recorrencia: transaction.data_fim_recorrencia
    });
    setMostrarPopup(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (transactionEditando) {
        const updated = await transactionsAPI.update(transactionEditando.id, formData);
        setTransactions(transactions.map(t => t.id === transactionEditando.id ? updated : t));
        toast.success('Transação atualizada com sucesso!');
      } else {
        const created = await transactionsAPI.create(formData);
        setTransactions([...transactions, created]);
        toast.success('Transação criada com sucesso!');
      }
      setMostrarPopup(false);
      setTransactionEditando(null);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast.error('Erro ao salvar transação');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transactionsAPI.delete(id);
        setTransactions(transactions.filter(t => t.id !== id));
        toast.success('Transação excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        toast.error('Erro ao excluir transação');
      }
    }
  };

  const fecharPopup = () => {
    setMostrarPopup(false);
    setTransactionEditando(null);
  };

  const limparFiltros = () => {
    setFiltros({
      descricao: '',
      periodo: { inicio: '', fim: '' },
      carteiras: [],
      categorias: [],
      centrosCusto: []
    });
  };

  const toggleItemFiltro = (lista: number[], item: number) => {
    return lista.includes(item) 
      ? lista.filter(id => id !== item)
      : [...lista, item];
  };

  const abas = [
    { 
      id: 'todas' as TipoMovimentacao, 
      nome: 'Todas', 
      valor: transactions.reduce((acc, t) => acc + parseFloat(t.valor), 0)
    },
    { 
      id: 'entradas' as TipoMovimentacao, 
      nome: 'Entradas', 
      valor: transactions.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + parseFloat(t.valor), 0)
    },
    { 
      id: 'saidas' as TipoMovimentacao, 
      nome: 'Saídas', 
      valor: transactions.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + parseFloat(t.valor), 0)
    },
    { 
      id: 'contas-receber' as TipoMovimentacao, 
      nome: 'Contas a Receber', 
      valor: 0 // Implementar quando tiver contas a receber
    },
    { 
      id: 'contas-pagar' as TipoMovimentacao, 
      nome: 'Contas a Pagar', 
      valor: 0 // Implementar quando tiver contas a pagar
    }
  ];

  return (
    <div className="relative">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Movimentações
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Visualize e gerencie suas movimentações financeiras
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              mostrarFiltros ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Filtros
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Exportar
          </button>
          <button
            type="button"
            onClick={abrirPopupAdicionar}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Adicionar
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Conteúdo Principal */}
        <div className={`flex-1 ${mostrarFiltros ? 'mr-80' : ''} transition-all duration-300`}>
          {/* Abas */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {abas.map((aba) => (
                  <button
                    key={aba.id}
                    onClick={() => setAbaAtiva(aba.id)}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      abaAtiva === aba.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{aba.nome}</div>
                      <div className="text-sm font-medium mt-1 text-gray-600">
                        {formatarMoeda(aba.valor)}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tabela de Movimentações */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Centro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2 text-sm text-gray-500">Carregando transações...</span>
                        </div>
                      </td>
                    </tr>
                  ) : transacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  ) : (
                    transacoesFiltradas.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(transaction.data)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatarData(transaction.data)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{transaction.descricao}</div>
                            <div className="text-gray-500 text-xs">{getCategoriaDisplay(transaction)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getContaDisplay(transaction)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Geral
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`${
                            transaction.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatarMoeda(transaction.valor)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => abrirPopupEditar(transaction)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 mr-2"
                            title="Editar transação"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                            title="Excluir transação"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Barra Lateral de Filtros */}
        {mostrarFiltros && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-40 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                <button
                  onClick={() => setMostrarFiltros(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MagnifyingGlassIcon className="h-4 w-4 inline mr-2" />
                  Descrição
                </label>
                <input
                  type="text"
                  value={filtros.descricao}
                  onChange={(e) => setFiltros(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Buscar por descrição..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Período */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-2" />
                  Período
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">De</label>
                    <input
                      type="date"
                      value={filtros.periodo.inicio}
                      onChange={(e) => setFiltros(prev => ({ 
                        ...prev, 
                        periodo: { ...prev.periodo, inicio: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Até</label>
                    <input
                      type="date"
                      value={filtros.periodo.fim}
                      onChange={(e) => setFiltros(prev => ({ 
                        ...prev, 
                        periodo: { ...prev.periodo, fim: e.target.value }
                      }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Carteiras */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <WalletIcon className="h-4 w-4 inline mr-2" />
                  Contas e Cartões
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {accounts.map((account) => (
                    <label key={`account-${account.id}`} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filtros.carteiras.includes(account.id)}
                        onChange={() => setFiltros(prev => ({
                          ...prev,
                          carteiras: toggleItemFiltro(prev.carteiras, account.id)
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{account.nome}</span>
                    </label>
                  ))}
                  {creditCards.map((card) => (
                    <label key={`card-${card.id}`} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filtros.carteiras.includes(card.id)}
                        onChange={() => setFiltros(prev => ({
                          ...prev,
                          carteiras: toggleItemFiltro(prev.carteiras, card.id)
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 text-orange-600">{card.nome}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categorias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="h-4 w-4 inline mr-2" />
                  Categorias
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filtros.categorias.includes(category.id)}
                        onChange={() => setFiltros(prev => ({
                          ...prev,
                          categorias: toggleItemFiltro(prev.categorias, category.id)
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.nome}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Centros de Custo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 inline mr-2" />
                  Centros de Custo
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {['Pessoal', 'Trabalho', 'Família'].map((centroCusto, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{centroCusto}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={limparFiltros}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={() => console.log('Aplicar filtros:', filtros)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay */}
        {mostrarFiltros && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-30"
            onClick={() => setMostrarFiltros(false)}
          />
        )}

        {/* Popup Modal */}
        {mostrarPopup && (
          <>
            {/* Backdrop com blur */}
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" onClick={fecharPopup} />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {transactionEditando ? 'Editar Transação' : 'Nova Transação'}
                  </h3>
                  <button
                    onClick={fecharPopup}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Formulário - Container com scroll */}
                <div className="flex-1 overflow-y-auto">
                  <form id="transaction-form" onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Descrição */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Supermercado, Salário, etc."
                        required
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'entrada' | 'saida' | 'transferencia' }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="saida">Saída</option>
                        <option value="entrada">Entrada</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                    </div>

                    {/* Valor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor (R$)
                      </label>
                      <input
                        type="text"
                        value={formatarValorDisplay(formData.valor)}
                        onChange={handleValorChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0,00"
                        required
                      />
                    </div>

                    {/* Data */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data
                      </label>
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Conta */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conta/Cartão
                      </label>
                      <select
                        value={formData.account || formData.credit_card || ''}
                        onChange={(e) => {
                          const selectedId = parseInt(e.target.value);
                          if (!selectedId) {
                            setFormData(prev => ({ ...prev, account: undefined, credit_card: undefined }));
                            return;
                          }
                          const isAccount = accounts.some(acc => acc.id === selectedId);
                          if (isAccount) {
                            setFormData(prev => ({ ...prev, account: selectedId, credit_card: undefined }));
                          } else {
                            setFormData(prev => ({ ...prev, credit_card: selectedId, account: undefined }));
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione uma conta</option>
                        <optgroup label="Contas">
                          {accounts.map((account) => (
                            <option key={`account-${account.id}`} value={account.id}>
                              {account.nome}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Cartões de Crédito">
                          {creditCards.map((card) => (
                            <option key={`card-${card.id}`} value={card.id}>
                              {card.nome}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <CategorySelector
                        value={formData.category}
                        onChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
                        placeholder="Selecione uma categoria"
                        showHierarchy={true}
                        className="w-full"
                      />
                    </div>

                    {/* Parcelas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Parcelas
                      </label>
                      <select
                        value={formData.total_parcelas}
                        onChange={(e) => setFormData(prev => ({ ...prev, total_parcelas: parseInt(e.target.value) || 1 }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={1}>À vista (1x)</option>
                        {Array.from({ length: 24 }, (_, i) => i + 2).map(num => (
                          <option key={num} value={num}>
                            {num}x de {formatarMoeda(formData.valor / num)}
                          </option>
                        ))}
                      </select>
                      {formData.total_parcelas > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Primeira parcela será lançada na data selecionada, 
                          demais parcelas nos meses seguintes.
                        </p>
                      )}
                    </div>

                    {/* Espaço para manter o grid */}
                    <div></div>

                    {/* Tipo de Transação - Toggle Recorrente */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de Lançamento
                      </label>
                      <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                        <span className={`text-sm font-medium ${!isRecorrente ? 'text-gray-900' : 'text-gray-500'}`}>
                          Transação única
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRecorrente(!isRecorrente);
                            setFormData(prev => ({ 
                              ...prev, 
                              tipo_recorrencia: !isRecorrente ? 'mensal' : 'nenhuma' 
                            }));
                          }}
                          className={`mx-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isRecorrente ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isRecorrente ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-sm font-medium ${isRecorrente ? 'text-gray-900' : 'text-gray-500'}`}>
                          Recorrente
                        </span>
                      </div>
                      
                      {isRecorrente && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequência da Recorrência
                          </label>
                          <select
                            value={formData.tipo_recorrencia}
                            onChange={(e) => setFormData(prev => ({ ...prev, tipo_recorrencia: e.target.value as any }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="mensal">Mensal</option>
                            <option value="semanal">Semanal</option>
                            <option value="anual">Anual</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Será criada automaticamente na frequência selecionada, sempre na mesma data.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Observações */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Observações adicionais..."
                      />
                    </div>
                  </div>
                </form>
                </div>

                {/* Botões - Fixos na parte inferior */}
                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                  <button
                    type="button"
                    onClick={fecharPopup}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="transaction-form"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    {transactionEditando ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
