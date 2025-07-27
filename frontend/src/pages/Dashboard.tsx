import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Bem-vindo, {user?.first_name || user?.username}!
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Cards de resumo */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">R$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Saldo Total</dt>
                    <dd className="text-lg font-medium text-gray-900">R$ 15.000,00</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">+</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Receitas do Mês</dt>
                    <dd className="text-lg font-medium text-gray-900">R$ 5.000,00</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">-</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Gastos do Mês</dt>
                    <dd className="text-lg font-medium text-gray-900">R$ 1.800,00</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Economia</dt>
                    <dd className="text-lg font-medium text-gray-900">R$ 3.200,00</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e transações recentes */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transações Recentes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Supermercado</p>
                  <p className="text-sm text-gray-500">Alimentação • Hoje</p>
                </div>
                <span className="text-sm font-medium text-red-600">-R$ 150,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Salário</p>
                  <p className="text-sm text-gray-500">Renda • 1º do mês</p>
                </div>
                <span className="text-sm font-medium text-green-600">+R$ 5.000,00</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Combustível</p>
                  <p className="text-sm text-gray-500">Transporte • Ontem</p>
                </div>
                <span className="text-sm font-medium text-red-600">-R$ 80,00</span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Alimentação</span>
                  <span className="text-sm text-gray-500">R$ 600,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Moradia</span>
                  <span className="text-sm text-gray-500">R$ 1.200,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Transporte</span>
                  <span className="text-sm text-gray-500">R$ 300,00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
