import React, { useState } from 'react';
import { 
  PlusIcon, 
  BanknotesIcon, 
  CreditCardIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAccounts } from '../hooks/useAccounts';
import { Account, AccountFormData } from '../types';
import { bancosBrasileiros } from '../data/bancos';
import { BancoLogo } from '../utils/assets';
import { accountsAPI } from '@/services/api';

const Accounts: React.FC = () => {
  const { accounts, loading, error, createAccount, updateAccount, deleteAccount, recalculateAllBalances, resetInitialBalances } = useAccounts();
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [carteiraEditando, setCarteiraEditando] = useState<Account | null>(null);
  const [carteiraParaDeletar, setCarteiraParaDeletar] = useState<Account | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [novaCarteira, setNovaCarteira] = useState<AccountFormData>({
    nome: '',
    tipo: 'conta-bancaria',
    banco: '',
    codigo_banco: '',
    saldo_inicial: 0,
    eh_conta: false,
    cor: 'bg-blue-500',
    icone: 'bank'
  });

  const [etapaModal, setEtapaModal] = useState<'tipo' | 'detalhes'>('tipo');
  const [filtroBanco, setFiltroBanco] = useState('');

  // Cores baseadas nas marcas dos principais bancos brasileiros
  const getCorBanco = (codigoBanco?: string): string => {
    const coresBancos: { [key: string]: string } = {
      '001': 'from-yellow-500 to-yellow-600', // Banco do Brasil
      '033': 'from-red-500 to-red-600', // Santander
      '104': 'from-blue-600 to-blue-700', // Caixa
      '237': 'from-red-600 to-red-700', // Bradesco
      '341': 'from-orange-500 to-orange-600', // Itaú
      '077': 'from-orange-600 to-orange-700', // Inter
      '260': 'from-purple-600 to-purple-700', // Nubank
      '336': 'from-yellow-400 to-yellow-500', // C6 Bank
      '212': 'from-green-500 to-green-600', // Original
      '208': 'from-gray-800 to-gray-900', // BTG Pactual
      '422': 'from-green-600 to-green-700', // Safra
      '218': 'from-blue-500 to-blue-600', // BS2
      '318': 'from-blue-400 to-blue-500', // BMG
    };
    
    return coresBancos[codigoBanco || ''] || 'from-gray-500 to-gray-600';
  };

  const tiposCarteira = [
    { value: 'conta-bancaria', label: 'Conta Bancária', icon: BuildingLibraryIcon },
    { value: 'conta-investimento', label: 'Conta Investimento', icon: CurrencyDollarIcon },
    { value: 'criptomoeda', label: 'Criptomoeda', icon: CurrencyDollarIcon },
    { value: 'cofre', label: 'Cofre', icon: LockClosedIcon },
    { value: 'cartao-prepago', label: 'Cartão Pré-pago', icon: CreditCardIcon }
  ];

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'bank': return BuildingLibraryIcon;
      case 'crypto': return CurrencyDollarIcon;
      case 'safe': return LockClosedIcon;
      default: return BanknotesIcon;
    }
  };

  const getIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case 'conta-bancaria': 
      case 'conta-investimento': 
        return 'bank';
      case 'criptomoeda': 
        return 'crypto';
      case 'cofre': 
      case 'cartao-prepago': 
        return 'safe';
      default: 
        return 'bank';
    }
  };

  const getCorPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'conta-bancaria': return 'bg-blue-500';
      case 'conta-investimento': return 'bg-green-500';
      case 'criptomoeda': return 'bg-orange-500';
      case 'cofre': return 'bg-gray-700';
      case 'cartao-prepago': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaCarteira.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      setSubmitting(true);
      
      if (carteiraEditando) {
        // Editar conta existente
        await updateAccount(carteiraEditando.id, {
          ...novaCarteira,
          cor: getCorPorTipo(novaCarteira.tipo),
          icone: getIconePorTipo(novaCarteira.tipo)
        });
      } else {
        // Criar nova conta
        await createAccount({
          ...novaCarteira,
          cor: getCorPorTipo(novaCarteira.tipo),
          icone: getIconePorTipo(novaCarteira.tipo)
        });
      }

      resetModal();
    } catch (error) {
      // Erro já tratado no hook useAccounts
      console.error('Erro ao salvar conta:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditar = (account: Account) => {
    setCarteiraEditando(account);
    setNovaCarteira({
      nome: account.nome,
      tipo: account.tipo,
      banco: account.banco || '',
      codigo_banco: account.codigo_banco || '',
      saldo_inicial: parseFloat(account.saldo_inicial),
      eh_conta: account.eh_conta,
      cor: account.cor,
      icone: account.icone
    });
    setEtapaModal('detalhes'); // Pula direto para detalhes quando editando
    setMostrarModal(true);
  };

  const handleExcluir = async (account: Account) => {
    if (confirm(`Tem certeza que deseja excluir a conta "${account.nome}"?`)) {
      try {
        await deleteAccount(account.id);
      } catch (error) {
        // Erro já tratado no hook useAccounts
        console.error('Erro ao excluir conta:', error);
      }
    }
  };

  // Função para filtrar bancos de forma inteligente
  const bancosFiltrados = bancosBrasileiros.filter(banco => {
    if (!filtroBanco) return true;
    
    const termo = filtroBanco.toLowerCase();
    return (
      banco.codigo.includes(termo) ||
      banco.nome.toLowerCase().includes(termo) ||
      banco.nomeCompleto.toLowerCase().includes(termo)
    );
  });

  // Reset filtro quando modal fecha
  const resetModal = () => {
    setMostrarModal(false);
    setCarteiraEditando(null);
    setEtapaModal('tipo');
    setFiltroBanco('');
    setNovaCarteira({ 
      nome: '', 
      tipo: 'conta-bancaria', 
      banco: '', 
      codigo_banco: '', 
      saldo_inicial: 0, 
      eh_conta: false,
      cor: 'bg-blue-500',
      icone: 'bank'
    });
  };

  const precisaBanco = novaCarteira.tipo === 'conta-bancaria' || novaCarteira.tipo === 'conta-investimento';

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando contas...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass-card p-4 border border-danger-200/50 dark:border-danger-800/50">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-danger-400 mr-2" />
            <p className="text-danger-800 dark:text-danger-400">{error}</p>
          </div>
        </div>
      )}

      {/* Content - só mostra se não está carregando */}
      {!loading && (
        <>
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl sm:truncate">
            Carteiras
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie suas carteiras, contas bancárias, investimentos e mais
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={resetInitialBalances}
            disabled={loading}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zerar saldos iniciais de contas sem transações"
          >
            <XCircleIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Zerando...' : 'Zerar Saldos'}
          </button>
          <button
            type="button"
            onClick={recalculateAllBalances}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            title="Recalcular saldos das contas baseado nas transações"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Recalculando...' : 'Recalcular Saldos'}
          </button>
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Carteira
          </button>
        </div>
      </div>

      {/* Lista de Carteiras */}
      <div className="space-y-8">
        {/* Card de Resumo Total */}
        <div className="glass-card bg-gradient-to-r from-primary-500/80 to-primary-600/80 dark:from-primary-600/80 dark:to-primary-700/80 p-6 text-white float-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Todas as Contas</h3>
              <p className="text-sm opacity-90">Saldo total de todas as carteiras</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {formatCurrency(accounts.reduce((total, account) => total + parseFloat(account.saldo_atual), 0))}
              </p>
              <p className="text-sm opacity-90">
                {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
              </p>
            </div>
          </div>
        </div>

        {/* Seção de Resumo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Tipo de Conta</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {tiposCarteira.map((tipo) => {
              // Filtrar contas por tipo e somar valores
              const contasPorTipo = accounts.filter(account => account.tipo === tipo.value);
              const totalPorTipo = contasPorTipo.reduce((total, account) => total + parseFloat(account.saldo_atual), 0);
              const quantidadePorTipo = contasPorTipo.length;
              
              // Só mostra o card se houver contas desse tipo
              if (quantidadePorTipo === 0) return null;

              const IconComponent = tipo.icon;
              const corPorTipo = getCorPorTipo(tipo.value);

              return (
                <div key={`resumo-tipo-${tipo.value}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${corPorTipo} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tipo.label}</p>
                      <p className="text-xs text-gray-500">
                        {quantidadePorTipo} {quantidadePorTipo === 1 ? 'carteira' : 'carteiras'}
                      </p>
                      <p className={`text-lg font-bold ${totalPorTipo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totalPorTipo)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção de Gerenciamento Completo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gerenciar Carteiras</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {accounts.map((account) => {
              const IconComponent = getIcon(account.icone);
              const corBanco = getCorBanco(account.codigo_banco);
              
              return (
                <div key={account.id} className="group relative">
                  {/* Card com gradiente baseado no banco */}
                  <div className={`bg-gradient-to-br ${corBanco} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-48 flex flex-col`}>
                    
                    {/* Header do card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {account.codigo_banco ? (
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <BancoLogo 
                              codigoBanco={account.codigo_banco} 
                              nomeBanco={account.banco}
                              className="w-8 h-8 rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        )}
                        
                        {/* Tipo e banco ao lado do ícone */}
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <span className="text-sm text-white text-opacity-90 font-medium capitalize truncate">
                            {account.tipo.replace('-', ' ')}
                          </span>
                          {account.banco && (
                            <span className="text-xs text-white text-opacity-70 truncate">
                              {account.banco.replace(' S.A.', '').replace(' BANCO MÚLTIPLO', '')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => handleEditar(account)}
                          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                        >
                          <PencilIcon className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleExcluir(account)}
                          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                        >
                          <TrashIcon className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Informações da conta - flex-1 para ocupar espaço restante */}
                    <div className="flex-1 flex flex-col justify-between">
                      <h3 className="text-lg font-semibold text-white truncate mb-4">
                        {account.nome}
                      </h3>
                      
                      {/* Saldo atual - sempre no final */}
                      <div className="pt-4 border-t border-white border-opacity-20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white text-opacity-80">Saldo Atual</span>
                          <span className="text-xl font-bold text-white">
                            {formatCurrency(parseFloat(account.saldo_atual))}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de conta */}
                    {account.eh_conta && (
                      <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Adicionar/Editar Carteira */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-4 border w-full max-w-md shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {carteiraEditando ? 'Editar Conta' : 'Nova conta'}
              </h3>
              <button
                onClick={() => resetModal()}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Etapa 1: Seleção do Tipo */}
              {etapaModal === 'tipo' && !carteiraEditando && (
                <div className="space-y-3">
                  <div className="text-center">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Escolha o tipo da conta</h4>
                    <p className="text-sm text-gray-500">Selecione uma das opções abaixo</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {tiposCarteira.map((tipo) => {
                      const IconComponent = tipo.icon;
                      return (
                        <button
                          key={tipo.value}
                          type="button"
                          onClick={() => {
                            setNovaCarteira(prev => ({ ...prev, tipo: tipo.value as any, banco: '', codigo_banco: '' }));
                            setEtapaModal('detalhes');
                          }}
                          className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-blue-500 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{tipo.label}</p>
                              <p className="text-sm text-gray-500">
                                {tipo.value === 'conta-bancaria' && 'Conta corrente, poupança, etc.'}
                                {tipo.value === 'conta-investimento' && 'Corretoras, fundos, ações'}
                                {tipo.value === 'criptomoeda' && 'Bitcoin, Ethereum, etc.'}
                                {tipo.value === 'cofre' && 'Dinheiro em casa, cofre físico'}
                                {tipo.value === 'cartao-prepago' && 'Vale refeição, transporte, etc.'}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Etapa 2: Detalhes da Carteira */}
              {(etapaModal === 'detalhes' || carteiraEditando) && (
                <div className="space-y-3">
                  {/* Tipo selecionado (só mostra, não edita quando não está editando) */}
                  {!carteiraEditando && (
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                            {tiposCarteira.find(t => t.value === novaCarteira.tipo)?.icon && 
                              React.createElement(tiposCarteira.find(t => t.value === novaCarteira.tipo)!.icon, { className: "h-4 w-4 text-white" })
                            }
                          </div>
                          <span className="font-medium text-blue-900 text-sm">
                            {tiposCarteira.find(t => t.value === novaCarteira.tipo)?.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEtapaModal('tipo')}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tipo da Carteira (quando editando) */}
                  {carteiraEditando && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={novaCarteira.tipo}
                        onChange={(e) => setNovaCarteira(prev => ({ 
                          ...prev, 
                          tipo: e.target.value as 'conta-bancaria' | 'conta-investimento' | 'criptomoeda' | 'cofre' | 'cartao-prepago',
                          banco: '' // Reset banco quando muda tipo
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {tiposCarteira.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Banco (apenas para conta bancária e investimento) */}
                  {precisaBanco && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selecione um banco
                      </label>
                      
                      {/* Campo de busca */}
                      <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={filtroBanco}
                          onChange={(e) => setFiltroBanco(e.target.value)}
                          placeholder="Selecione"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Lista de bancos filtrados */}
                      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white">
                        {bancosFiltrados.length > 0 ? (
                          bancosFiltrados.slice(0, 50).map((banco) => {
                            const isSelected = novaCarteira.codigo_banco === banco.codigo;
                            
                            return (
                              <button
                                key={banco.codigo}
                                type="button"
                                onClick={() => {
                                  setNovaCarteira(prev => ({ 
                                    ...prev, 
                                    codigo_banco: banco.codigo,
                                    banco: banco.nome
                                  }));
                                  setFiltroBanco('');
                                }}
                                className={`w-full px-3 py-2 flex items-center space-x-3 hover:bg-blue-50 border-b border-gray-100 text-left transition-colors ${
                                  isSelected ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm border">
                                  <BancoLogo 
                                    codigoBanco={banco.codigo} 
                                    nomeBanco={banco.nome}
                                    className="w-5 h-5"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm truncate">
                                    {banco.nome}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {banco.codigo}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Nenhum banco encontrado para "{filtroBanco}"
                          </div>
                        )}
                      </div>
                      
                      {/* Banco selecionado */}
                      {novaCarteira.codigo_banco && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-md flex items-center space-x-3 border border-blue-200">
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border">
                            <BancoLogo 
                              codigoBanco={novaCarteira.codigo_banco} 
                              nomeBanco={novaCarteira.banco}
                              className="w-4 h-4"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{novaCarteira.banco}</div>
                            <div className="text-xs text-gray-500">{novaCarteira.codigo_banco}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNovaCarteira(prev => ({ ...prev, codigo_banco: '', banco: '' }))}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nome da Carteira */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={novaCarteira.nome}
                      onChange={(e) => setNovaCarteira(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Conta Principal, Bitcoin Wallet..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Saldo Inicial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saldo inicial
                      {carteiraEditando && (
                        <span className="text-xs text-gray-500 ml-2">(não editável)</span>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={novaCarteira.saldo_inicial}
                        onChange={carteiraEditando ? undefined : (e) => setNovaCarteira(prev => ({ ...prev, saldo_inicial: parseFloat(e.target.value) || 0 }))}
                        placeholder="0,00"
                        disabled={carteiraEditando !== null}
                        className={`w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          carteiraEditando ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                        }`}
                        required={!carteiraEditando}
                      />
                    </div>
                    {carteiraEditando && (
                      <p className="text-xs text-gray-500 mt-1">
                        O saldo inicial não pode ser alterado após a criação da conta. 
                        Ele foi usado para gerar uma transação automática.
                      </p>
                    )}
                  </div>

                  {/* Toggle Switch "É uma conta" */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Carteira para guardar dinheiro
                      </label>
                      <p className="text-xs text-gray-500">
                        Marque se esta carteira é usada principalmente para guardar/economizar dinheiro
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNovaCarteira(prev => ({ ...prev, eh_conta: !prev.eh_conta }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        novaCarteira.eh_conta ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          novaCarteira.eh_conta ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Botões */}
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    {/* Botão Voltar (só aparece quando não está editando) */}
                    {!carteiraEditando && (
                      <button
                        type="button"
                        onClick={() => setEtapaModal('tipo')}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Voltar
                      </button>
                    )}
                    
                    <div className="flex space-x-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => resetModal()}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        FECHAR
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {carteiraEditando ? 'SALVANDO...' : 'CRIANDO...'}
                          </div>
                        ) : (
                          carteiraEditando ? 'SALVAR' : 'CRIAR'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default Accounts;
