import React from 'react';

type TipoMovimentacao = 'todas' | 'entradas' | 'saidas' | 'contas-receber' | 'contas-pagar';

interface TransactionTabsProps {
  abaAtiva: TipoMovimentacao;
  setAbaAtiva: (aba: TipoMovimentacao) => void;
  transactions: Array<{ tipo: string; confirmada: boolean; valor: string }>;
  formatarMoeda: (valor: string | number) => string;
  filtroContaAtiva: 'todas' | 'bancos' | 'cartoes' | number;
  obterNomeFiltroAtivo: () => string;
}

const TransactionTabs: React.FC<TransactionTabsProps> = ({
  abaAtiva,
  setAbaAtiva,
  transactions,
  formatarMoeda,
  filtroContaAtiva,
  obterNomeFiltroAtivo
}) => {
  const abas = [
    { 
      id: 'todas' as TipoMovimentacao, 
      nome: 'Todas', 
      valor: transactions.reduce((acc, t) => acc + parseFloat(t.valor), 0),
      description: 'Total geral'
    },
    { 
      id: 'entradas' as TipoMovimentacao, 
      nome: 'Entradas', 
      icon: '💰',
      valor: transactions.filter(t => t.tipo === 'entrada' && t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0),
      description: 'Receitas confirmadas'
    },
    { 
      id: 'saidas' as TipoMovimentacao, 
      nome: 'Saídas', 
      icon: '💸',
      valor: transactions.filter(t => t.tipo === 'saida' && t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0),
      description: 'Despesas confirmadas'
    },
    { 
      id: 'contas-receber' as TipoMovimentacao, 
      nome: 'A Receber', 
      icon: '📈',
      valor: transactions.filter(t => t.tipo === 'entrada' && !t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0),
      description: 'Receitas pendentes'
    },
    { 
      id: 'contas-pagar' as TipoMovimentacao, 
      nome: 'A Pagar', 
      icon: '📉',
      valor: transactions.filter(t => t.tipo === 'saida' && !t.confirmada).reduce((acc, t) => acc + parseFloat(t.valor), 0),
      description: 'Despesas pendentes'
    }
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg mb-4 border border-gray-200">
      {/* Context Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-medium text-gray-700">
            Resumo Financeiro
          </h4>
          <span className="text-xs text-gray-500">
            {obterNomeFiltroAtivo()}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex-1 whitespace-nowrap py-3 px-3 border-b-2 font-medium text-sm transition-all duration-200 ${
                abaAtiva === aba.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className="font-semibold">{aba.nome}</span>
                </div>
                <div className={`text-base font-bold ${
                  abaAtiva === aba.id ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {formatarMoeda(aba.valor)}
                </div>
                <div className="text-xs text-gray-500">
                  {aba.description}
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Summary Bar */}
      <div className="bg-gray-50 px-4 py-2 rounded-b-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">
            Mostrando: <span className="font-medium">{abas.find(a => a.id === abaAtiva)?.nome}</span>
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">
              Filtro: <span className="font-medium text-gray-700">{filtroContaAtiva === 'todas' ? 'Todas as contas' : obterNomeFiltroAtivo()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTabs;