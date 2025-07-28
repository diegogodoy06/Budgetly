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
  TrashIcon
} from '@heroicons/react/24/outline';

interface Carteira {
  id: number;
  nome: string;
  tipo: 'conta-bancaria' | 'conta-investimento' | 'criptomoeda' | 'cofre' | 'cartao-prepago';
  banco?: string;
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
      banco: 'Banco do Brasil',
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
      banco: 'Santander',
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
    saldoInicial: number;
    ehConta: boolean;
  }>({
    nome: '',
    tipo: 'conta-bancaria',
    banco: '',
    saldoInicial: 0,
    ehConta: false // Desmarcado por padrão
  });

  const [etapaModal, setEtapaModal] = useState<'tipo' | 'detalhes'>('tipo');

  // Lista de bancos brasileiros
  const bancosBrasileiros = [
    'Banco do Brasil', 'Santander', 'Itaú', 'Bradesco', 'Caixa Econômica Federal',
    'Nubank', 'Inter', 'BTG Pactual', 'Safra', 'Votorantim', 'C6 Bank',
    'Original', 'PagBank', 'XP Investimentos', 'Rico', 'Clear', 'Modalmais',
    'Stone', 'Neon', 'Next', 'Banco Pan', 'Banrisul', 'Sicoob', 'Sicredi'
  ];

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
      saldoInicial: 0,
      ehConta: false
    });
    setMostrarModal(false);
    setCarteiraEditando(null);
    setEtapaModal('tipo');
  };

  const handleEditar = (carteira: Carteira) => {
    setCarteiraEditando(carteira);
    setNovaCarteira({
      nome: carteira.nome,
      tipo: carteira.tipo,
      banco: carteira.banco || '',
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {carteiras.map((carteira) => {
              const IconComponent = getIcon(carteira.icone);
              return (
                <div key={carteira.id} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${carteira.cor} rounded-xl flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold text-gray-900 truncate">{carteira.nome}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {carteira.tipo.replace('-', ' ')}
                            {carteira.banco && ` • ${carteira.banco}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditar(carteira)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleExcluir(carteira.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Saldo Atual:</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(carteira.saldoAtual)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Saldo Inicial:</span>
                        <span className="text-sm text-gray-500">{formatCurrency(carteira.saldoInicial)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Variação:</span>
                        <span className={`text-sm font-medium ${
                          carteira.saldoAtual - carteira.saldoInicial >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {carteira.saldoAtual - carteira.saldoInicial >= 0 ? '+' : ''}
                          {formatCurrency(carteira.saldoAtual - carteira.saldoInicial)}
                        </span>
                      </div>
                      {carteira.ehConta && (
                        <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-green-600 font-medium">Conta para guardar dinheiro</span>
                        </div>
                      )}
                    </div>
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {carteiraEditando ? 'Editar Carteira' : 'Nova Carteira'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setCarteiraEditando(null);
                  setEtapaModal('tipo');
                  setNovaCarteira({ nome: '', tipo: 'conta-bancaria', banco: '', saldoInicial: 0, ehConta: false });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Etapa 1: Seleção do Tipo */}
              {etapaModal === 'tipo' && !carteiraEditando && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-md font-medium text-gray-900 mb-2">Escolha o tipo da carteira</h4>
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
                            setNovaCarteira(prev => ({ ...prev, tipo: tipo.value as any, banco: '' }));
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
                <div className="space-y-4">
                  {/* Tipo selecionado (só mostra, não edita quando não está editando) */}
                  {!carteiraEditando && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            {tiposCarteira.find(t => t.value === novaCarteira.tipo)?.icon && 
                              React.createElement(tiposCarteira.find(t => t.value === novaCarteira.tipo)!.icon, { className: "h-4 w-4 text-white" })
                            }
                          </div>
                          <span className="font-medium text-blue-900">
                            {tiposCarteira.find(t => t.value === novaCarteira.tipo)?.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEtapaModal('tipo')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Alterar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tipo da Carteira (quando editando) */}
                  {carteiraEditando && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo da Carteira
                      </label>
                      <select
                        value={novaCarteira.tipo}
                        onChange={(e) => setNovaCarteira(prev => ({ 
                          ...prev, 
                          tipo: e.target.value as 'conta-bancaria' | 'conta-investimento' | 'criptomoeda' | 'cofre' | 'cartao-prepago',
                          banco: '' // Reset banco quando muda tipo
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banco
                      </label>
                      <select
                        value={novaCarteira.banco}
                        onChange={(e) => setNovaCarteira(prev => ({ ...prev, banco: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione um banco</option>
                        {bancosBrasileiros.map((banco) => (
                          <option key={banco} value={banco}>
                            {banco}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Nome da Carteira */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Carteira
                    </label>
                    <input
                      type="text"
                      value={novaCarteira.nome}
                      onChange={(e) => setNovaCarteira(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Conta Principal, Bitcoin Wallet..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Saldo Inicial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saldo Inicial
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={novaCarteira.saldoInicial}
                        onChange={(e) => setNovaCarteira(prev => ({ ...prev, saldoInicial: parseFloat(e.target.value) || 0 }))}
                        placeholder="0,00"
                        className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div className="flex justify-between pt-4">
                    {/* Botão Voltar (só aparece quando não está editando) */}
                    {!carteiraEditando && (
                      <button
                        type="button"
                        onClick={() => setEtapaModal('tipo')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Voltar
                      </button>
                    )}
                    
                    <div className="flex space-x-3 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarModal(false);
                          setCarteiraEditando(null);
                          setEtapaModal('tipo');
                          setNovaCarteira({ nome: '', tipo: 'conta-bancaria', banco: '', saldoInicial: 0, ehConta: false });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {carteiraEditando ? 'Salvar Alterações' : 'Criar Carteira'}
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
