import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  CreditCardIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { creditCardsAPI, transactionsAPI } from '@/services/api';
import type { CreditCard, CreditCardFormData, CreditCardBrand, Transaction } from '@/types';
import toast from 'react-hot-toast';

const CREDIT_CARD_BRANDS: { value: CreditCardBrand; label: string; cor: string; logo: string }[] = [
  { value: 'Visa', label: 'Visa', cor: 'bg-blue-600', logo: '/src/assets/images/card-brands/visa.png' },
  { value: 'Mastercard', label: 'Mastercard', cor: 'bg-red-600', logo: '/src/assets/images/card-brands/mastercard.png' },
  { value: 'American Express', label: 'American Express', cor: 'bg-green-600', logo: '/src/assets/images/card-brands/amex.png' },
  { value: 'Elo', label: 'Elo', cor: 'bg-yellow-600', logo: '/src/assets/images/card-brands/elo.png' },
  { value: 'Hipercard', label: 'Hipercard', cor: 'bg-orange-600', logo: '/src/assets/images/card-brands/hipercard.png' },
  { value: 'Diners Club', label: 'Diners Club', cor: 'bg-gray-600', logo: '/src/assets/images/card-brands/diners.png' },
  { value: 'Discover', label: 'Discover', cor: 'bg-purple-600', logo: '/src/assets/images/card-brands/discover.png' },
  { value: 'JCB', label: 'JCB', cor: 'bg-indigo-600', logo: '/src/assets/images/card-brands/jcb.png' },
  { value: 'UnionPay', label: 'UnionPay', cor: 'bg-pink-600', logo: '/src/assets/images/card-brands/unionpay.png' },
  { value: 'Cabal', label: 'Cabal', cor: 'bg-teal-600', logo: '/src/assets/images/card-brands/cabal.png' },
  { value: 'Aura', label: 'Aura', cor: 'bg-cyan-600', logo: '/src/assets/images/card-brands/aura.webp' },
  { value: 'Banricompras', label: 'Banricompras', cor: 'bg-lime-600', logo: '/src/assets/images/card-brands/banricompras.png' }
];

const CreditCards: React.FC = () => {

  // Funções para formatação de moeda
  const formatCurrencyInput = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleLimiteChange = (value: string) => {
    // Remove tudo que não é número
    const numbersOnly = value.replace(/\D/g, '');
    
    // Converte para centavos (divide por 100)
    const valueInCents = parseInt(numbersOnly) || 0;
    const finalValue = valueInCents / 100;
    
    setFormData({...formData, limite: finalValue});
  };

  const [cartoes, setCartoes] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartaoSelecionado, setCartaoSelecionado] = useState<number | null>(null);
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
  const [cartaoEditando, setCartaoEditando] = useState<CreditCard | null>(null);

  // Transações carregadas da API
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [carregandoTransacoes, setCarregandoTransacoes] = useState(false);

  const [formData, setFormData] = useState<CreditCardFormData>({
    nome: '',
    bandeira: 'Visa',
    ultimos_4_digitos: '',
    dia_vencimento: 1,
    dia_fechamento: 1,
    limite: 0,
    cor: 'bg-blue-600' // Será atualizado automaticamente baseado na bandeira
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

  useEffect(() => {
    carregarCartoes();
  }, []);

  useEffect(() => {
    // Selecionar o primeiro cartão automaticamente quando carregados
    if (cartoes.length > 0 && !cartaoSelecionado) {
      setCartaoSelecionado(cartoes[0].id);
    }
  }, [cartoes]);

  // Carregar transações quando cartão for selecionado
  useEffect(() => {
    if (cartaoSelecionado) {
      carregarTransacoes(cartaoSelecionado);
    }
  }, [cartaoSelecionado]);

  // Atualizar cor automaticamente quando bandeira mudar
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cor: getBandeiraCor(prev.bandeira)
    }));
  }, [formData.bandeira]);

  const carregarCartoes = async () => {
    try {
      setLoading(true);
      const data = await creditCardsAPI.getAll();
      setCartoes(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      toast.error('Erro ao carregar cartões de crédito');
    } finally {
      setLoading(false);
    }
  };

  const carregarTransacoes = async (cartaoId: number) => {
    try {
      setCarregandoTransacoes(true);
      const data = await transactionsAPI.getByCreditCard(cartaoId);
      setTransacoes(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações do cartão');
    } finally {
      setCarregandoTransacoes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Atualizar a cor baseada na bandeira selecionada
      const dadosParaEnviar = {
        ...formData,
        cor: getBandeiraCor(formData.bandeira)
      };
      
      if (cartaoEditando) {
        const cartaoAtualizado = await creditCardsAPI.update(cartaoEditando.id, dadosParaEnviar);
        setCartoes(cartoes.map(c => c.id === cartaoEditando.id ? cartaoAtualizado : c));
        toast.success('Cartão atualizado com sucesso!');
      } else {
        const novoCartao = await creditCardsAPI.create(dadosParaEnviar);
        setCartoes([...cartoes, novoCartao]);
        toast.success('Cartão criado com sucesso!');
      }
      
      handleCloseModal();
    } catch (error: any) {
      console.error('Erro ao salvar cartão:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar cartão';
      toast.error(errorMessage);
    }
  };

  const handleEditar = (cartao: CreditCard) => {
    setCartaoEditando(cartao);
    setFormData({
      nome: cartao.nome,
      bandeira: cartao.bandeira,
      ultimos_4_digitos: cartao.ultimos_4_digitos,
      dia_vencimento: cartao.dia_vencimento,
      dia_fechamento: cartao.dia_fechamento,
      limite: parseFloat(cartao.limite),
      cor: getBandeiraCor(cartao.bandeira) // Cor automática baseada na bandeira
    });
    setMostrarModal(true);
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) {
      return;
    }

    try {
      await creditCardsAPI.delete(id);
      setCartoes(cartoes.filter(c => c.id !== id));
      if (cartaoSelecionado === id) {
        setCartaoSelecionado(cartoes.length > 1 ? cartoes.find(c => c.id !== id)?.id || null : null);
      }
      toast.success('Cartão excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      toast.error('Erro ao excluir cartão');
    }
  };

  const handleCloseModal = () => {
    setMostrarModal(false);
    setCartaoEditando(null);
    setFormData({
      nome: '',
      bandeira: 'Visa',
      ultimos_4_digitos: '',
      dia_vencimento: 1,
      dia_fechamento: 1,
      limite: 0,
      cor: 'bg-blue-600' // Cor padrão do Visa
    });
  };

  // Funções auxiliares
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatCardNumber = (ultimos4: string) => {
    return `**** **** **** ${ultimos4}`;
  };

  const getBandeiraCor = (bandeira: CreditCardBrand) => {
    const bandeiraInfo = CREDIT_CARD_BRANDS.find(b => b.value === bandeira);
    return bandeiraInfo?.cor || 'bg-gray-600';
  };

  const getBandeiraLogo = (bandeira: CreditCardBrand) => {
    const bandeiraInfo = CREDIT_CARD_BRANDS.find(b => b.value === bandeira);
    const logoPath = bandeiraInfo?.logo || '/src/assets/images/card-brands/visa.png';
    return (
      <img 
        src={logoPath} 
        alt={bandeira} 
        className="h-6 w-auto object-contain"
        onError={(e) => {
          // Fallback para emoji se a imagem não carregar
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.setAttribute('style', 'display: inline');
        }}
      />
    );
  };

  const getTransacoesDoMes = (cartaoId: number, anoMes: string) => {
    return transacoes.filter(t => {
      if (t.credit_card !== cartaoId) return false;
      const dataTransacao = new Date(t.data);
      const anoMesTransacao = `${dataTransacao.getFullYear()}-${String(dataTransacao.getMonth() + 1).padStart(2, '0')}`;
      return anoMesTransacao === anoMes;
    });
  };

  const getMesesDisponiveis = () => {
    const meses = [];
    const hoje = new Date();
    
    // 2 meses fechados (passados)
    for (let i = 2; i >= 1; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const anoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses.push(anoMes);
    }
    
    // Mês atual
    const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    meses.push(mesAtual);
    
    // 2 meses futuros (abertos)
    for (let i = 1; i <= 2; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const anoMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses.push(anoMes);
    }
    
    return meses;
  };

  const formatarMesAno = (anoMes: string) => {
    const [ano, mes] = anoMes.split('-');
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    return data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const getValorFatura = (cartaoId: number, anoMes: string) => {
    return getTransacoesDoMes(cartaoId, anoMes).reduce((total, t) => total + parseFloat(t.valor), 0);
  };

  const isFaturaFechada = (cartaoId: number, anoMes: string) => {
    const hoje = new Date();
    const [ano, mes] = anoMes.split('-').map(Number);
    const cartao = cartoes.find(c => c.id === cartaoId);
    
    if (!cartao) return false;
    
    // Se é mês futuro, ainda não fechou
    if (ano > hoje.getFullYear() || (ano === hoje.getFullYear() && mes > hoje.getMonth() + 1)) {
      return false;
    }
    
    // Se é mês atual, verifica se já passou do dia de fechamento
    if (ano === hoje.getFullYear() && mes === hoje.getMonth() + 1) {
      return hoje.getDate() > cartao.dia_fechamento;
    }
    
    // Se é mês passado, já fechou
    return true;
  };

  const handleAcoesTransacao = (transacaoId: number) => {
    setMenuAcoesAberto(menuAcoesAberto === transacaoId ? null : transacaoId);
  };

  const handleExcluirTransacao = (transacaoId: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransacoes(transacoes.filter(t => t.id !== transacaoId));
      toast.success('Transação excluída com sucesso!');
    }
    setMenuAcoesAberto(null);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      setMenuAcoesAberto(null);
    };
    
    if (menuAcoesAberto) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [menuAcoesAberto]);

  // Controlar scroll da página quando modal estiver aberto
  useEffect(() => {
    if (mostrarModal || mostrarModalTransacao) {
      // Bloquear scroll completamente
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restaurar scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    // Cleanup function para restaurar o scroll quando o componente for desmontado
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mostrarModal, mostrarModalTransacao]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
            className={`relative cursor-pointer transform transition-all duration-500 ease-out hover:scale-[1.02] ${
              cartaoSelecionado === cartao.id ? 'scale-105' : ''
            }`}
          >
            {/* Card visual do cartão - altura reduzida */}
            <div className={`relative rounded-xl p-4 text-white shadow-lg min-h-[140px] flex flex-col justify-between overflow-hidden transition-all duration-700 ease-in-out ${
              cartaoSelecionado === cartao.id 
                ? `${cartao.cor} shadow-2xl` 
                : 'bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700'
            }`}>
              {/* Background pattern - só aparece no cartão selecionado */}
              {cartaoSelecionado === cartao.id && (
                <div className="absolute inset-0 opacity-10 animate-in fade-in duration-700">
                  <div className="absolute top-2 right-2 w-12 h-12 rounded-full border-2 border-white animate-pulse"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-white animate-pulse delay-150"></div>
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
                    <div className="flex items-center">{getBandeiraLogo(cartao.bandeira)}</div>
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
                    {formatCardNumber(cartao.ultimos_4_digitos)}
                  </p>
                </div>
              </div>
              
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-75">Bandeira</p>
                  <p className="text-xs font-semibold">{cartao.bandeira_display}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">Usado</p>
                  <p className="text-sm font-bold">{formatCurrency(cartao.saldo_atual)}</p>
                </div>
              </div>
              
              {/* Indicador de seleção - agora mais discreto */}
              {cartaoSelecionado === cartao.id && (
                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full shadow-md animate-in zoom-in duration-500 animate-pulse"></div>
              )}
            </div>
            
            {/* Informações extras abaixo do card */}
            <div className="mt-2 px-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Venc: {cartao.dia_vencimento}</span>
                <span>Fech: {cartao.dia_fechamento}</span>
                <span>Limite: {formatCurrency(cartao.limite)}</span>
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                      cartaoSelecionado === cartao.id 
                        ? 'bg-gradient-to-r from-green-400 to-red-500' 
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${cartao.percentual_usado}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 text-center transition-all duration-500">
                  {cartao.percentual_usado.toFixed(1)}% usado
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {cartoes.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cartão encontrado</h3>
          <p className="text-gray-600 mb-4">Adicione seu primeiro cartão de crédito para começar</p>
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Adicionar Cartão
          </button>
        </div>
      )}

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
                  <span>Fechamento: dia {cartoes.find(c => c.id === cartaoSelecionado)?.dia_fechamento}</span>
                  <span>Vencimento: dia {cartoes.find(c => c.id === cartaoSelecionado)?.dia_vencimento}</span>
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
                    {carregandoTransacoes ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="ml-2 text-sm text-gray-500">Carregando transações...</span>
                          </div>
                        </td>
                      </tr>
                    ) : getTransacoesDoMes(cartaoSelecionado, mesSelecionado).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                          Nenhuma transação encontrada para este período
                        </td>
                      </tr>
                    ) : (
                      getTransacoesDoMes(cartaoSelecionado, mesSelecionado).map((transacao) => (
                        <tr key={transacao.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                          {new Date(transacao.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700">
                          <div>
                            <p className="font-normal">{transacao.descricao}</p>
                            <p className="text-xs text-blue-600 bg-blue-100 rounded-full px-2 py-1 inline-block mt-1">
                              {transacao.category_name || 'Sem categoria'}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            Geral
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                          {transacao.total_parcelas > 1 ? `${transacao.numero_parcela}/${transacao.total_parcelas}` : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-normal text-right">
                          <div className="flex items-center justify-end">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-2 flex items-center">
                              ● R$ {parseFloat(transacao.valor).toFixed(2).replace('.', ',')}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                <p className="text-gray-600 mb-4">Nenhuma movimentação encontrada para este mês</p>
                <button
                  onClick={() => setMostrarModalTransacao(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Adicionar Transação
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cartão */}
      {mostrarModal && (
        <>
          {/* Backdrop com blur */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" 
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  {cartaoEditando ? 'Editar Cartão' : 'Novo Cartão'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Formulário - Container com scroll */}
              <div className="flex-1 overflow-y-auto">
                <form id="credit-card-form" onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Cartão
                      </label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bandeira
                  </label>
                  <select
                    value={formData.bandeira}
                    onChange={(e) => setFormData({...formData, bandeira: e.target.value as CreditCardBrand})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {CREDIT_CARD_BRANDS.map(brand => (
                      <option key={brand.value} value={brand.value}>
                        {brand.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Últimos 4 Dígitos
                  </label>
                  <input
                    type="text"
                    value={formData.ultimos_4_digitos}
                    onChange={(e) => setFormData({...formData, ultimos_4_digitos: e.target.value})}
                    maxLength={4}
                    pattern="[0-9]{4}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia Vencimento
                    </label>
                    <select
                      value={formData.dia_vencimento}
                      onChange={(e) => setFormData({...formData, dia_vencimento: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia Fechamento
                    </label>
                    <select
                      value={formData.dia_fechamento}
                      onChange={(e) => setFormData({...formData, dia_fechamento: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={formatCurrencyInput(formData.limite)}
                      onChange={(e) => handleLimiteChange(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                  </div>
                </form>
              </div>

              {/* Botões - Fixos na parte inferior */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="credit-card-form"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  {cartaoEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}      {/* Modal de Nova Transação */}
      {mostrarModalTransacao && (
        <>
          {/* Backdrop com blur */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" 
            onClick={() => setMostrarModalTransacao(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
                <button
                  onClick={() => setMostrarModalTransacao(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Formulário - Container com scroll */}
              <div className="flex-1 overflow-y-auto">
                <form id="transaction-form" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const transactionData = {
                  credit_card: cartaoSelecionado,
                  tipo: 'saida' as const,
                  valor: novaTransacao.valor,
                  descricao: novaTransacao.descricao,
                  observacoes: '',
                  data: novaTransacao.dataCompra,
                  category: novaTransacao.categoria ? parseInt(novaTransacao.categoria) : undefined,
                  total_parcelas: 1,
                  tipo_recorrencia: novaTransacao.recorrente ? novaTransacao.tipoRecorrencia : 'nenhuma' as const
                };

                await transactionsAPI.create(transactionData);
                
                // Recarregar transações
                if (cartaoSelecionado) {
                  carregarTransacoes(cartaoSelecionado);
                }
                
                setMostrarModalTransacao(false);
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
                
                toast.success('Transação adicionada com sucesso!');
              } catch (error) {
                console.error('Erro ao criar transação:', error);
                toast.error('Erro ao criar transação');
              }
            }} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Descrição */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={novaTransacao.descricao}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Supermercado, Combustível..."
                    required
                  />
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaTransacao.valor}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                    required
                  />
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    value={novaTransacao.dataCompra}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, dataCompra: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={novaTransacao.categoria}
                    onChange={(e) => setNovaTransacao(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="1">Alimentação</option>
                    <option value="2">Transporte</option>
                    <option value="3">Moradia</option>
                    <option value="4">Saúde</option>
                    <option value="5">Entretenimento</option>
                    <option value="6">Compras Online</option>
                    <option value="7">Combustível</option>
                    <option value="8">Outros</option>
                  </select>
                </div>

                {/* Recorrente */}
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={novaTransacao.recorrente}
                      onChange={(e) => setNovaTransacao(prev => ({ ...prev, recorrente: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Transação recorrente</span>
                  </label>
                </div>

                {/* Tipo de Recorrência - só aparece se for recorrente */}
                {novaTransacao.recorrente && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Recorrência
                    </label>
                    <select
                      value={novaTransacao.tipoRecorrencia}
                      onChange={(e) => setNovaTransacao(prev => ({ ...prev, tipoRecorrencia: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  )}
                </div>
              </form>
              </div>

              {/* Botões - Fixos na parte inferior */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMostrarModalTransacao(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="transaction-form"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Adicionar Transação
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreditCards;