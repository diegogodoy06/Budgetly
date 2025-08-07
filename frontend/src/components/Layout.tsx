import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  CheckIcon,
  TagIcon,
  UserGroupIcon,
  MapIcon,
  UserIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRefMobile = useRef<HTMLDivElement>(null);
  const dropdownRefDesktop = useRef<HTMLDivElement>(null);
  const profileDropdownRefMobile = useRef<HTMLDivElement>(null);
  const profileDropdownRefDesktop = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (dropdownRefMobile.current && !dropdownRefMobile.current.contains(event.target as Node)) &&
        (dropdownRefDesktop.current && !dropdownRefDesktop.current.contains(event.target as Node))
      ) {
        setWorkspaceDropdownOpen(false);
      }
      
      if (
        (profileDropdownRefMobile.current && !profileDropdownRefMobile.current.contains(event.target as Node)) &&
        (profileDropdownRefDesktop.current && !profileDropdownRefDesktop.current.contains(event.target as Node))
      ) {
        setProfileDropdownOpen(false);
      }
    };

    if (workspaceDropdownOpen || profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [workspaceDropdownOpen, profileDropdownOpen]);

  // Manter dropdown de configurações aberto se estiver em uma página de configurações
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSettingsDropdownOpen(true);
    }
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Transações', href: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Contas', href: '/accounts', icon: BuildingLibraryIcon },
    { name: 'Cartões', href: '/credit-cards', icon: CreditCardIcon },
    { name: 'Orçamentos', href: '/budgets', icon: DocumentTextIcon },
    { name: 'Relatórios', href: '/reports', icon: ChartBarIcon },
    { name: 'Workspaces', href: '/workspaces', icon: BuildingOfficeIcon },
  ];

  const settingsNavigation = [
    { name: 'Categorias', href: '/settings/categories', icon: TagIcon },
    { name: 'Centros de Custo', href: '/settings/cost-centers', icon: MapIcon },
    { name: 'Beneficiários', href: '/settings/beneficiaries', icon: UserGroupIcon },
    { name: 'Automação', href: '/settings/automation-rules', icon: CommandLineIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWorkspaceChange = (workspace: any) => {
    setCurrentWorkspace(workspace);
    setWorkspaceDropdownOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Budgetly</h1>
              </div>
            </div>
            
            {/* Workspace atual no menu lateral - Mobile */}
            {currentWorkspace ? (
              <div className="mt-6 px-4">
                <div className="relative" ref={dropdownRefMobile}>
                  <button
                    onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 mb-4 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <BuildingOfficeIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {currentWorkspace.nome}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">Workspace Atual</p>
                        </div>
                      </div>
                      <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${workspaceDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Dropdown de workspaces - Mobile */}
                  {workspaceDropdownOpen && Array.isArray(workspaces) && workspaces.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 py-1">
                      {workspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => handleWorkspaceChange(workspace)}
                          className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                            currentWorkspace.id === workspace.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3 ${
                                currentWorkspace.id === workspace.id ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <BuildingOfficeIcon className={`h-3.5 w-3.5 ${
                                  currentWorkspace.id === workspace.id ? 'text-blue-600' : 'text-gray-500'
                                }`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {workspace.nome}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {workspace.membros_count} {workspace.membros_count === 1 ? 'membro' : 'membros'}
                                </p>
                              </div>
                            </div>
                            {currentWorkspace.id === workspace.id && (
                              <CheckIcon className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 px-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3 animate-pulse">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">
                        Carregando workspace...
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Aguarde</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Divisor sutil */}
            <div className="px-4">
              <div className="border-t border-gray-200"></div>
            </div>
            
            <nav className="mt-2 px-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}

              {/* Submenu de Configurações - Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                  className={`${
                    location.pathname.startsWith('/settings')
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left`}
                >
                  <div className="flex items-center">
                    <CogIcon
                      className={`${
                        location.pathname.startsWith('/settings') ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    Configurações
                  </div>
                  <ChevronDownIcon 
                    className={`h-4 w-4 transition-transform duration-200 ${
                      settingsDropdownOpen ? 'rotate-180' : ''
                    } ${
                      location.pathname.startsWith('/settings') ? 'text-white' : 'text-gray-400'
                    }`} 
                  />
                </button>
                
                {settingsDropdownOpen && (
                  <div className="ml-4 space-y-1">
                    {settingsNavigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
                        >
                          <item.icon
                            className={`${
                              isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                            } mr-3 flex-shrink-0 h-4 w-4`}
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
            
            {/* Seção de Perfil do Usuário - Mobile (no final da página) */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="px-4">
                <div className="relative" ref={profileDropdownRefMobile}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  >
                    <div className="mr-3 flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                        {user?.first_name || user?.email || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Configurações
                      </p>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown do perfil - Mobile */}
                  {profileDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mb-2 py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Ver Perfil
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <CogIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Configurações Gerais
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200 shadow-sm">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">Budgetly</h1>
                </div>
              </div>
              
              {/* Workspace atual no menu lateral - Desktop */}
              {currentWorkspace ? (
                <div className="mt-6 px-4">
                  <div className="relative" ref={dropdownRefDesktop}>
                    <button
                      onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 mb-4 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <BuildingOfficeIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {currentWorkspace.nome}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">Workspace Atual</p>
                          </div>
                        </div>
                        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${workspaceDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Dropdown de workspaces - Desktop */}
                    {workspaceDropdownOpen && Array.isArray(workspaces) && workspaces.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 py-1">
                        {workspaces.map((workspace) => (
                          <button
                            key={workspace.id}
                            onClick={() => handleWorkspaceChange(workspace)}
                            className={`w-full px-3 py-2.5 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                              currentWorkspace.id === workspace.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3 ${
                                  currentWorkspace.id === workspace.id ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                  <BuildingOfficeIcon className={`h-3.5 w-3.5 ${
                                    currentWorkspace.id === workspace.id ? 'text-blue-600' : 'text-gray-500'
                                  }`} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {workspace.nome}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {workspace.membros_count} {workspace.membros_count === 1 ? 'membro' : 'membros'}
                                  </p>
                                </div>
                              </div>
                              {currentWorkspace.id === workspace.id && (
                                <CheckIcon className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 px-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3 animate-pulse">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700">
                          Carregando workspace...
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Aguarde</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Divisor sutil */}
              <div className="px-4">
                <div className="border-t border-gray-200"></div>
              </div>
              
              <nav className="mt-2 flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Submenu de Configurações - Desktop */}
                <div className="space-y-1">
                  <button
                    onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                    className={`${
                      location.pathname.startsWith('/settings')
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    } group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left`}
                  >
                    <div className="flex items-center">
                      <CogIcon
                        className={`${
                          location.pathname.startsWith('/settings') ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      Configurações
                    </div>
                    <ChevronDownIcon 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        settingsDropdownOpen ? 'rotate-180' : ''
                      } ${
                        location.pathname.startsWith('/settings') ? 'text-white' : 'text-gray-400'
                      }`} 
                    />
                  </button>
                  
                  {settingsDropdownOpen && (
                    <div className="ml-4 space-y-1">
                      {settingsNavigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`${
                              isActive
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
                          >
                            <item.icon
                              className={`${
                                isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'
                              } mr-3 flex-shrink-0 h-4 w-4`}
                            />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </nav>
            </div>
            
            {/* Seção de Perfil do Usuário - Desktop (no final da página) */}
            <div className="flex-shrink-0 pt-4 border-t border-gray-200">
              <div className="px-4 pb-4">
                <div className="relative" ref={profileDropdownRefDesktop}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  >
                    <div className="mr-3 flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                        {user?.first_name || user?.email || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Configurações
                      </p>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown do perfil - Desktop */}
                  {profileDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg mb-2 py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Ver Perfil
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <CogIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Configurações Gerais
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="md:hidden relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          {/* Mobile menu button */}
          <div className="md:hidden pl-4 pt-4 sm:pl-6 sm:pt-4">
            <button
              type="button"
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
