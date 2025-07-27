import React from 'react';

const Transactions: React.FC = () => {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Transações
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Visualize e gerencie suas transações financeiras
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Nova Transação
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          <li className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-sm font-medium">-</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Supermercado</div>
                  <div className="text-sm text-gray-500">Alimentação • Hoje</div>
                </div>
              </div>
              <div className="text-sm font-medium text-red-600">-R$ 150,00</div>
            </div>
          </li>
          
          <li className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">+</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Salário Mensal</div>
                  <div className="text-sm text-gray-500">Salário • 1º do mês</div>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">+R$ 5.000,00</div>
            </div>
          </li>

          <li className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-sm font-medium">-</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Combustível</div>
                  <div className="text-sm text-gray-500">Transporte • Ontem</div>
                </div>
              </div>
              <div className="text-sm font-medium text-red-600">-R$ 80,00</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Transactions;
