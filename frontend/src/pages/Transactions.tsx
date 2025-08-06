import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '@/services/api';
import type { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import toast from 'react-hot-toast';
import {
  TransactionHeader,
  TransactionTabs,
  TransactionFilters,
  TransactionTable,
  BulkOperations,
  TransactionModals
} from '@/components/Transactions';

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
  // Use the new hook for transactions logic
  const {
    transactions,
    accounts,
    creditCards,
    categories,
    loading,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    filtros,
    filtroContaAtiva,
    mostrarFiltros,
    abaAtiva,
    transacoesFiltradas,
    carregarDados,
    setFiltros,
    setFiltroContaAtiva,
    setMostrarFiltros,
    setAbaAtiva,
    setTransactions,
    aplicarFiltros,
    limparFiltros,
    contarFiltrosAtivos,
    obterNomeFiltroAtivo,
    calcularSaldoFiltrado,
    toggleItemFiltro,
    formatarMoeda
  } = useTransactions();
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

  const [formData, setFormData] = useState<TransactionForm>({
    tipo: 'saida',
    valor: 0,
    descricao: '',
    data: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD local
    total_parcelas: 1,
    tipo_recorrencia: 'nenhuma',
    confirmada: true
  });

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



  return (
    <div className="relative">
      {/* Header */}
      <TransactionHeader
        filtroContaAtiva={filtroContaAtiva}
        setFiltroContaAtiva={setFiltroContaAtiva}
        mostrarFiltros={mostrarFiltros}
        setMostrarFiltros={setMostrarFiltros}
        accounts={accounts}
        creditCards={creditCards}
        transacoesFiltradas={transacoesFiltradas}
        contarFiltrosAtivos={contarFiltrosAtivos}
        obterNomeFiltroAtivo={obterNomeFiltroAtivo}
        calcularSaldoFiltrado={calcularSaldoFiltrado}
        formatarMoeda={formatarMoeda}
        abrirPopupAdicionar={abrirPopupAdicionar}
      />

      {/* Bulk Operations */}
      <BulkOperations
        isSelectionMode={isSelectionMode}
        selectedTransactions={selectedTransactions}
        transactions={transactions}
        transacoesFiltradas={transacoesFiltradas}
        totalCount={totalCount}
        formatarMoeda={formatarMoeda}
        selectAll={selectAll}
        clearSelection={clearSelection}
        confirmSelectedTransactions={confirmSelectedTransactions}
        deleteSelectedTransactions={deleteSelectedTransactions}
        duplicateSelectedTransactions={duplicateSelectedTransactions}
        showBulkEditDropdown={showBulkEditDropdown}
        setShowBulkEditDropdown={setShowBulkEditDropdown}
        openBulkEdit={openBulkEdit}
      />

      <div className="flex">
        {/* Conteúdo Principal */}
        <div className={`flex-1 ${mostrarFiltros ? 'mr-80' : ''} transition-all duration-300`}>
          {/* Tabs */}
          <TransactionTabs
            abaAtiva={abaAtiva}
            setAbaAtiva={setAbaAtiva}
            transactions={transactions}
            formatarMoeda={formatarMoeda}
          />

          {/* Tabela de Movimentações */}
          <TransactionTable
            loading={loading}
            transacoesFiltradas={transacoesFiltradas}
            isSelectionMode={isSelectionMode}
            selectedTransactions={selectedTransactions}
            hoveredTransaction={hoveredTransaction}
            setHoveredTransaction={setHoveredTransaction}
            editingTransaction={editingTransaction}
            editingField={editingField}
            editValue={editValue}
            accounts={accounts}
            creditCards={creditCards}
            categories={categories}
            selectAll={selectAll}
            selectTransaction={selectTransaction}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            handleAutoSave={handleAutoSave}
            handleKeyDown={handleKeyDown}
            handleValorInputChange={handleValorInputChange}
            handleSelectChange={handleSelectChange}
            setEditValue={setEditValue}
            toggleStatus={toggleStatus}
            handleDelete={handleDelete}
            formatarData={formatarData}
            getContaDisplay={getContaDisplay}
            getEditableFieldClass={getEditableFieldClass}
            formatarMoeda={formatarMoeda}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            hasNextPage={hasNextPage}
            carregarDados={carregarDados}
          />
        </div>

        {/* Barra Lateral de Filtros */}
        <TransactionFilters
          mostrarFiltros={mostrarFiltros}
          setMostrarFiltros={setMostrarFiltros}
          filtros={filtros}
          setFiltros={setFiltros}
          accounts={accounts}
          creditCards={creditCards}
          categories={categories}
          aplicarFiltros={aplicarFiltros}
          limparFiltros={limparFiltros}
          toggleItemFiltro={toggleItemFiltro}
        />
      </div>

      {/* Modals */}
      <TransactionModals
        mostrarPopup={mostrarPopup}
        setMostrarPopup={setMostrarPopup}
        transactionEditando={transactionEditando}
        isRecorrente={isRecorrente}
        setIsRecorrente={setIsRecorrente}
        formData={formData}
        setFormData={setFormData}
        mostrarNovoModal={mostrarNovoModal}
        setMostrarNovoModal={setMostrarNovoModal}
        showBulkEditModal={showBulkEditModal}
        setShowBulkEditModal={setShowBulkEditModal}
        bulkEditField={bulkEditField}
        bulkEditValue={bulkEditValue}
        setBulkEditValue={setBulkEditValue}
        selectedTransactions={selectedTransactions}
        accounts={accounts}
        creditCards={creditCards}
        categories={categories}
        handleSubmit={handleSubmit}
        fecharPopup={fecharPopup}
        handleValorChange={handleValorChange}
        formatarValorDisplay={formatarValorDisplay}
        carregarDados={carregarDados}
        closeBulkEditModal={closeBulkEditModal}
        bulkEditTransactions={bulkEditTransactions}
      />
    </div>
  );
};

export default Transactions;
