import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  WalletIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { transactionsAPI, accountsAPI, categoriesAPI, creditCardsAPI } from '@/services/api';
import type { Transaction, Account, Category, CreditCard } from '@/types';
import CategorySelector from '@/components/CategorySelector';
import TransactionFormNew from '@/components/TransactionFormNew';
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

interface TransactionForm {
  account?: number;
  to_account?: number;
  credit_card?: number;
  tipo: 'entrada' | 'saida' | 'transferencia';
  valor: number;
  descricao: string;
  data: string;
  category?: number;
  total_parcelas: number;
  tipo_recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  data_fim_recorrencia?: string;
  confirmada: boolean;
}

const Transactions: React.FC = () => {
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
  const [contasSelecionadas, setContasSelecionadas] = useState<number[]>([]);
  
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<TipoMovimentacao>('todas');
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarNovoModal, setMostrarNovoModal] = useState(false);
  const [transactionEditando, setTransactionEditando] = useState<Transaction | null>(null);
  const [isRecorrente, setIsRecorrente] = useState(false);
  
  // Estados para edição inline
  const [editingTransaction, setEditingTransaction] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Estados para seleção de linhas
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [hoveredTransaction, setHoveredTransaction] = useState<number | null>(null);
  
  // Estados para edição em lote
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditField, setBulkEditField] = useState<string>('');
  const [bulkEditValue, setBulkEditValue] = useState<string>('');
  const [showBulkEditDropdown, setShowBulkEditDropdown] = useState(false);
  
  const [filtros, setFiltros] = useState<Filtros>({
    descricao: '',
    periodo: {
      inicio: '',
      fim: ''
    },
    carteiras: [],
    categorias: []
  });

  const [formData, setFormData] = useState<TransactionForm>({
    tipo: 'saida',
    valor: 0,
    descricao: '',
    data: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD local
    total_parcelas: 1,
    tipo_recorrencia: 'nenhuma',
    confirmada: true
  });

  // Carregar dados das APIs
  useEffect(() => {
    carregarDados();
  }, [currentWorkspace?.id]); // Recarregar quando workspace mudar

  // Escutar mudanças de workspace
  useEffect(() => {
    const handleWorkspaceChange = () => {
      console.log('🔄 Transactions detectou mudança de workspace');
      limparDados();
      // carregarDados será chamado pelo useEffect de currentWorkspace
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange);
    };
  }, []);

  // Listener para tecla Escape sair do modo de seleção
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSelectionMode) {
        clearSelection();
      }
      if (event.key === 'Escape' && showBulkEditDropdown) {
        setShowBulkEditDropdown(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (showBulkEditDropdown && !(event.target as Element).closest('.bulk-edit-dropdown')) {
        setShowBulkEditDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelectionMode, showBulkEditDropdown]);

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

  const parseValorInput = (valorString: string): number => {
    if (!valorString) return 0;
    // Remove tudo exceto números e vírgula
    const cleanValue = valorString.replace(/[^\d,]/g, '');
    if (!cleanValue) return 0;
    
    // Se tem vírgula, trata como valor decimal (ex: 10,50)
    if (cleanValue.includes(',')) {
      const valor = parseFloat(cleanValue.replace(',', '.'));
      return isNaN(valor) ? 0 : valor;
    } else {
      // Se não tem vírgula, trata como centavos (ex: 1050 = 10,50)
      const centavos = parseInt(cleanValue);
      return centavos / 100;
    }
  };

  // Nova função para parse do valor na edição inline
  const parseValorEdicaoInline = (valorString: string): number => {
    if (!valorString) return 0;
    // Remove pontos de milhar e converte vírgula para ponto
    const cleanValue = valorString.replace(/\./g, '').replace(',', '.');
    const valor = parseFloat(cleanValue);
    return isNaN(valor) ? 0 : valor;
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
    
    return (
      <div className="flex items-center">
        <span className="text-gray-900">
          {nome}
        </span>
      </div>
    );
  };

  const abrirPopupAdicionar = () => {
    setTransactionEditando(null);
    setIsRecorrente(false);
    setMostrarNovoModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (transactionEditando) {
        const updated = await transactionsAPI.update(transactionEditando.id, formData);
        setTransactions(transactions.map(t => t.id === transactionEditando.id ? updated : t));
        toast.success('Transação atualizada com sucesso!');
      } else {
        // Para novas transações de cartão de crédito, começar como pendente
        const dataToCreate = { ...formData };
        if (dataToCreate.credit_card) {
          dataToCreate.confirmada = false; // Transações de cartão começam pendentes
        }
        
        const created = await transactionsAPI.create(dataToCreate);
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

  const toggleStatus = async (transaction: Transaction) => {
    try {
      let updated: Transaction;
      
      // Para transações de cartão de crédito
      if (transaction.credit_card) {
        if (transaction.confirmada) {
          toast.success('Esta transação já está confirmada (fatura paga)');
          return;
        }
        
        // Confirmar que deseja marcar como paga (fatura paga)
        if (!confirm('Marcar como fatura paga? Isso confirmará esta transação de cartão de crédito.')) {
          return;
        }
        
        // Usar endpoint específico para cartão
        updated = await transactionsAPI.confirmCreditCardTransaction(transaction.id);
        toast.success('Transação confirmada! (Fatura paga)');
      } else {
        // Transação normal - usar endpoint padrão
        const novoStatus = !transaction.confirmada;
        updated = await transactionsAPI.update(transaction.id, {
          ...transaction,
          confirmada: novoStatus
        });
        
        const statusTexto = novoStatus ? 'confirmada' : 'prevista';
        toast.success(`Transação marcada como ${statusTexto}!`);
      }
      
      setTransactions(transactions.map(t => t.id === transaction.id ? updated : t));
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da transação');
    }
  };

  const fecharPopup = () => {
    setMostrarPopup(false);
    setTransactionEditando(null);
  };

  // Funções para edição inline
  const startEditing = (transactionId: number, field: string, currentValue: string) => {
    if (isSelectionMode) return; // Não permitir edição no modo de seleção
    setEditingTransaction(transactionId);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingTransaction(null);
    setEditingField(null);
    setEditValue('');
  };

  // Funções para seleção de linhas
  const selectTransaction = (transactionId: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
      // Se não há mais seleções, sair do modo de seleção
      if (newSelected.size === 0) {
        setIsSelectionMode(false);
      }
    } else {
      newSelected.add(transactionId);
      // Automaticamente entrar no modo de seleção ao selecionar
      if (!isSelectionMode) {
        setIsSelectionMode(true);
      }
    }
    setSelectedTransactions(newSelected);
  };

  const selectAll = () => {
    if (selectedTransactions.size === transacoesFiltradas.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transacoesFiltradas.map(t => t.id)));
    }
  };

  const clearSelection = () => {
    setSelectedTransactions(new Set());
    setIsSelectionMode(false);
    setHoveredTransaction(null);
  };

  // Ações em massa
  const deleteSelectedTransactions = async () => {
    if (selectedTransactions.size === 0) return;
    
    const confirmMessage = `Tem certeza que deseja excluir ${selectedTransactions.size} transação(ões) selecionada(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      const deletePromises = Array.from(selectedTransactions).map(id => 
        transactionsAPI.delete(id)
      );
      
      await Promise.all(deletePromises);
      
      setTransactions(transactions.filter(t => !selectedTransactions.has(t.id)));
      setSelectedTransactions(new Set());
      toast.success(`${selectedTransactions.size} transação(ões) excluída(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir transações:', error);
      toast.error('Erro ao excluir transações selecionadas');
    }
  };

  const duplicateSelectedTransactions = async () => {
    if (selectedTransactions.size === 0) return;

    try {
      const duplicatePromises = Array.from(selectedTransactions).map(async (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return null;

        // Remove o ID e outros campos que não devem ser duplicados
        const { id: _, ...transactionData } = transaction;
        
        // Ajusta a data para hoje
        const today = new Date().toISOString().split('T')[0];
        transactionData.data = today;
        
        // Marca como não confirmada por padrão
        transactionData.confirmada = false;

        return await transactionsAPI.create(transactionData);
      });

      const newTransactions = await Promise.all(duplicatePromises);
      const validTransactions = newTransactions.filter(t => t !== null);
      
      setTransactions([...transactions, ...validTransactions]);
      setSelectedTransactions(new Set());
      toast.success(`${validTransactions.length} transação(ões) duplicada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao duplicar transações:', error);
      toast.error('Erro ao duplicar transações selecionadas');
    }
  };

  const openBulkEdit = (field: string) => {
    setBulkEditField(field);
    setBulkEditValue('');
    setShowBulkEditModal(true);
  };

  const closeBulkEditModal = () => {
    setShowBulkEditModal(false);
    setBulkEditField('');
    setBulkEditValue('');
  };

  const bulkEditTransactions = async () => {
    if (selectedTransactions.size === 0 || !bulkEditField || !bulkEditValue) return;

    try {
      const updatePromises = Array.from(selectedTransactions).map(async (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return null;

        const updateData: any = { ...transaction };
        
        if (bulkEditField === 'descricao') {
          updateData.descricao = bulkEditValue.trim();
        } else if (bulkEditField === 'valor') {
          updateData.valor = parseFloat(bulkEditValue.replace(',', '.'));
        } else if (bulkEditField === 'data') {
          updateData.data = bulkEditValue;
        } else if (bulkEditField === 'category') {
          updateData.category = bulkEditValue ? parseInt(bulkEditValue) : null;
        } else if (bulkEditField === 'account') {
          updateData.account = parseInt(bulkEditValue);
        }

        return await transactionsAPI.update(id, updateData);
      });

      const updatedTransactions = await Promise.all(updatePromises);
      const validTransactions = updatedTransactions.filter(t => t !== null);
      
      setTransactions(transactions.map(t => {
        const updated = validTransactions.find(ut => ut && ut.id === t.id);
        return updated || t;
      }));
      
      closeBulkEditModal();
      setSelectedTransactions(new Set());
      toast.success(`${validTransactions.length} transação(ões) editada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao editar transações em lote:', error);
      toast.error('Erro ao editar transações selecionadas');
    }
  };

  const confirmSelectedTransactions = async () => {
    if (selectedTransactions.size === 0) return;

    try {
      const updatePromises = Array.from(selectedTransactions).map(async (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction || transaction.confirmada) return transaction;

        if (transaction.credit_card) {
          return await transactionsAPI.confirmCreditCardTransaction(id);
        } else {
          return await transactionsAPI.update(id, { ...transaction, confirmada: true });
        }
      });

      const updatedTransactions = await Promise.all(updatePromises);
      
      setTransactions(transactions.map(t => {
        const updated = updatedTransactions.find(ut => ut && ut.id === t.id);
        return updated || t;
      }));
      
      setSelectedTransactions(new Set());
      toast.success(`${selectedTransactions.size} transação(ões) confirmada(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao confirmar transações:', error);
      toast.error('Erro ao confirmar transações selecionadas');
    }
  };

  const saveInlineEdit = async (transactionId: number) => {
    if (!editingField) return;

    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      const updateData: any = { ...transaction };
      
      if (editingField === 'descricao') {
        if (editValue.trim() === '') return; // Não salvar descrição vazia
        updateData.descricao = editValue.trim();
      } else if (editingField === 'valor') {
        updateData.valor = parseValorEdicaoInline(editValue);
      } else if (editingField === 'data') {
        updateData.data = editValue;
      } else if (editingField === 'category') {
        updateData.category = editValue ? parseInt(editValue) : null;
      } else if (editingField === 'beneficiario') {
        // Para o input de texto temporário, vamos apenas deixar como está por enquanto
        // TODO: Implementar busca/criação de beneficiário
        if (editValue.trim()) {
          // Se é um número, usa o ID
          if (!isNaN(parseInt(editValue))) {
            updateData.beneficiario = parseInt(editValue);
          } else {
            // Se é texto, por enquanto não atualiza (precisaria criar a API)
            console.log('Beneficiário por nome ainda não implementado:', editValue);
            cancelEditing();
            return;
          }
        } else {
          updateData.beneficiario = null;
        }
      } else if (editingField === 'confirmada') {
        updateData.confirmada = editValue === 'true';
      } else if (editingField === 'account') {
        // Limpar campos anteriores
        updateData.account = null;
        updateData.credit_card = null;
        
        if (editValue.startsWith('account-')) {
          updateData.account = parseInt(editValue.replace('account-', ''));
        } else if (editValue.startsWith('card-')) {
          updateData.credit_card = parseInt(editValue.replace('card-', ''));
        }
      }

      const updated = await transactionsAPI.update(transactionId, updateData);
      setTransactions(transactions.map(t => t.id === transactionId ? updated : t));
      toast.success('Transação atualizada com sucesso!');
      cancelEditing();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
      cancelEditing();
    }
  };

  // Nova função para salvar automaticamente (onBlur, Enter, etc.)
  const handleAutoSave = async (transactionId: number) => {
    if (!editingField) return;
    
    // Se o valor está vazio para campos obrigatórios, cancela
    if (editValue.trim() === '' && ['descricao'].includes(editingField)) {
      cancelEditing();
      return;
    }
    
    await saveInlineEdit(transactionId);
  };

  // Função para lidar com teclas (Enter para salvar, Escape para cancelar)
  const handleKeyDown = async (e: React.KeyboardEvent, transactionId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAutoSave(transactionId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  // Nova função para aplicar máscara em tempo real no input de valor
  const handleValorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove tudo exceto números e vírgula
    let cleanValue = value.replace(/[^\d,]/g, '');
    
    // Se tem mais de uma vírgula, mantém apenas a primeira
    const parts = cleanValue.split(',');
    if (parts.length > 2) {
      cleanValue = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limita casas decimais a 2
    if (cleanValue.includes(',')) {
      const [inteira, decimal] = cleanValue.split(',');
      cleanValue = inteira + ',' + (decimal || '').substring(0, 2);
    }
    
    // Aplica formatação de milhares na parte inteira
    if (cleanValue.includes(',')) {
      const [inteira, decimal] = cleanValue.split(',');
      const inteiraFormatada = inteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      cleanValue = inteiraFormatada + ',' + decimal;
    } else if (cleanValue.length > 3) {
      cleanValue = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    setEditValue(cleanValue);
  };

  // Função para salvar automaticamente quando selecionar em dropdowns
  const handleSelectChange = async (transactionId: number, field: string, value: string) => {
    setEditValue(value);
    
    // Para selects, salva automaticamente após um pequeno delay
    setTimeout(async () => {
      if (editingTransaction === transactionId && editingField === field) {
        await saveInlineEdit(transactionId);
      }
    }, 100);
  };

  // Função para adicionar feedback visual de salvamento
  const getEditableFieldClass = (isEditing: boolean) => {
    return isEditing 
      ? "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 transition-all duration-200" 
      : "hover:bg-gray-100 transition-colors duration-150";
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

  const abas = [
    { 
      id: 'todas' as TipoMovimentacao, 
      nome: 'Todas', 
      valor: transactions.reduce((acc, t) => acc + parseFloat(t.valor), 0)
    },
    { 
      id: 'entradas' as TipoMovimentacao, 
      nome: 'Entradas', 
      valor: transactions.filter(t => t.tipo === 'entrada' && t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0)
    },
    { 
      id: 'saidas' as TipoMovimentacao, 
      nome: 'Saídas', 
      valor: transactions.filter(t => t.tipo === 'saida' && t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0)
    },
    { 
      id: 'contas-receber' as TipoMovimentacao, 
      nome: 'Contas a Receber', 
      valor: transactions.filter(t => t.tipo === 'entrada' && !t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0)
    },
    { 
      id: 'contas-pagar' as TipoMovimentacao, 
      nome: 'Contas a Pagar', 
      valor: transactions.filter(t => t.tipo === 'saida' && !t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0)
    }
  ];

  return (
    <div className="relative">
      {/* Header Reorganizado */}
      <div className="mb-6">
        {/* Título Principal */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Transações
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Visualize e gerencie suas transações financeiras
          </p>
        </div>

        {/* Filtros de Conta e Informações */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filtros de Conta */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Visualizar:</span>
                <select
                  value={filtroContaAtiva}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor === 'todas' || valor === 'bancos' || valor === 'cartoes') {
                      setFiltroContaAtiva(valor);
                    } else {
                      setFiltroContaAtiva(parseInt(valor));
                    }
                  }}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todas">Todas as Contas</option>
                  <option value="bancos">Somente Contas Bancárias</option>
                  <option value="cartoes">Somente Cartões</option>
                  
                  {accounts.length > 0 && <optgroup label="Contas Específicas">
                    {accounts.map(account => (
                      <option key={`acc-${account.id}`} value={account.id}>
                        {account.nome}
                      </option>
                    ))}
                  </optgroup>}
                  
                  {creditCards.length > 0 && <optgroup label="Cartões Específicos">
                    {creditCards.map(card => (
                      <option key={`card-${card.id}`} value={card.id}>
                        {card.nome}
                      </option>
                    ))}
                  </optgroup>}
                </select>
              </div>
            </div>

            {/* Indicadores de Resumo */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="bg-blue-50 px-3 py-2 rounded-md">
                <span className="text-blue-700 font-medium">
                  {transacoesFiltradas.length} transação(ões)
                </span>
              </div>
              <div className={`px-3 py-2 rounded-md ${calcularSaldoFiltrado() >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className={`font-medium ${calcularSaldoFiltrado() >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Saldo: {formatarMoeda(calcularSaldoFiltrado())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <WalletIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Visualizando:</span>
            <span className="font-medium text-gray-900">{obterNomeFiltroAtivo()}</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                mostrarFiltros ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filtros Avançados
              {contarFiltrosAtivos() > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {contarFiltrosAtivos()}
                </span>
              )}
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
      </div>

      {/* Menu de Seleção */}
      {isSelectionMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedTransactions.size} transação(ões) selecionada(s)
              </span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                Total na tela: {transacoesFiltradas.length} | Geral: {totalCount}
              </span>
              {selectedTransactions.size > 0 && (
                <>
                  <span className="text-sm text-blue-700">
                    Total: {formatarMoeda(
                      transactions
                        .filter(t => selectedTransactions.has(t.id))
                        .reduce((sum, t) => sum + parseFloat(t.valor), 0)
                    )}
                  </span>
                  {transactions.filter(t => selectedTransactions.has(t.id) && !t.confirmada).length > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {transactions.filter(t => selectedTransactions.has(t.id) && !t.confirmada).length} pendente(s)
                    </span>
                  )}
                </>
              )}
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {selectedTransactions.size === transacoesFiltradas.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedTransactions.size > 0 && (
                <>
                  <button
                    onClick={confirmSelectedTransactions}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmar
                  </button>
                  
                  <button
                    onClick={deleteSelectedTransactions}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Excluir
                  </button>
                  
                  <button
                    onClick={duplicateSelectedTransactions}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicar
                  </button>
                  
                  <div className="relative bulk-edit-dropdown">
                    <button
                      onClick={() => setShowBulkEditDropdown(!showBulkEditDropdown)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar Campo
                      <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showBulkEditDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => { openBulkEdit('descricao'); setShowBulkEditDropdown(false); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Descrição
                          </button>
                          <button
                            onClick={() => { openBulkEdit('valor'); setShowBulkEditDropdown(false); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Valor
                          </button>
                          <button
                            onClick={() => { openBulkEdit('data'); setShowBulkEditDropdown(false); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Data
                          </button>
                          <button
                            onClick={() => { openBulkEdit('category'); setShowBulkEditDropdown(false); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Categoria
                          </button>
                          <button
                            onClick={() => { openBulkEdit('account'); setShowBulkEditDropdown(false); }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Conta
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <button
                onClick={clearSelection}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Pressione Escape para sair do modo de seleção"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
                    {/* Coluna sempre presente para checkbox */}
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedTransactions.size === transacoesFiltradas.length && transacoesFiltradas.length > 0}
                          onChange={selectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      )}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conta/Cartão
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiário
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                      ✓
                    </th>
                    {!isSelectionMode && (
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={isSelectionMode ? 8 : 9} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2 text-sm text-gray-500">Carregando transações...</span>
                        </div>
                      </td>
                    </tr>
                  ) : transacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={isSelectionMode ? 8 : 9} className="px-6 py-8 text-center text-sm text-gray-500">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  ) : (
                    transacoesFiltradas.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className={`${isSelectionMode ? 'cursor-pointer' : 'hover:bg-gray-50'} ${selectedTransactions.has(transaction.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''} transition-colors group`}
                        onClick={() => isSelectionMode && selectTransaction(transaction.id)}
                        onMouseEnter={() => setHoveredTransaction(transaction.id)}
                        onMouseLeave={() => setHoveredTransaction(null)}
                      >
                        {/* Checkbox - sempre presente, mas só visível no hover ou modo seleção */}
                        <td className="px-2 py-2 whitespace-nowrap">
                          <div className={`transition-all duration-200 ${isSelectionMode || hoveredTransaction === transaction.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                            <input
                              type="checkbox"
                              checked={selectedTransactions.has(transaction.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                selectTransaction(transaction.id);
                              }}
                              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded hover:scale-110 transition-transform"
                            />
                          </div>
                        </td>
                        {/* Data */}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {editingTransaction === transaction.id && editingField === 'data' ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleAutoSave(transaction.id)}
                                onKeyDown={(e) => handleKeyDown(e, transaction.id)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                title="Pressione Enter para salvar ou Escape para cancelar"
                              />
                            </div>
                          ) : (
                            <span
                              onClick={(e) => {
                                if (!isSelectionMode) {
                                  e.stopPropagation();
                                  startEditing(transaction.id, 'data', transaction.data);
                                }
                              }}
                              className={`${!isSelectionMode ? 'cursor-pointer' : ''} px-2 py-1 rounded ${getEditableFieldClass(false)}`}
                            >
                              {formatarData(transaction.data)}
                            </span>
                          )}
                        </td>
                        
                        {/* Conta/Cartão */}
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {editingTransaction === transaction.id && editingField === 'account' ? (
                            <div className="flex items-center space-x-2 min-w-[200px]">
                              <select
                                value={editValue}
                                onChange={(e) => handleSelectChange(transaction.id, 'account', e.target.value)}
                                onBlur={() => handleAutoSave(transaction.id)}
                                onKeyDown={(e) => handleKeyDown(e, transaction.id)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                autoFocus
                              >
                                <option value="">Selecione uma conta/cartão</option>
                                <optgroup label="Contas">
                                  {accounts.map((account) => (
                                    <option key={`account-${account.id}`} value={`account-${account.id}`}>
                                      {account.nome}
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Cartões de Crédito">
                                  {creditCards.map((card) => (
                                    <option key={`card-${card.id}`} value={`card-${card.id}`}>
                                      {card.nome}
                                    </option>
                                  ))}
                                </optgroup>
                              </select>
                            </div>
                          ) : (
                            <div 
                              className={`${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded`}
                              onClick={(e) => {
                                if (!isSelectionMode) {
                                  e.stopPropagation();
                                  const currentValue = transaction.account 
                                    ? `account-${transaction.account}` 
                                    : transaction.credit_card 
                                      ? `card-${transaction.credit_card}` 
                                      : '';
                                  startEditing(transaction.id, 'account', currentValue);
                                }
                              }}
                            >
                              {getContaDisplay(transaction)}
                            </div>
                          )}
                        </td>
                        
                        {/* Beneficiário */}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {editingTransaction === transaction.id && editingField === 'beneficiario' ? (
                            <div className="flex items-center space-x-2 min-w-[200px]">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => handleAutoSave(transaction.id)}
                                  onKeyDown={(e) => handleKeyDown(e, transaction.id)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                  placeholder="Digite o nome do beneficiário"
                                  autoFocus
                                />
                              </div>
                              <button
                                onClick={cancelEditing}
                                className="text-red-600 hover:text-red-800 text-xs"
                                title="Fechar"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded transition-colors`}
                              onClick={(e) => {
                                if (!isSelectionMode) {
                                  e.stopPropagation();
                                  startEditing(transaction.id, 'beneficiario', transaction.beneficiario_name || '');
                                }
                              }}
                            >
                              {transaction.beneficiario_name || '-'}
                            </span>
                          )}
                        </td>
                        
                        {/* Descrição */}
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {editingTransaction === transaction.id && editingField === 'descricao' ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleAutoSave(transaction.id)}
                                onKeyDown={(e) => handleKeyDown(e, transaction.id)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                                maxLength={200}
                                autoFocus
                                title="Pressione Enter para salvar ou Escape para cancelar"
                              />
                            </div>
                          ) : (
                            <div>
                              <div 
                                className={`font-medium ${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded`}
                                onClick={(e) => {
                                  if (!isSelectionMode) {
                                    e.stopPropagation();
                                    startEditing(transaction.id, 'descricao', transaction.descricao);
                                  }
                                }}
                              >
                                {transaction.descricao}
                              </div>
                              {transaction.total_parcelas > 1 && (
                                <div className="text-xs text-gray-500">
                                  Parcela {transaction.numero_parcela}/{transaction.total_parcelas}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        
                        {/* Categoria */}
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {editingTransaction === transaction.id && editingField === 'category' ? (
                            <div className="flex items-center space-x-2 min-w-[200px]">
                              <div className="flex-1">
                                <select
                                  value={editValue || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setEditValue(value);
                                    // Auto-salvar após seleção
                                    if (value) {
                                      setTimeout(() => handleAutoSave(transaction.id), 100);
                                    }
                                  }}
                                  onBlur={() => handleAutoSave(transaction.id)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                  autoFocus
                                >
                                  <option value="">Selecionar categoria...</option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                onClick={cancelEditing}
                                className="text-red-600 hover:text-red-800 text-xs"
                                title="Fechar"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${!isSelectionMode ? 'cursor-pointer hover:bg-blue-200' : ''} transition-colors`}
                              onClick={(e) => {
                                if (!isSelectionMode) {
                                  e.stopPropagation();
                                  startEditing(transaction.id, 'category', transaction.category?.toString() || '');
                                }
                              }}
                            >
                              {transaction.category_name || 'Sem categoria'}
                            </span>
                          )}
                        </td>
                        
                        {/* Valor */}
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          {editingTransaction === transaction.id && editingField === 'valor' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <input
                                type="text"
                                value={editValue}
                                onChange={handleValorInputChange}
                                onBlur={() => handleAutoSave(transaction.id)}
                                onKeyDown={(e) => handleKeyDown(e, transaction.id)}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 text-right"
                                placeholder="0,00"
                                autoFocus
                                title="Pressione Enter para salvar ou Escape para cancelar"
                              />
                            </div>
                          ) : (
                            <span 
                              className={`${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded ${
                                transaction.tipo === 'entrada' ? 'text-green-600' : 
                                transaction.tipo === 'saida' ? 'text-red-600' : 'text-blue-600'
                              }`}
                              onClick={(e) => {
                                if (!isSelectionMode) {
                                  e.stopPropagation();
                                  startEditing(transaction.id, 'valor', transaction.valor.toString().replace('.', ','));
                                }
                              }}
                            >
                              {transaction.tipo === 'entrada' ? '+' : transaction.tipo === 'saida' ? '-' : '↔'}
                              {formatarMoeda(transaction.valor)}
                            </span>
                          )}
                        </td>
                        
                        {/* Status como ícone */}
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          {/* Para cartão de crédito: sempre confirmado, sem interação */}
                          {transaction.credit_card ? (
                            <div className="flex justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            /* Para outras contas: permitir toggle */
                            <button
                              onClick={(e) => {
                                if (!isSelectionMode) {
                                  e.stopPropagation();
                                  toggleStatus(transaction);
                                }
                              }}
                              disabled={isSelectionMode}
                              className={`flex justify-center items-center w-full ${!isSelectionMode ? 'hover:bg-gray-100' : ''} rounded p-1 transition-colors ${isSelectionMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isSelectionMode ? 'Desative o modo de seleção para alterar status' : (transaction.confirmada ? "Clique para marcar como prevista" : "Clique para marcar como confirmada")}
                            >
                              <svg 
                                className={`w-4 h-4 ${transaction.confirmada ? 'text-green-600' : 'text-gray-300'} transition-colors`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </td>
                        
                        {/* Ações */}
                        {!isSelectionMode && (
                          <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                              title="Excluir transação"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginação - só aparece se houver mais de uma página */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    {/* Mobile: botões simples */}
                    <button
                      onClick={() => carregarDados(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => carregarDados(currentPage + 1)}
                      disabled={!hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                  
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{(currentPage - 1) * 1000 + 1}</span> a{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 1000, totalCount)}
                        </span> de{' '}
                        <span className="font-medium">{totalCount}</span> transações
                      </p>
                    </div>
                    
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {/* Botão Anterior */}
                        <button
                          onClick={() => carregarDados(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Números das páginas */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => carregarDados(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === currentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {/* Botão Próxima */}
                        <button
                          onClick={() => carregarDados(currentPage + 1)}
                          disabled={!hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {/* Contas */}
                  {accounts.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">CONTAS</p>
                      <div className="space-y-2">
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
                      </div>
                    </div>
                  )}
                  
                  {/* Cartões */}
                  {creditCards.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">CARTÕES</p>
                      <div className="space-y-2">
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
                            <span className="ml-2 text-sm text-gray-700">{card.nome}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
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

              {/* Botões de Ação */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={limparFiltros}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Limpar Filtros
                </button>
                <button
                  onClick={aplicarFiltros}
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

      {/* Modal de Edição em Lote */}
      {showBulkEditModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeBulkEditModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Editar {bulkEditField === 'descricao' ? 'Descrição' : 
                          bulkEditField === 'valor' ? 'Valor' :
                          bulkEditField === 'data' ? 'Data' :
                          bulkEditField === 'category' ? 'Categoria' :
                          bulkEditField === 'account' ? 'Conta' : 'Campo'} em Lote
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Esta ação irá alterar {selectedTransactions.size} transação(ões) selecionada(s).
                </p>

                <div className="mb-4">
                  {bulkEditField === 'descricao' && (
                    <input
                      type="text"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      placeholder="Nova descrição"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'valor' && (
                    <input
                      type="number"
                      step="0.01"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      placeholder="Novo valor"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'data' && (
                    <input
                      type="date"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'category' && (
                    <select
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {bulkEditField === 'account' && (
                    <select
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma conta...</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeBulkEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={bulkEditTransactions}
                    disabled={!bulkEditValue}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Novo Modal de Transação */}
      <TransactionFormNew
        isOpen={mostrarNovoModal}
        onClose={() => setMostrarNovoModal(false)}
        onSuccess={() => {
          carregarDados(); // Recarregar dados após sucesso
          toast.success('Transação criada com sucesso!');
        }}
      />
    </div>
  );
};

export default Transactions;
