import React from 'react';

const Budgets: React.FC = () => {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Orçamentos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Controle seus gastos mensais por categoria
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Novo Orçamento
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Alimentação</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Gasto: R$ 600,00</span>
              <span>Orçamento: R$ 800,00</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-600">Restam R$ 200,00 (25%)</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transporte</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Gasto: R$ 350,00</span>
              <span>Orçamento: R$ 400,00</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '87.5%' }}></div>
            </div>
            <p className="text-sm text-gray-600">Restam R$ 50,00 (12.5%)</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lazer</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Gasto: R$ 520,00</span>
              <span>Orçamento: R$ 500,00</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm text-red-600">Excedeu em R$ 20,00 (4%)</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Saúde</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Gasto: R$ 250,00</span>
              <span>Orçamento: R$ 600,00</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: '42%' }}></div>
            </div>
            <p className="text-sm text-gray-600">Restam R$ 350,00 (58%)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
