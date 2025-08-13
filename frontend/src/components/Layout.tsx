import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import Logo from './Logo';
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
  UserIcon,
  CommandLineIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false); // Default to icon mode
  const [darkMode, setDarkMode] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [dockSettingsOpen, setDockSettingsOpen] = useState(false); // New state for dock settings submenu
  const dropdownRefMobile = useRef<HTMLDivElement>(null);
  const dropdownRefDesktop = useRef<HTMLDivElement>(null);
  const profileDropdownRefMobile = useRef<HTMLDivElement>(null);
  const profileDropdownRefDesktop = useRef<HTMLDivElement>(null);
  const dockSettingsRef = useRef<HTMLDivElement>(null); // New ref for dock settings
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Close dropdowns when clicking outside
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

      if (dockSettingsRef.current && !dockSettingsRef.current.contains(event.target as Node)) {
        setDockSettingsOpen(false);
      }
    };

    if (workspaceDropdownOpen || profileDropdownOpen || dockSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [workspaceDropdownOpen, profileDropdownOpen, dockSettingsOpen]);

  // Keep settings dropdown open if on settings page
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
    { name: 'Beneficiários', href: '/settings/beneficiaries', icon: UserGroupIcon },
    { name: 'Automação', href: '/settings/automation-rules', icon: CommandLineIcon },
    { name: 'Workspace', href: '/settings/workspace', icon: CogIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWorkspaceChange = (workspace: any) => {
    setCurrentWorkspace(workspace);
    setWorkspaceDropdownOpen(false);
  };

  const handleNavigation = (href: string) => {
    // Close mobile sidebar when navigating
    setSidebarOpen(false);
    navigate(href);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-soft-100 dark:bg-dark-500 transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full sidebar">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/90 dark:bg-dark-400/90 backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto sidebar-scroll">
            {/* Mobile Logo */}
            <div className="flex-shrink-0 flex items-center px-6 mb-8">
              <Logo size="md" />
            </div>
            
            {/* Mobile workspace selector */}
            {currentWorkspace && (
              <div className="px-4 mb-6">
                <div className="relative" ref={dropdownRefMobile}>
                  <button
                    onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                    className="w-full glass-card p-4 hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                          <BuildingOfficeIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                            {currentWorkspace.nome}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Workspace Atual</p>
                        </div>
                      </div>
                      <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${workspaceDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Mobile workspace dropdown */}
                  {workspaceDropdownOpen && Array.isArray(workspaces) && workspaces.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 glass-card mt-2 py-2 animate-slide-in">
                      {workspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => handleWorkspaceChange(workspace)}
                          className={`w-full px-4 py-3 text-left hover:bg-white/30 dark:hover:bg-white/10 transition-colors first:rounded-t-glass last:rounded-b-glass ${
                            currentWorkspace.id === workspace.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3 ${
                                currentWorkspace.id === workspace.id ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                <BuildingOfficeIcon className={`h-3.5 w-3.5 ${
                                  currentWorkspace.id === workspace.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                                }`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {workspace.nome}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {workspace.membros_count} {workspace.membros_count === 1 ? 'membro' : 'membros'}
                                </p>
                              </div>
                            </div>
                            {currentWorkspace.id === workspace.id && (
                              <CheckIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mobile navigation */}
            <nav className="px-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`nav-item w-full text-left ${
                      isActive ? 'nav-item-active' : 'nav-item-inactive'
                    }`}
                  >
                    <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}

              {/* Mobile settings submenu */}
              <div className="space-y-1">
                <button
                  onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                  className={`nav-item w-full text-left ${
                    location.pathname.startsWith('/settings') ? 'nav-item-active' : 'nav-item-inactive'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <CogIcon className="mr-3 flex-shrink-0 h-5 w-5" />
                      Configurações
                    </div>
                    <ChevronDownIcon 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        settingsDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </button>
                
                {settingsDropdownOpen && (
                  <div className="ml-4 space-y-1">
                    {settingsNavigation.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          className={`w-full ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-2 border-primary-500'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                          } group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-left`}
                        >
                          <item.icon
                            className={`${
                              isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                            } mr-3 flex-shrink-0 h-4 w-4`}
                          />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className={`flex flex-col transition-all duration-300 ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <div className="flex flex-col h-0 flex-1 sidebar">
            {sidebarExpanded ? (
              /* Expanded mode - normal layout */
              <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto sidebar-scroll">
                {/* Desktop Logo */}
                <div className="flex items-center flex-shrink-0 px-6 mb-8">
                  <Logo size="md" />
                </div>

                {/* Desktop workspace selector */}
                {currentWorkspace && (
                  <div className="px-4 mb-6">
                    <div className="relative" ref={dropdownRefDesktop}>
                      <button
                        onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                        className="w-full glass-card p-4 hover:scale-105 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                              <BuildingOfficeIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                {currentWorkspace.nome}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Workspace Atual</p>
                            </div>
                          </div>
                          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${workspaceDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Desktop workspace dropdown */}
                      {workspaceDropdownOpen && Array.isArray(workspaces) && workspaces.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 glass-card mt-2 py-2 animate-slide-in">
                          {workspaces.map((workspace) => (
                            <button
                              key={workspace.id}
                              onClick={() => handleWorkspaceChange(workspace)}
                              className={`w-full px-4 py-3 text-left hover:bg-white/30 dark:hover:bg-white/10 transition-colors first:rounded-t-glass last:rounded-b-glass ${
                                currentWorkspace.id === workspace.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3 ${
                                    currentWorkspace.id === workspace.id ? 'bg-primary-100 dark:bg-primary-800' : 'bg-gray-100 dark:bg-gray-700'
                                  }`}>
                                    <BuildingOfficeIcon className={`h-3.5 w-3.5 ${
                                      currentWorkspace.id === workspace.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                                    }`} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                      {workspace.nome}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {workspace.membros_count} {workspace.membros_count === 1 ? 'membro' : 'membros'}
                                    </p>
                                  </div>
                                </div>
                                {currentWorkspace.id === workspace.id && (
                                  <CheckIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Desktop navigation */}
                <nav className="flex-1 px-4 space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className={`nav-item w-full ${
                          isActive ? 'nav-item-active' : 'nav-item-inactive'
                        }`}
                      >
                        <item.icon className="flex-shrink-0 h-5 w-5 mr-3" />
                        <span className="animate-fade-in">{item.name}</span>
                      </button>
                    );
                  })}

                  {/* Desktop settings submenu */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                      className={`nav-item w-full text-left ${
                        location.pathname.startsWith('/settings') ? 'nav-item-active' : 'nav-item-inactive'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <CogIcon className="flex-shrink-0 h-5 w-5 mr-3" />
                          <span className="animate-fade-in">Configurações</span>
                        </div>
                        <ChevronDownIcon 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            settingsDropdownOpen ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </button>
                    
                    {settingsDropdownOpen && (
                      <div className="ml-4 space-y-1">
                        {settingsNavigation.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <button
                              key={item.name}
                              onClick={() => handleNavigation(item.href)}
                              className={`w-full ${
                                isActive
                                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-2 border-primary-500'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                              } group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
                            >
                              <item.icon
                                className={`${
                                  isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                } mr-3 flex-shrink-0 h-4 w-4`}
                              />
                              <span className="animate-fade-in">{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </nav>
                
                {/* Sidebar toggle button - moved to bottom */}
                <div className="px-4 mt-6">
                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="w-full glass-card p-3 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center">
                      <ChevronRightIcon 
                        className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                          sidebarExpanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Collapsed mode - dock-like centered layout */
              <div className="flex flex-col h-full">
                {/* Top spacer */}
                <div className="flex-1"></div>
                
                {/* Centered dock navigation */}
                <div className="flex flex-col items-center space-y-3 px-4">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className={`nav-item w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'nav-item-active shadow-lg' : 'nav-item-inactive hover:bg-white/20 dark:hover:bg-white/10'
                        }`}
                        title={item.name}
                      >
                        <item.icon className="flex-shrink-0 h-5 w-5" />
                      </button>
                    );
                  })}

                  {/* Settings submenu in dock */}
                  <div className="relative" ref={dockSettingsRef}>
                    <button
                      onClick={() => setDockSettingsOpen(!dockSettingsOpen)}
                      className={`nav-item w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        location.pathname.startsWith('/settings') ? 'nav-item-active shadow-lg' : 'nav-item-inactive hover:bg-white/20 dark:hover:bg-white/10'
                      }`}
                      title="Configurações"
                    >
                      <CogIcon className="flex-shrink-0 h-5 w-5" />
                    </button>

                    {/* Dock settings dropdown */}
                    {dockSettingsOpen && (
                      <div className="absolute left-full top-0 ml-2 w-48 glass-card py-2 z-50 animate-slide-in">
                        {settingsNavigation.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                setDockSettingsOpen(false);
                                handleNavigation(item.href);
                              }}
                              className={`w-full flex items-center px-4 py-3 text-sm text-left transition-colors ${
                                isActive
                                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10'
                              }`}
                            >
                              <item.icon className={`h-4 w-4 mr-3 ${
                                isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400'
                              }`} />
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bottom spacer and expand button */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="px-4 pb-6">
                    <button
                      onClick={() => setSidebarExpanded(!sidebarExpanded)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 mx-auto"
                      title="Expandir menu"
                    >
                      <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Modern Header */}
        <div className="header relative z-10 flex-shrink-0 flex h-20 px-6">
          <div className="flex items-center justify-between w-full">
            {/* Left side - Mobile menu button for small screens */}
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-300"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>

            {/* Center - Search bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar transações, contas..."
                  className="search-input pl-12"
                />
              </div>
            </div>

            {/* Right side - Notifications, theme toggle, and profile */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {darkMode ? (
                  <SunIcon className="h-6 w-6" />
                ) : (
                  <MoonIcon className="h-6 w-6" />
                )}
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-dark-500"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileDropdownRefDesktop}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                >
                  <div className="profile-image">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {user?.first_name || user?.email || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-card py-2 z-50 animate-slide-in backdrop-blur-2xl">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleNavigation('/profile');
                      }}
                      className="w-full flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-left"
                    >
                      <UserIcon className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleNavigation('/settings/categories');
                      }}
                      className="w-full flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-left"
                    >
                      <CogIcon className="h-4 w-4 mr-3 text-gray-400 dark:text-gray-500" />
                      Configurações
                    </button>
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-2"></div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
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