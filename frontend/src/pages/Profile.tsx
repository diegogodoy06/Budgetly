import React from 'react';

const Profile: React.FC = () => {
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Perfil
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Seu nome"
                  defaultValue="Admin"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Sobrenome
                </label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Seu sobrenome"
                  defaultValue="User"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Nome de usuário"
                  defaultValue="admin"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="seu@email.com"
                  defaultValue="admin@budgetly.com"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Alterar Senha
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                  Senha atual
                </label>
                <input
                  type="password"
                  name="current_password"
                  id="current_password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                  Nova senha
                </label>
                <input
                  type="password"
                  name="new_password"
                  id="new_password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  id="confirm_password"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
