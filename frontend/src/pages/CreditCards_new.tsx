import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  CreditCardIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface CartaoCredito {
  id: number;
  nome: string;
  bandeira: string;
  ultimos4Digitos: string;
  diaVencimento: number;
  diaFechamento: number;
  limite: number;
  saldoAtual: number;
  cor: string;
}

interface Transacao {
  id: number;
  cartaoId: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  parcelas?: number;
  parcelaAtual?: number;
  centroCusto?: string;
}

interface Categoria {
  id: number;
  nome: string;
  ativa: boolean;
  considerarDashboard: boolean;
  importancia: 'essencial' | 'necessario' | 'superfluo';
}

interface CentroCusto {
  id: number;
  nome: string;
  ativo: boolean;
}

const CreditCards: React.FC = () => {
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([
    {
      id: 1,
      nome: 'Diego Alexandre Souza Godoy',
      bandeira: 'Mastercard',
      ultimos4Digitos: '1234',
      diaVencimento: 14,
      diaFechamento: 25,
      limite: 5000,
      saldoAtual: 1250.50,
      cor: 'bg-purple-600'
    },
    {
      id: 2,
      nome: 'Santander SX',
      bandeira: 'Visa',
      ultimos4Digitos: '5678',
      diaVencimento: 20,
      diaFechamento: 15,
      limite: 3000,
      saldoAtual: 890.30,
      cor: 'bg-red-600'
    },
    {
      id: 3,
      nome: 'Itaú Click',
      bandeira: 'Elo',
      ultimos4Digitos: '9012',
      diaVencimento: 5,
      diaFechamento: 28,
      limite: 8000,
      saldoAtual: 2100.75,
      cor: 'bg-orange-600'
    }
  ]);

  const [transacoes, setTransacoes] = useState<Transacao[]>([
    { id: 1, cartaoId: 1, descricao: 'Supermercado Extra', valor: 280.50, data: '2025-07-25', categoria: 'Alimentação', centroCusto: 'Pessoal' },
    { id: 2, cartaoId: 1, descricao: 'Netflix', valor: 32.90, data: '2025-07-20', categoria: 'Entretenimento', centroCusto: 'Pessoal' },
    { id: 3, cartaoId: 1, descricao: 'Posto Ipiranga', valor: 120.00, data: '2025-07-18', categoria: 'Combustível' },
    { id: 4, cartaoId: 2, descricao: 'Amazon', valor: 150.75, data: '2025-07-22', categoria: 'Compras Online', parcelas: 3, parcelaAtual: 1 },
    { id: 5, cartaoId: 2, descricao: 'Restaurante', valor: 89.40, data: '2025-07-21', categoria: 'Alimentação', centroCusto: 'Trabalho' },
    { id: 6, cartaoId: 3, descricao: 'Farmácia', valor: 45.20, data: '2025-07-24', categoria: 'Saúde' },
    { id: 7, cartaoId: 1, descricao: 'Uber', valor: 25.00, data: '2025-06-15', categoria: 'Transporte', centroCusto: 'Trabalho' },
    { id: 8, cartaoId: 1, descricao: 'Cinema', valor: 60.00, data: '2025-06-10', categoria: 'Entretenimento', centroCusto: 'Pessoal' },
    { id: 9, cartaoId: 2, descricao: 'Conta de Luz', valor: 180.00, data: '2025-06-05', categoria: 'Moradia', parcelas: 12, parcelaAtual: 6 },
    { id: 10, cartaoId: 1, descricao: 'jantar', valor: 80.00, data: '2025-09-27', categoria: 'food' },
    { id: 11, cartaoId: 1, descricao: 'almoço', valor: 50.00, data: '2025-09-26', categoria: 'food' },
    { id: 12, cartaoId: 1, descricao: 'ewklfbuiwef', valor: 800.00, data: '2025-09-27', categoria: 'food' },
  ]);

  const [cartaoSelecionado, setCartaoSelecionado] = useState<number | null>(1);
  const [mesSelecionado, setMesSelecionado] = useState(() => {
    // Começar com o mês atual
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    return `${ano}-${mes.toString().padStart(2, '0')}`;
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalTransacao, setMostrarModalTransacao] = useState(false);
  const [menuAcoesAberto, setMenuAcoesAberto] = useState<number | null>(null);
  const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null);
  const [cartaoEditando, setCartaoEditando] = useState<CartaoCredito | null>(null);

  // Dados mock para categorias e centros de custo (para uso nos formulários)
  const categorias: Categoria[] = [
    { id: 1, nome: 'Alimentação', ativa: true, considerarDashboard: true, importancia: 'essencial' },
    { id: 2, nome: 'Transporte', ativa: true, considerarDashboard: true, importancia: 'necessario' },
    { id: 3, nome: 'Moradia', ativa: true, considerarDashboard: true, importancia: 'essencial' },
    { id: 4, nome: 'Saúde', ativa: true, considerarDashboard: true, importancia: 'essencial' },
    { id: 5, nome: 'Entretenimento', ativa: true, considerarDashboard: false, importancia: 'superfluo' },
    { id: 6, nome: 'Compras Online', ativa: true, considerarDashboard: true, importancia: 'necessario' },
    { id: 7, nome: 'Combustível', ativa: true, considerarDashboard: true, importancia: 'necessario' },
    { id: 8, nome: 'Outros', ativa: true, considerarDashboard: false, importancia: 'superfluo' }
  ];

  const centrosCusto: CentroCusto[] = [
    { id: 1, nome: 'Pessoal', ativo: true },
    { id: 2, nome: 'Trabalho', ativo: true },
    { id: 3, nome: 'Família', ativo: true },
    { id: 4, nome: 'Geral', ativo: true }
  ];

  const [novoCartao, setNovoCartao] = useState({
    nome: '',
    bandeira: '',
    ultimos4Digitos: '',
    diaVencimento: 1,
    diaFechamento: 1,
    limite: 0
  });

  const [novaTransacao, setNovaTransacao] = useState({
    carteiraId: 0,
    tipoCarteira: 'cartao-credito' as 'cartao-credito' | 'conta',
    descricao: '',
    valor: 0,
    dataCompra: new Date().toISOString().split('T')[0],
    dataVencimento: '',
    categoria: '',
    recorrente: false,
    tipoRecorrencia: 'mensal' as 'mensal' | 'trimestral' | 'semanal' | 'anual',
    centroCusto: ''
  });

  // Principais bandeiras de cartão (expandidas)
  const bandeiras = [
    { value: 'Visa', label: 'Visa', cor: 'bg-blue-600', logo: '💳' },
    { value: 'Mastercard', label: 'Mastercard', cor: 'bg-red-600', logo: '🔴' },
    { value: 'Elo', label: 'Elo', cor: 'bg-yellow-600', logo: '🟡' },
    { value: 'American Express', label: 'American Express', cor: 'bg-green-600', logo: '💚' },
    { value: 'Hipercard', label: 'Hipercard', cor: 'bg-orange-600', logo: '🟠' },
    { value: 'Diners Club', label: 'Diners Club', cor: 'bg-gray-600', logo: '⚪' },
    { value: 'Discover', label: 'Discover', cor: 'bg-purple-600', logo: '🟣' },
    { value: 'JCB', label: 'JCB', cor: 'bg-indigo-600', logo: '🔵' },
    { value: 'UnionPay', label: 'UnionPay', cor: 'bg-pink-600', logo: '🌸' },
    { value: 'Cabal', label: 'Cabal', cor: 'bg-teal-600', logo: '🟢' },
    { value: 'Aura', label: 'Aura', cor: 'bg-cyan-600', logo: '💎' },
    { value: 'Banricompras', label: 'Banricompras', cor: 'bg-lime-600', logo: '🏪' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCardNumber = (ultimos4: string) => {
    return `**** **** **** ${ultimos4}`;
  };

  const getBandeiraCor = (bandeira: string) => {
    const bandeiraInfo = bandeiras.find(b => b.value === bandeira);
    return bandeiraInfo?.cor || 'bg-gray-600';
  };

  const getBandeiraLogo = (bandeira: string) => {
    const bandeiraInfo = bandeiras.find(b => b.value === bandeira);
    return bandeiraInfo?.logo || '💳';
  };

  const getTransacoesDoMes = (cartaoId: number, anoMes: string) => {
    return transacoes.filter(t => {
      if (t.cartaoId !== cartaoId) return false;
      const dataTransacao = new Date(t.data);
      const anoMesTransacao = `${dataTransacao.getFullYear()}-${String(dataTransacao.getMonth() + 1).padStart(2, '0')}`;
      return anoMesTransacao === anoMes;
    });
  };

  const getValorFatura = (cartaoId: number, anoMes: string) => {
    const transacoesDoMes = getTransacoesDoMes(cartaoId, anoMes);
    return transacoesDoMes.reduce((total, t) => total + t.valor, 0);
  };

  const isFaturaFechada = (cartaoId: number, anoMes: string) => {
    const cartao = cartoes.find(c => c.id === cartaoId);
    if (!cartao) return false;
    
    const [ano, mes] = anoMes.split('-').map(Number);
    const dataFechamento = new Date(ano, mes - 1, cartao.diaFechamento);
    const hoje = new Date();
    
    // Considerar fechada se a data de fechamento já passou
    // Para demonstração, vamos considerar que meses passados estão fechados
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    const mesComparacao = `${anoAtual}-${mesAtual.toString().padStart(2, '0')}`;
    
    return anoMes < mesComparacao;
  };

  const formatarMesAno = (anoMes: string) => {
    const [ano, mes] = anoMes.split('-').map(Number);
    const nomesMeses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return `${nomesMeses[mes - 1]}/${ano}`;
  };

  const getMesesDisponiveis = () => {
    const meses = [];
    const hoje = new Date();
    const mesAtual = hoje.getMonth(); // 0-11
    const anoAtual = hoje.getFullYear();
    
    // Gerar 6 meses: 2 passados + atual + 3 futuros
    for (let i = -2; i <= 3; i++) {
      const data = new Date(anoAtual, mesAtual + i, 1);
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;
      meses.push(`${ano}-${mes.toString().padStart(2, '0')}`);
    }
    
    return meses;
  };

  const criarTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaTransacao.carteiraId === 0) {
      alert('Por favor, selecione uma carteira/cartão.');
      return;
    }

    if (transacaoEditando) {
      // Editar transação existente
      setTransacoes(prev => prev.map(t => 
        t.id === transacaoEditando.id
          ? {
              ...t,
              descricao: novaTransacao.descricao,
              valor: novaTransacao.valor,
              data: novaTransacao.dataCompra,
              categoria: novaTransacao.categoria,
              centroCusto: novaTransacao.centroCusto || undefined
            }
          : t
      ));
    } else {
      // Criar nova transação
      const novaTransacaoCompleta: Transacao = {
        id: Date.now(),
        cartaoId: novaTransacao.carteiraId,
        descricao: novaTransacao.descricao,
        valor: novaTransacao.valor,
        data: novaTransacao.dataCompra,
        categoria: novaTransacao.categoria,
        centroCusto: novaTransacao.centroCusto || undefined
      };

      // Adicionar transação ao estado global
      setTransacoes(prev => [...prev, novaTransacaoCompleta]);
    }

    // Resetar formulário e fechar modal
    setMostrarModalTransacao(false);
    setTransacaoEditando(null);
    setNovaTransacao({
      carteiraId: 0,
      tipoCarteira: 'cartao-credito',
      descricao: '',
      valor: 0,
      dataCompra: new Date().toISOString().split('T')[0],
      dataVencimento: '',
      categoria: '',
      recorrente: false,
      tipoRecorrencia: 'mensal',
      centroCusto: ''
    });

    alert(transacaoEditando ? 'Transação editada com sucesso!' : 'Transação criada com sucesso!');
  };

  const handleEditarTransacao = (transacao: Transacao) => {
    setTransacaoEditando(transacao);
    setNovaTransacao({
      carteiraId: transacao.cartaoId,
      tipoCarteira: 'cartao-credito',
      descricao: transacao.descricao,
      valor: transacao.valor,
      dataCompra: transacao.data,
      dataVencimento: '',
      categoria: transacao.categoria,
      recorrente: false,
      tipoRecorrencia: 'mensal',
      centroCusto: transacao.centroCusto || ''
    });
    setMostrarModalTransacao(true);
    setMenuAcoesAberto(null);
  };

  const handleExcluirTransacao = (transacaoId: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransacoes(prev => prev.filter(t => t.id !== transacaoId));
      setMenuAcoesAberto(null);
    }
  };

  const handleAcoesTransacao = (transacaoId: number) => {
    setMenuAcoesAberto(menuAcoesAberto === transacaoId ? null : transacaoId);
  };

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuAcoesAberto(null);
    };

    if (menuAcoesAberto) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuAcoesAberto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartaoEditando) {
      // Editar cartão existente
      setCartoes(prev => prev.map(cartao => 
        cartao.id === cartaoEditando.id 
          ? {
              ...cartao,
              nome: novoCartao.nome,
              bandeira: novoCartao.bandeira,
              ultimos4Digitos: novoCartao.ultimos4Digitos,
              diaVencimento: novoCartao.diaVencimento,
              diaFechamento: novoCartao.diaFechamento,
              limite: novoCartao.limite,
              cor: getBandeiraCor(novoCartao.bandeira)
            }
          : cartao
      ));
    } else {
      // Adicionar novo cartão
      const novo: CartaoCredito = {
        id: Date.now(),
        nome: novoCartao.nome,
        bandeira: novoCartao.bandeira,
        ultimos4Digitos: novoCartao.ultimos4Digitos,
        diaVencimento: novoCartao.diaVencimento,
        diaFechamento: novoCartao.diaFechamento,
        limite: novoCartao.limite,
        saldoAtual: 0,
        cor: getBandeiraCor(novoCartao.bandeira)
      };
      setCartoes(prev => [...prev, novo]);
    }

    // Reset form
    setNovoCartao({
      nome: '',
      bandeira: '',
      ultimos4Digitos: '',
      diaVencimento: 1,
      diaFechamento: 1,
      limite: 0
    });
    setMostrarModal(false);
    setCartaoEditando(null);
  };

  const handleEditar = (cartao: CartaoCredito) => {
    setCartaoEditando(cartao);
    setNovoCartao({
      nome: cartao.nome,
      bandeira: cartao.bandeira,
      ultimos4Digitos: cartao.ultimos4Digitos,
      diaVencimento: cartao.diaVencimento,
      diaFechamento: cartao.diaFechamento,
      limite: cartao.limite
    });
    setMostrarModal(true);
  };

  const handleExcluir = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      setCartoes(prev => prev.filter(cartao => cartao.id !== id));
      if (cartaoSelecionado === id) {
        setCartaoSelecionado(cartoes.length > 1 ? cartoes[0].id : null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Cartões de Crédito
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus cartões de crédito e transações
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Cartão
          </button>
        </div>
      </div>

      {/* Cards dos Cartões */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((cartao) => (
          <div 
            key={cartao.id} 
            onClick={() => setCartaoSelecionado(cartao.id)}
            className={`relative cursor-pointer transform transition-all duration-200 hover:scale-102 ${
              cartaoSelecionado === cartao.id ? 'scale-105' : ''
            }`}
          >
            {/* Card visual do cartão - altura reduzida */}
            <div className={`relative rounded-xl p-4 text-white shadow-lg min-h-[140px] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
              cartaoSelecionado === cartao.id 
                ? `${cartao.cor} shadow-xl` 
                : 'bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700'
            }`}>
              {/* Background pattern - só aparece no cartão selecionado */}
              {cartaoSelecionado === cartao.id && (
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-2 w-12 h-12 rounded-full border-2 border-white"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-white"></div>
                </div>
              )}
              
              {/* Conteúdo do cartão */}
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs opacity-90">Cartão de Crédito</p>
                    <p className="text-base font-bold truncate">{cartao.nome}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Logo da bandeira */}
                    <div className="text-lg">{getBandeiraLogo(cartao.bandeira)}</div>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditar(cartao);
                        }}
                        className="p-1 text-white hover:text-gray-200 transition-colors opacity-75 hover:opacity-100"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluir(cartao.id);
                        }}
                        className="p-1 text-white hover:text-gray-200 transition-colors opacity-75 hover:opacity-100"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-lg font-mono tracking-wider">
                    {formatCardNumber(cartao.ultimos4Digitos)}
                  </p>
                </div>
              </div>
              
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-75">Bandeira</p>
                  <p className="text-xs font-semibold">{cartao.bandeira}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Usado</p>
                  <p className="text-sm font-bold">{formatCurrency(cartao.saldoAtual)}</p>
                </div>
              </div>
              
              {/* Indicador de seleção - agora mais discreto */}
              {cartaoSelecionado === cartao.id && (
                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full shadow-md"></div>
              )}
            </div>
            
            {/* Informações extras abaixo do card */}
            <div className="mt-2 px-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Venc: {cartao.diaVencimento}</span>
                <span>Fech: {cartao.diaFechamento}</span>
                <span>Limite: {formatCurrency(cartao.limite)}</span>
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      cartaoSelecionado === cartao.id 
                        ? 'bg-gradient-to-r from-green-400 to-red-500' 
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${(cartao.saldoAtual / cartao.limite) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 text-center">
                  {((cartao.saldoAtual / cartao.limite) * 100).toFixed(1)}% usado
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detalhes e Transações do Cartão Selecionado */}
      {cartaoSelecionado && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header com informações do cartão */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {cartoes.find(c => c.id === cartaoSelecionado)?.nome}
                </h3>
                <div className="flex items-center space-x-6 text-sm text-gray-500 mt-1">
                  <span>Fechamento: dia {cartoes.find(c => c.id === cartaoSelecionado)?.diaFechamento}</span>
                  <span>Vencimento: dia {cartoes.find(c => c.id === cartaoSelecionado)?.diaVencimento}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalTransacao(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Transação
              </button>
            </div>
          </div>

          {/* Seletor de Mês e Info da Fatura */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 relative">
            <div className="flex gap-8 justify-start" id="meses-container">
              {getMesesDisponiveis().map((mes) => (
                <div key={mes} className="flex flex-col cursor-pointer min-w-0" onClick={() => setMesSelecionado(mes)}>
                  <div className={`text-sm font-medium mb-1 ${
                    mesSelecionado === mes
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}>
                    {formatarMesAno(mes)}
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-gray-800 font-extralight text-xs">
                      {formatCurrency(getValorFatura(cartaoSelecionado, mes))}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full font-extralight text-xs ${
                      isFaturaFechada(cartaoSelecionado, mes)
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isFaturaFechada(cartaoSelecionado, mes) ? 'Fechada' : 'Aberto'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Barra completa embaixo com indicador do mês selecionado */}
            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gray-200">
              <div 
                className="h-0.5 bg-gray-900 transition-all duration-300 ease-in-out"
                style={{
                  width: `calc((100% - ${(getMesesDisponiveis().length - 1) * 2}rem) / ${getMesesDisponiveis().length})`,
                  transform: `translateX(${getMesesDisponiveis().findIndex(mes => mes === mesSelecionado) * (100 / getMesesDisponiveis().length)}%) translateX(${getMesesDisponiveis().findIndex(mes => mes === mesSelecionado) * 2}rem)`
                }}
              ></div>
            </div>
          </div>
          
          {/* Tabela de Transações */}
          <div className="overflow-hidden">
            {getTransacoesDoMes(cartaoSelecionado, mesSelecionado).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Centro de Custo
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Parcela
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTransacoesDoMes(cartaoSelecionado, mesSelecionado).map((transacao) => (
                      <tr key={transacao.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                          {new Date(transacao.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700">
                          <div>
                            <p className="font-normal">{transacao.descricao}</p>
                            <p className="text-xs text-blue-600 bg-blue-100 rounded-full px-2 py-1 inline-block mt-1">
                              {transacao.categoria}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {transacao.centroCusto || 'Geral'}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                          {transacao.parcelas ? `${transacao.parcelaAtual || 1}/${transacao.parcelas}` : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-normal text-right">
                          <div className="flex items-center justify-end">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-2 flex items-center">
                              ● R$ {transacao.valor.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center text-xs font-normal relative">
                          <button 
                            onClick={() => handleAcoesTransacao(transacao.id)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {/* Menu de ações */}
                          {menuAcoesAberto === transacao.id && (
                            <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                              <div className="py-1" role="menu">
                                <button
                                  onClick={() => handleEditarTransacao(transacao)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  <PencilIcon className="h-4 w-4 mr-2 inline" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleExcluirTransacao(transacao.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  role="menuitem"
                                >
                                  <TrashIcon className="h-4 w-4 mr-2 inline" />
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma transação</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isFaturaFechada(cartaoSelecionado, mesSelecionado) 
                    ? `Não houve movimentação em ${formatarMesAno(mesSelecionado)}.`
                    : `Não há transações registradas para ${formatarMesAno(mesSelecionado)}.`
                  }
                </p>
                {!isFaturaFechada(cartaoSelecionado, mesSelecionado) && (
                  <button
                    onClick={() => setMostrarModalTransacao(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Adicionar Primeira Transação
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Nova Transação */}
      {mostrarModalTransacao && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {transacaoEditando ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModalTransacao(false);
                  setTransacaoEditando(null);
                  setNovaTransacao({
                    carteiraId: 0,
                    tipoCarteira: 'cartao-credito',
                    descricao: '',
                    valor: 0,
                    dataCompra: new Date().toISOString().split('T')[0],
                    dataVencimento: '',
                    categoria: '',
                    recorrente: false,
                    tipoRecorrencia: 'mensal',
                    centroCusto: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={criarTransacao} className="space-y-4">
              {/* Tipo de Carteira */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conta
                </label>
                <select
                  value={novaTransacao.tipoCarteira}
                  onChange={(e) => setNovaTransacao(prev => ({ 
                    ...prev, 
                    tipoCarteira: e.target.value as 'cartao-credito' | 'conta',
                    carteiraId: 0 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cartao-credito">Cartão de Crédito</option>
                  <option value="conta">Carteira/Conta</option>
                </select>
              </div>

              {/* Seleção da Carteira */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {novaTransacao.tipoCarteira === 'cartao-credito' ? 'Cartão' : 'Carteira'}
                </label>
                <select
                  value={novaTransacao.carteiraId}
                  onChange={(e) => setNovaTransacao(prev => ({ ...prev, carteiraId: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Selecione...</option>
                  {novaTransacao.tipoCarteira === 'cartao-credito' 
                    ? cartoes.map(cartao => (
                        <option key={cartao.id} value={cartao.id}>
                          {cartao.nome} ({cartao.bandeira} ****{cartao.ultimos4Digitos})
                        </option>
                      ))
                    : [
                        { id: 101, nome: 'Conta BB', tipo: 'Conta Bancária' },
                        { id: 102, nome: 'Poupança Santander', tipo: 'Conta Bancária' },
                        { id: 103, nome: 'Bitcoin Wallet', tipo: 'Criptomoeda' },
                        { id: 104, nome: 'Cofre Casa', tipo: 'Cofre' }
                      ].map(conta => (
                        <option key={conta.id} value={conta.id}>
                          {conta.nome} ({conta.tipo})
                        </option>
                      ))
                  }
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Ex: Supermercado, Combustível, Netflix..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={novaTransacao.valor}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Data da Compra e Data de Vencimento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    value={novaTransacao.dataCompra}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, dataCompra: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Vencimento
                  </label>
                  <input
                    type="date"
                    value={novaTransacao.dataVencimento}
                    readOnly
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600"
                    placeholder="Será calculada automaticamente"
                  />
                  <p className="text-xs text-gray-500 mt-1">Calculada pelo dia de vencimento do cartão</p>
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={novaTransacao.categoria}
                  onChange={(e) => setNovaTransacao(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.filter(cat => cat.ativa).map(categoria => (
                    <option key={categoria.id} value={categoria.nome}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Centro de Custo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Centro de Custo (Opcional)
                </label>
                <select
                  value={novaTransacao.centroCusto}
                  onChange={(e) => setNovaTransacao(prev => ({ ...prev, centroCusto: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um centro de custo</option>
                  {centrosCusto.filter(centro => centro.ativo).map(centro => (
                    <option key={centro.id} value={centro.nome}>
                      {centro.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transação Recorrente */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Transação Recorrente
                    </label>
                    <p className="text-xs text-gray-500">
                      Esta transação se repete automaticamente
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNovaTransacao(prev => ({ ...prev, recorrente: !prev.recorrente }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      novaTransacao.recorrente ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        novaTransacao.recorrente ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Tipo de Recorrência */}
                {novaTransacao.recorrente && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência
                    </label>
                    <select
                      value={novaTransacao.tipoRecorrencia}
                      onChange={(e) => setNovaTransacao(prev => ({ ...prev, tipoRecorrencia: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalTransacao(false);
                    setTransacaoEditando(null);
                    setNovaTransacao({
                      carteiraId: 0,
                      tipoCarteira: 'cartao-credito',
                      descricao: '',
                      valor: 0,
                      dataCompra: new Date().toISOString().split('T')[0],
                      dataVencimento: '',
                      categoria: '',
                      recorrente: false,
                      tipoRecorrencia: 'mensal',
                      centroCusto: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {transacaoEditando ? 'Salvar Alterações' : 'Criar Transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Cartão */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {cartaoEditando ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
              </h3>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setCartaoEditando(null);
                  setNovoCartao({ nome: '', bandeira: '', ultimos4Digitos: '', diaVencimento: 1, diaFechamento: 1, limite: 0 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome do Cartão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cartão
                </label>
                <input
                  type="text"
                  value={novoCartao.nome}
                  onChange={(e) => setNovoCartao(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Nubank Roxinho, Santander SX..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bandeira */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bandeira
                </label>
                <select
                  value={novoCartao.bandeira}
                  onChange={(e) => setNovoCartao(prev => ({ ...prev, bandeira: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma bandeira</option>
                  {bandeiras.map((bandeira) => (
                    <option key={bandeira.value} value={bandeira.value}>
                      {bandeira.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Últimos 4 Dígitos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Últimos 4 Dígitos
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={novoCartao.ultimos4Digitos}
                  onChange={(e) => setNovoCartao(prev => ({ ...prev, ultimos4Digitos: e.target.value.replace(/\D/g, '') }))}
                  placeholder="1234"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Dias de Vencimento e Fechamento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia Vencimento
                  </label>
                  <select
                    value={novoCartao.diaVencimento}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, diaVencimento: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                      <option key={dia} value={dia}>Dia {dia}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia Fechamento
                  </label>
                  <select
                    value={novoCartao.diaFechamento}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, diaFechamento: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                      <option key={dia} value={dia}>Dia {dia}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Limite */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limite do Cartão
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={novoCartao.limite}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, limite: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModal(false);
                    setCartaoEditando(null);
                    setNovoCartao({ nome: '', bandeira: '', ultimos4Digitos: '', diaVencimento: 1, diaFechamento: 1, limite: 0 });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {cartaoEditando ? 'Salvar Alterações' : 'Criar Cartão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;
