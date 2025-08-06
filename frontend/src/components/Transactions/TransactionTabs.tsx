import React from 'react';

type TipoMovimentacao = 'todas' | 'entradas' | 'saidas' | 'contas-receber' | 'contas-pagar';

interface TransactionTabsProps {
  abaAtiva: TipoMovimentacao;
  setAbaAtiva: (aba: TipoMovimentacao) => void;
  transactions: Array<{ tipo: string; confirmada: boolean; valor: string }>;
  formatarMoeda: (valor: string | number) => string;
}

const TransactionTabs: React.FC<TransactionTabsProps> = ({
  abaAtiva,
  setAbaAtiva,
  transactions,
  formatarMoeda
}) => {
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
  );
};

export default TransactionTabs;