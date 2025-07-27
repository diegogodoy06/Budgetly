import React from 'react';

const Reports: React.FC = () => {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Relatórios
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Analise seus dados financeiros com gráficos e relatórios
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Resumo Mensal */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do Mês</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total de Receitas</span>
              <span className="text-lg font-bold text-green-600">R$ 5.000,00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total de Despesas</span>
              <span className="text-lg font-bold text-red-600">R$ 1.800,00</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Saldo do Mês</span>
                <span className="text-xl font-bold text-green-600">R$ 3.200,00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gastos por Categoria */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Moradia</span>
              </div>
              <span className="text-sm font-medium">R$ 1.200,00 (67%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Alimentação</span>
              </div>
              <span className="text-sm font-medium">R$ 150,00 (8%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Lazer</span>
              </div>
              <span className="text-sm font-medium">R$ 120,00 (7%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Transporte</span>
              </div>
              <span className="text-sm font-medium">R$ 80,00 (4%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Saúde</span>
              </div>
              <span className="text-sm font-medium">R$ 250,00 (14%)</span>
            </div>
          </div>
        </div>

        {/* Evolução Patrimonial */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução Patrimonial</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Gráfico de evolução patrimonial será implementado aqui</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
