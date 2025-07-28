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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { bancosBrasileiros } from '../data/bancos';
import { BancoLogo } from '../utils/assets';

interface Carteira {
  id: number;
  nome: string;
  tipo: 'conta-bancaria' | 'conta-investimento' | 'criptomoeda' | 'cofre' | 'cartao-prepago';
  banco?: string;
  codigoBanco?: string; // Código de 3 dígitos do banco
  saldoInicial: number;
  saldoAtual: number;
  ehConta: boolean;
  cor: string;
  icone: string;
}

const Accounts: React.FC = () => {
  const [carteiras, setCarteiras] = useState<Carteira[]>([
    {
      id: 1,
      nome: 'Conta Principal BB',
      tipo: 'conta-bancaria',
      banco: 'Banco do Brasil S.A.',
      codigoBanco: '001',
      saldoInicial: 5000,
      saldoAtual: 7500,
      ehConta: true,
      cor: 'bg-yellow-500',
      icone: 'bank'
    },
    {
      id: 2,
      nome: 'Poupança Santander',
      tipo: 'conta-bancaria',
      banco: 'Banco Santander (Brasil) S.A.',
      codigoBanco: '033',
      saldoInicial: 10000,
      saldoAtual: 12300,
      ehConta: true,
      cor: 'bg-red-500',
      icone: 'bank'
    },
    {
      id: 3,
      nome: 'Bitcoin Wallet',
      tipo: 'criptomoeda',
      saldoInicial: 2000,
      saldoAtual: 3500,
      ehConta: false,
      cor: 'bg-orange-500',
      icone: 'crypto'
    },
    {
      id: 4,
      nome: 'Cofre Casa',
      tipo: 'cofre',
      saldoInicial: 500,
      saldoAtual: 750,
      ehConta: false,
      cor: 'bg-gray-700',
      icone: 'safe'
    }
  ]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [carteiraEditando, setCarteiraEditando] = useState<Carteira | null>(null);
  const [novaCarteira, setNovaCarteira] = useState<{
    nome: string;
    tipo: 'conta-bancaria' | 'conta-investimento' | 'criptomoeda' | 'cofre' | 'cartao-prepago';
    banco: string;
    codigoBanco: string;
    saldoInicial: number;
    ehConta: boolean;
  }>({
    nome: '',
    tipo: 'conta-bancaria',
    banco: '',
    codigoBanco: '',
    saldoInicial: 0,
    ehConta: false // Desmarcado por padrão
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (carteiraEditando) {
      // Editar carteira existente
      setCarteiras(prev => prev.map(carteira => 
        carteira.id === carteiraEditando.id 
          ? {
              ...carteira,
              nome: novaCarteira.nome,
              tipo: novaCarteira.tipo,
              banco: novaCarteira.banco,
              codigoBanco: novaCarteira.codigoBanco,
              saldoInicial: novaCarteira.saldoInicial,
              ehConta: novaCarteira.ehConta,
              cor: getCorPorTipo(novaCarteira.tipo)
            }
          : carteira
      ));
    } else {
      // Adicionar nova carteira
      const nova: Carteira = {
        id: Date.now(),
        nome: novaCarteira.nome,
        tipo: novaCarteira.tipo,
        banco: novaCarteira.banco,
        codigoBanco: novaCarteira.codigoBanco,
        saldoInicial: novaCarteira.saldoInicial,
        saldoAtual: novaCarteira.saldoInicial,
        ehConta: novaCarteira.ehConta,
        cor: getCorPorTipo(novaCarteira.tipo),
        icone: novaCarteira.tipo === 'conta-bancaria' || novaCarteira.tipo === 'conta-investimento' ? 'bank' : 
               novaCarteira.tipo === 'criptomoeda' ? 'crypto' : 'safe'
      };
      setCarteiras(prev => [...prev, nova]);
    }

    // Reset form
    setNovaCarteira({
      nome: '',
      tipo: 'conta-bancaria',
      banco: '',
      codigoBanco: '',
      saldoInicial: 0,
      ehConta: false
    });
    resetModal();
  };

  const handleEditar = (carteira: Carteira) => {
    setCarteiraEditando(carteira);
    setNovaCarteira({
      nome: carteira.nome,
      tipo: carteira.tipo,
      banco: carteira.banco || '',
      codigoBanco: carteira.codigoBanco || '',
      saldoInicial: carteira.saldoInicial,
      ehConta: carteira.ehConta
    });
    setEtapaModal('detalhes'); // Pula direto para detalhes quando editando
    setMostrarModal(true);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta carteira?')) {
      setCarteiras(prev => prev.filter(carteira => carteira.id !== id));
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
      codigoBanco: '', 
      saldoInicial: 0, 
      ehConta: false 
    });
  };

  const precisaBanco = novaCarteira.tipo === 'conta-bancaria' || novaCarteira.tipo === 'conta-investimento';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Carteiras
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas carteiras, contas bancárias, investimentos e mais
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Carteira
          </button>
        </div>
      </div>

      {/* Lista de Carteiras */}
      <div className="space-y-8">
        {/* Card de Resumo Total */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Todas as Contas</h3>
              <p className="text-sm opacity-90">Saldo total de todas as carteiras</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {formatCurrency(carteiras.reduce((total, carteira) => total + carteira.saldoAtual, 0))}
              </p>
              <p className="text-sm opacity-90">
                {carteiras.length} {carteiras.length === 1 ? 'carteira' : 'carteiras'}
              </p>
            </div>
          </div>
        </div>

        {/* Seção de Resumo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Tipo de Conta</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {tiposCarteira.map((tipo) => {
              // Filtrar carteiras por tipo e somar valores
              const carteirasPorTipo = carteiras.filter(carteira => carteira.tipo === tipo.value);
              const totalPorTipo = carteirasPorTipo.reduce((total, carteira) => total + carteira.saldoAtual, 0);
              const quantidadePorTipo = carteirasPorTipo.length;
              
              // Só mostra o card se houver carteiras desse tipo
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
            {carteiras.map((carteira) => {
              const IconComponent = getIcon(carteira.icone);
              const corBanco = getCorBanco(carteira.codigoBanco);
              
              return (
                <div key={carteira.id} className="group relative">
                  {/* Card com gradiente baseado no banco */}
                  <div className={`bg-gradient-to-br ${corBanco} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                    
                    {/* Header do card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {carteira.codigoBanco ? (
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <BancoLogo 
                              codigoBanco={carteira.codigoBanco} 
                              nomeBanco={carteira.banco}
                              className="w-8 h-8 rounded-full"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditar(carteira)}
                          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                        >
                          <PencilIcon className="h-4 w-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleExcluir(carteira.id)}
                          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
                        >
                          <TrashIcon className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Informações da conta */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {carteira.nome}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-white text-opacity-80">
                        <span className="text-sm capitalize">
                          {carteira.tipo.replace('-', ' ')}
                        </span>
                        {carteira.banco && (
                          <>
                            <span className="text-xs">•</span>
                            <span className="text-sm truncate">
                              {carteira.banco.replace(' S.A.', '').replace(' BANCO MÚLTIPLO', '')}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Saldo atual */}
                      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white text-opacity-80">Saldo Atual</span>
                          <span className="text-xl font-bold text-white">
                            {formatCurrency(carteira.saldoAtual)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de conta */}
                    {carteira.ehConta && (
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
                            setNovaCarteira(prev => ({ ...prev, tipo: tipo.value as any, banco: '', codigoBanco: '' }));
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
                            const isSelected = novaCarteira.codigoBanco === banco.codigo;
                            
                            return (
                              <button
                                key={banco.codigo}
                                type="button"
                                onClick={() => {
                                  setNovaCarteira(prev => ({ 
                                    ...prev, 
                                    codigoBanco: banco.codigo,
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
                      {novaCarteira.codigoBanco && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-md flex items-center space-x-3 border border-blue-200">
                          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border">
                            <BancoLogo 
                              codigoBanco={novaCarteira.codigoBanco} 
                              nomeBanco={novaCarteira.banco}
                              className="w-4 h-4"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{novaCarteira.banco}</div>
                            <div className="text-xs text-gray-500">{novaCarteira.codigoBanco}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNovaCarteira(prev => ({ ...prev, codigoBanco: '', banco: '' }))}
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
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={novaCarteira.saldoInicial}
                        onChange={(e) => setNovaCarteira(prev => ({ ...prev, saldoInicial: parseFloat(e.target.value) || 0 }))}
                        placeholder="0,00"
                        className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
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
                      onClick={() => setNovaCarteira(prev => ({ ...prev, ehConta: !prev.ehConta }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        novaCarteira.ehConta ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          novaCarteira.ehConta ? 'translate-x-6' : 'translate-x-1'
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
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {carteiraEditando ? 'SALVAR' : 'CRIAR'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
