import React, { useState } from 'react';
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

// Mock data para carteiras (temporário)
const carteirasMock = [
  { id: 1, nome: 'Conta Corrente BB', tipo: 'conta-bancaria' },
  { id: 2, nome: 'Poupança Itaú', tipo: 'conta-bancaria' },
  { id: 3, nome: 'Nubank', tipo: 'cartao-credito' },
  { id: 4, nome: 'Bitcoin Wallet', tipo: 'criptomoeda' },
];

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

interface Movimentacao {
  id: number;
  descricao: string;
  valor: number;
  dataPagamento: string;
  dataVencimento: string;
  categoria: string;
  conta: string;
  centroCusto: string;
  tipo: 'entrada' | 'saida' | 'conta-receber' | 'conta-pagar';
  status: 'pago' | 'pendente' | 'vencido';
}

const Transactions: React.FC = () => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<TipoMovimentacao>('todas');
  
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

  // Mock data para movimentações
  const movimentacoes: Movimentacao[] = [
    {
      id: 1,
      descricao: 'Supermercado Extra',
      valor: -150.00,
      dataPagamento: '2025-01-28',
      dataVencimento: '2025-01-28',
      categoria: 'Alimentação',
      conta: 'Conta Corrente BB',
      centroCusto: 'Pessoal',
      tipo: 'saida',
      status: 'pago'
    },
    {
      id: 2,
      descricao: 'Salário Mensal',
      valor: 5000.00,
      dataPagamento: '2025-01-01',
      dataVencimento: '2025-01-01',
      categoria: 'Salário',
      conta: 'Conta Corrente BB',
      centroCusto: 'Pessoal',
      tipo: 'entrada',
      status: 'pago'
    },
    {
      id: 3,
      descricao: 'Combustível Posto Shell',
      valor: -80.00,
      dataPagamento: '2025-01-27',
      dataVencimento: '2025-01-27',
      categoria: 'Transporte',
      conta: 'Nubank',
      centroCusto: 'Pessoal',
      tipo: 'saida',
      status: 'pago'
    },
    {
      id: 4,
      descricao: 'Freelance Cliente ABC',
      valor: 1500.00,
      dataPagamento: '',
      dataVencimento: '2025-02-15',
      categoria: 'Serviços',
      conta: 'Conta Corrente BB',
      centroCusto: 'Pessoal',
      tipo: 'conta-receber',
      status: 'pendente'
    },
    {
      id: 5,
      descricao: 'Cartão de Crédito - Fatura',
      valor: -850.00,
      dataPagamento: '',
      dataVencimento: '2025-02-10',
      categoria: 'Cartão de Crédito',
      conta: 'Conta Corrente BB',
      centroCusto: 'Pessoal',
      tipo: 'conta-pagar',
      status: 'pendente'
    },
    {
      id: 6,
      descricao: 'Aluguel Apartamento',
      valor: -1200.00,
      dataPagamento: '',
      dataVencimento: '2025-01-30',
      categoria: 'Moradia',
      conta: 'Conta Corrente BB',
      centroCusto: 'Pessoal',
      tipo: 'conta-pagar',
      status: 'vencido'
    }
  ];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'text-green-600';
      case 'pendente': return 'text-yellow-600';
      case 'vencido': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100';
      case 'pendente': return 'bg-yellow-100';
      case 'vencido': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
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
      count: movimentacoes.length,
      valor: movimentacoes.reduce((acc, mov) => acc + mov.valor, 0)
    },
    { 
      id: 'entradas' as TipoMovimentacao, 
      nome: 'Entradas', 
      count: movimentacoes.filter(m => m.tipo === 'entrada').length,
      valor: movimentacoes.filter(m => m.tipo === 'entrada').reduce((acc, mov) => acc + mov.valor, 0)
    },
    { 
      id: 'saidas' as TipoMovimentacao, 
      nome: 'Saídas', 
      count: movimentacoes.filter(m => m.tipo === 'saida').length,
      valor: movimentacoes.filter(m => m.tipo === 'saida').reduce((acc, mov) => acc + mov.valor, 0)
    },
    { 
      id: 'contas-receber' as TipoMovimentacao, 
      nome: 'Contas a Receber', 
      count: movimentacoes.filter(m => m.tipo === 'conta-receber').length,
      valor: movimentacoes.filter(m => m.tipo === 'conta-receber').reduce((acc, mov) => acc + mov.valor, 0)
    },
    { 
      id: 'contas-pagar' as TipoMovimentacao, 
      nome: 'Contas a Pagar', 
      count: movimentacoes.filter(m => m.tipo === 'conta-pagar').length,
      valor: movimentacoes.filter(m => m.tipo === 'conta-pagar').reduce((acc, mov) => acc + mov.valor, 0)
    }
  ];

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    if (abaAtiva === 'entradas' && mov.tipo !== 'entrada') return false;
    if (abaAtiva === 'saidas' && mov.tipo !== 'saida') return false;
    if (abaAtiva === 'contas-receber' && mov.tipo !== 'conta-receber') return false;
    if (abaAtiva === 'contas-pagar' && mov.tipo !== 'conta-pagar') return false;
    return true;
  });

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
                      <div className="text-xs text-gray-500 mt-1">
                        {aba.count} {aba.count === 1 ? 'item' : 'itens'}
                      </div>
                      <div className={`text-sm font-medium mt-1 ${
                        aba.valor >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movimentacoesFiltradas.map((movimentacao) => (
                    <tr key={movimentacao.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarData(movimentacao.dataPagamento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarData(movimentacao.dataVencimento)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${getStatusBg(movimentacao.status)}`}>
                            <div className={`w-full h-full rounded-full ${
                              movimentacao.status === 'pago' ? 'bg-green-500' :
                              movimentacao.status === 'pendente' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                          </div>
                          <div>
                            <div className="font-medium">{movimentacao.descricao}</div>
                            <div className="text-gray-500 text-xs">{movimentacao.categoria}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimentacao.conta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movimentacao.centroCusto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className={`${
                          movimentacao.valor >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatarMoeda(movimentacao.valor)}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                  Carteiras
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {carteirasMock.map((carteira) => (
                    <label key={carteira.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filtros.carteiras.includes(carteira.id)}
                        onChange={() => setFiltros(prev => ({
                          ...prev,
                          carteiras: toggleItemFiltro(prev.carteiras, carteira.id)
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{carteira.nome}</span>
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
                  {['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação'].map((categoria, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{categoria}</span>
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
      </div>
    </div>
  );
};

export default Transactions;
