import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BanknotesIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  CloudIcon,
  BeakerIcon,
  RocketLaunchIcon,
  HeartIcon,
  GlobeAltIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import logoCompleto from '../assets/Logo completo.webp';
import logo from '../assets/logo.webp';

const Landing: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    transactions: 0,
    uptime: 99.9,
    rating: 4.8
  });

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Animated counter effect
  useEffect(() => {
    const animateStats = () => {
      const targetStats = { users: 2547, transactions: 89632, uptime: 99.9, rating: 4.8 };
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setStats({
          users: Math.floor(targetStats.users * progress),
          transactions: Math.floor(targetStats.transactions * progress),
          uptime: Number((targetStats.uptime * progress).toFixed(1)),
          rating: Number((targetStats.rating * progress).toFixed(1))
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setStats(targetStats);
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: CreditCardIcon,
      title: 'Gestão Inteligente de Cartões',
      description: 'Controle faturas, limites e datas de vencimento com alertas automáticos e análise de gastos por categoria.',
      highlight: 'Novo'
    },
    {
      icon: ChartBarIcon,
      title: 'Open Finance & Banking APIs',
      description: 'Sincronização automática com bancos brasileiros via Open Banking para atualizações em tempo real.',
      highlight: 'Em Breve'
    },
    {
      icon: UserGroupIcon,
      title: 'Workspaces Colaborativos',
      description: 'Organize finanças pessoais, familiares ou empresariais em espaços separados com controle de acesso.',
      highlight: 'Exclusivo'
    },
    {
      icon: BanknotesIcon,
      title: 'Orçamentos Inteligentes',
      description: 'IA que aprende seus padrões de gastos e sugere orçamentos personalizados com alertas preventivos.',
      highlight: 'IA'
    },
    {
      icon: ChartPieIcon,
      title: 'Analytics Avançado',
      description: 'Dashboards interativos com métricas detalhadas, projeções e comparativos históricos.',
      highlight: 'Pro'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Segurança Bancária',
      description: 'Criptografia AES-256, autenticação 2FA e auditoria completa seguindo padrões LGPD.',
      highlight: 'Seguro'
    }
  ];

  const benefits = [
    {
      icon: TrophyIcon,
      text: 'Saiba exatamente para onde cada centavo está indo com categorização automática'
    },
    {
      icon: RocketLaunchIcon,
      text: 'Automação inteligente que economiza até 5 horas por mês de organização'
    },
    {
      icon: ChartBarIcon,
      text: 'Visualizações e relatórios que transformam dados em insights acionáveis'
    },
    {
      icon: HeartIcon,
      text: 'Alcance suas metas financeiras 3x mais rápido com planejamento orientado por dados'
    },
    {
      icon: GlobeAltIcon,
      text: 'Acesso seguro de qualquer lugar com sincronização em tempo real'
    },
    {
      icon: BeakerIcon,
      text: 'Funcionalidades experimentais com IA para previsão de gastos e otimização'
    }
  ];

  const faqs = [
    {
      question: 'Como o Budgetly protege meus dados financeiros?',
      answer: 'Utilizamos criptografia de nível bancário (AES-256), autenticação multi-fator e seguimos rigorosamente as normas LGPD. Seus dados são armazenados em servidores certificados no Brasil.'
    },
    {
      question: 'Posso conectar minha conta bancária?',
      answer: 'Sim! Estamos integrados com as principais instituições via Open Banking, permitindo sincronização automática e segura de extratos e saldos em tempo real.'
    },
    {
      question: 'Como funciona a IA para categorização?',
      answer: 'Nossa IA analisa descrições de transações, valores, datas e padrões para classificar automaticamente seus gastos. A precisão melhora com o uso, chegando a 95% de acurácia.'
    },
    {
      question: 'Qual o custo da plataforma?',
      answer: 'O Budgetly custa R$ 18/mês com acesso completo a todas as funcionalidades, workspaces ilimitados e suporte. Você pode cancelar a qualquer momento sem multas ou taxas.'
    },
    {
      question: 'É adequado para empresas?',
      answer: 'O Budgetly é focado em gestão financeira pessoal e de grupos pequenos. Não oferecemos recursos empresariais complexos, mas é perfeito para workspaces familiares, grupos de amigos ou pequenos projetos colaborativos.'
    },
    {
      question: 'Há integração com aplicativos de bancos?',
      answer: 'Sim, temos integração via API com os principais bancos brasileiros (Nubank, Inter, Itaú, Bradesco, Santander) e expandimos constantemente nossa rede.'
    }
  ];

  const systemFeatures = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Multi-Plataforma',
      description: 'Web, iOS, Android'
    },
    {
      icon: LockClosedIcon,
      title: 'Segurança',
      description: 'Criptografia AES-256'
    },
    {
      icon: CloudIcon,
      title: 'Cloud Nativo',
      description: 'AWS Infrastructure'
    },
    {
      icon: GlobeAltIcon,
      title: 'API Aberta',
      description: 'Integrações Ilimitadas'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced animated background elements with more motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-sky-400/20 to-blue-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-sky-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full backdrop-blur-lg border border-white/30 animate-float-delayed"></div>
        
        {/* Additional motion elements */}
        <div className="absolute top-60 left-1/3 w-14 h-14 bg-gradient-to-br from-purple-400/15 to-indigo-400/15 rounded-full backdrop-blur-lg border border-white/20 animate-bounce-slow"></div>
        <div className="absolute bottom-60 right-1/4 w-18 h-18 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full backdrop-blur-lg border border-white/20 animate-pulse"></div>
        <div className="absolute top-80 right-40 w-12 h-12 bg-gradient-to-br from-rose-400/15 to-pink-400/15 rounded-full backdrop-blur-lg border border-white/20 animate-float-delayed"></div>
        <div className="absolute bottom-80 left-40 w-22 h-22 bg-gradient-to-br from-amber-400/15 to-yellow-400/15 rounded-full backdrop-blur-lg border border-white/20 animate-spin-slow"></div>
        <div className="absolute top-1/2 left-20 w-10 h-10 bg-gradient-to-br from-violet-400/15 to-purple-400/15 rounded-full backdrop-blur-lg border border-white/20 animate-float"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-32 right-1/2 w-8 h-8 bg-gradient-to-br from-blue-400/20 to-sky-400/20 rotate-45 backdrop-blur-lg border border-white/30 animate-float-slow"></div>
        <div className="absolute bottom-32 left-1/2 w-6 h-6 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded backdrop-blur-lg border border-white/30 animate-bounce-slow"></div>
      </div>

      {/* Header */}
      <header className="relative z-50">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl border-b border-white/60"></div>
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/30 backdrop-blur-2xl rounded-xl border border-white/50 shadow-2xl">
                <img src={logo} alt="Budgetly Logo" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  budgetly
                </span>
                <div className="text-xs text-blue-600 font-medium">Controle Financeiro Inteligente</div>
              </div>
            </div>
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <a href="#about" className="text-blue-700 hover:text-blue-800 transition-colors duration-200 font-medium">Sobre</a>
              <a href="#features" className="text-blue-700 hover:text-blue-800 transition-colors duration-200 font-medium">Funcionalidades</a>
              <a href="#benefits" className="text-blue-700 hover:text-blue-800 transition-colors duration-200 font-medium">Benefícios</a>
              <a href="#faq" className="text-blue-700 hover:text-blue-800 transition-colors duration-200 font-medium">Perguntas</a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="http://localhost:3000/login"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium backdrop-blur-lg"
              >
                Acessar Sistema
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-2xl border border-white/60 text-sm font-medium text-blue-700 mb-8 shadow-2xl">
              <SparklesIcon className="h-4 w-4 mr-2 text-blue-600" />
              Já são {stats.users.toLocaleString()}+ usuários ativos
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-gray-900 mb-6 leading-tight">
              Seu controle
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent block">
                financeiro inteligente
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-blue-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              A única plataforma que você precisa para organizar suas finanças pessoais e em grupo.
              <span className="font-semibold text-blue-800"> IA avançada, automações inteligentes</span> e
              workspaces colaborativos para uma gestão financeira completa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a
                href="http://localhost:3000/register"
                className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-sky-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 flex items-center backdrop-blur-lg animate-pulse"
              >
                Começar Gratuitamente
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
              </a>
              <a
                href="#features"
                className="text-blue-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/60 transition-all duration-300 backdrop-blur-xl border border-white/40 shadow-xl hover:shadow-2xl hover:scale-105 transform hover:-translate-y-1"
              >
                Ver Demonstração
              </a>
            </div>

            {/* Real-time Stats with enhanced animations */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/50 backdrop-blur-2xl rounded-2xl p-6 text-center hover:scale-105 hover:rotate-1 transition-all duration-300 border border-white/70 shadow-2xl group hover:shadow-3xl animate-float-slow">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors duration-200">{stats.users.toLocaleString()}+</div>
                <div className="text-sm text-blue-700">Usuários Ativos</div>
              </div>
              <div className="bg-white/50 backdrop-blur-2xl rounded-2xl p-6 text-center hover:scale-105 hover:rotate-1 transition-all duration-300 border border-white/70 shadow-2xl group hover:shadow-3xl animate-float-delayed">
                <CurrencyDollarIcon className="h-8 w-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-2xl font-bold text-blue-900 group-hover:text-emerald-700 transition-colors duration-200">{stats.transactions.toLocaleString()}+</div>
                <div className="text-sm text-blue-700">Transações</div>
              </div>
              <div className="bg-white/50 backdrop-blur-2xl rounded-2xl p-6 text-center hover:scale-105 hover:rotate-1 transition-all duration-300 border border-white/70 shadow-2xl group hover:shadow-3xl animate-float">
                <ClockIcon className="h-8 w-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-2xl font-bold text-blue-900 group-hover:text-indigo-700 transition-colors duration-200">{stats.uptime}%</div>
                <div className="text-sm text-blue-700">Uptime</div>
              </div>
              <div className="bg-white/50 backdrop-blur-2xl rounded-2xl p-6 text-center hover:scale-105 hover:rotate-1 transition-all duration-300 border border-white/70 shadow-2xl group hover:shadow-3xl animate-bounce-slow">
                <StarIcon className="h-8 w-8 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-2xl font-bold text-blue-900 group-hover:text-amber-600 transition-colors duration-200">{stats.rating}/5</div>
                <div className="text-sm text-blue-700">Avaliação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 backdrop-blur-2xl border border-blue-200/60 text-sm font-medium text-blue-700 mb-8 shadow-2xl">
              <TrophyIcon className="h-4 w-4 mr-2 text-blue-600" />
              Budgetly para Todos
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Controle Financeiro{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                Pessoal e em Grupo
              </span>
            </h2>
            
            <p className="text-xl text-blue-700 max-w-3xl mx-auto mb-12">
              Por apenas <span className="font-bold text-blue-800">R$ 18/mês</span> você tem acesso completo. 
              <span className="font-semibold"> Cancele quando quiser</span>, sem compromisso.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-8 bg-white/60 backdrop-blur-2xl rounded-full px-8 py-4 border border-white/70 shadow-2xl">
              <div className="flex items-center text-blue-700 font-medium">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Pessoal
              </div>
              <div className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-lg">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Workspaces
              </div>
              <div className="flex items-center text-blue-700 font-medium">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Grupos
              </div>
            </div>
          </div>

          {/* Cards Grid without animations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pessoal Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/70 shadow-2xl">
              <div className="text-center">
                <div className="bg-blue-100/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-lg">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Controle Pessoal</h3>
                <p className="text-blue-700 mb-8 leading-relaxed">
                  Organize suas finanças pessoais com categorização automática, metas e relatórios detalhados para alcançar seus objetivos
                </p>
                <div className="flex items-center justify-center text-blue-600 mb-6">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Ideal para Uso Individual</span>
                </div>
                <button className="flex items-center justify-center mx-auto bg-white/80 backdrop-blur-lg text-blue-700 px-6 py-3 rounded-full font-semibold shadow-lg border border-white/60">
                  <span>Começar Agora</span>
                </button>
              </div>
            </div>

            {/* Workspaces Card - Highlighted */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-8 shadow-3xl transform scale-105">
              <div className="text-center">
                <div className="bg-white/30 backdrop-blur-lg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BanknotesIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Workspaces</h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Crie espaços separados para diferentes propósitos: casa, viagem, projetos. Compartilhe com quem quiser
                </p>
                <div className="flex items-center justify-center text-white mb-6">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Funcionalidade Exclusiva</span>
                </div>
                <button className="flex items-center justify-center mx-auto bg-white/30 backdrop-blur-lg text-white px-6 py-3 rounded-full font-semibold shadow-lg border border-white/40">
                  <span>Explorar</span>
                </button>
              </div>
            </div>

            {/* Grupos Card */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/70 shadow-2xl">
              <div className="text-center">
                <div className="bg-blue-100/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-lg">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Gestão em Grupo</h3>
                <p className="text-blue-700 mb-8 leading-relaxed">
                  Gerencie finanças com amigos, família ou grupos. Compartilhe despesas, divida contas e acompanhe contribuições
                </p>
                <div className="flex items-center justify-center text-blue-600 mb-6">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Perfeito para Grupos</span>
                </div>
                <button className="flex items-center justify-center mx-auto bg-white/80 backdrop-blur-lg text-blue-700 px-6 py-3 rounded-full font-semibold shadow-lg border border-white/60">
                  <span>Saiba Mais</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Integration Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/80 backdrop-blur-2xl border border-blue-200/60 text-sm font-medium text-blue-700 mb-8 shadow-2xl">
                <RocketLaunchIcon className="h-4 w-4 mr-2 text-blue-600" />
                Budgetly Organização Rápida
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Organize Todas as Informações
                Financeiras em{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  Minutos
                </span>
              </h2>

              <p className="text-xl text-blue-700 mb-12 leading-relaxed">
                O Budgetly facilita a organização das suas finanças pessoais e em grupo com
                workspaces inteligentes e categorização automática. Tudo por apenas R$ 18/mês.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="flex items-center bg-white/60 backdrop-blur-2xl rounded-full px-6 py-3 border border-white/70 shadow-2xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">Controle total</span>
                </div>
                <div className="flex items-center bg-white/60 backdrop-blur-2xl rounded-full px-6 py-3 border border-white/70 shadow-2xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <TrophyIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">Metas financeiras</span>
                </div>
                <div className="flex items-center bg-white/60 backdrop-blur-2xl rounded-full px-6 py-3 border border-white/70 shadow-2xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">Workspaces</span>
                </div>
                <div className="flex items-center bg-white/60 backdrop-blur-2xl rounded-full px-6 py-3 border border-white/70 shadow-2xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">100% seguro</span>
                </div>
              </div>
            </div>

            {/* Right Content - Financial Interface Mockup */}
            <div className="relative">
              {/* Main Financial Card */}
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/70 shadow-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="bg-blue-600 p-3 rounded-full mr-4">
                      <BanknotesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900">Controle Financeiro</h3>
                      <p className="text-sm text-blue-600">Budgetly</p>
                    </div>
                  </div>
                </div>

                {/* Amount Display */}
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-blue-900 mb-2">R$ 12.350,00</div>
                  <div className="text-blue-600 font-medium">BRL</div>
                  <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                    +18%
                  </div>
                </div>

                {/* Method Selection */}
                <div className="mb-8">
                  <h4 className="text-blue-900 font-semibold mb-4">Categorias</h4>

                  {/* Category Icons */}
                  <div className="flex items-center justify-between bg-blue-50/80 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-blue-100">
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <div className="bg-white/90 rounded-lg p-3 flex items-center justify-center shadow-lg">
                        <CreditCardIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="bg-white/90 rounded-lg p-3 flex items-center justify-center shadow-lg">
                        <BanknotesIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="bg-white/90 rounded-lg p-3 flex items-center justify-center shadow-lg">
                        <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="bg-white/90 rounded-lg p-3 flex items-center justify-center shadow-lg">
                        <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Card Details Mockup */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 mb-6">
                    <div className="text-lg font-mono mb-4">**** **** **** 3507</div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-blue-200 mb-1">João Santos</div>
                      </div>
                      <div className="text-xs text-blue-200">02/30</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Notification */}
              <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-2xl rounded-2xl p-6 border border-white/70 shadow-2xl">
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3">
                    <SparklesIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-emerald-700 font-semibold">Controle Atualizado</div>
                    <div className="text-sm text-blue-600">Com Sucesso</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Sharing Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-blue-200/50 text-sm font-medium text-blue-700 mb-8 shadow-xl">
              <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-semibold">Budgetly Workspaces Seguros</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Crie e gerencie espaços{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                colaborativos
              </span>
            </h2>

            <p className="text-xl text-blue-700 max-w-4xl mx-auto leading-relaxed">
              O Workspace é seu espaço colaborativo onde você organiza finanças por contexto: suas contas pessoais, o orçamento da viagem, gastos do apartamento compartilhado, mesada dos filhos... Adicione membros para acompanhar ou registrar movimentações, tudo separado e com controle total.
            </p>
            
            <div className="mt-8 text-lg text-blue-600 font-semibold">
              ✓ R$ 18/mês • ✓ Cancele quando quiser • ✓ Workspaces ilimitados
            </div>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Floating User Avatars with enhanced animations */}
            <div className="absolute -top-8 left-16 z-10 animate-float">
              <div className="flex items-center bg-white/70 backdrop-blur-2xl rounded-full px-4 py-3 border border-white/70 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  M
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    +R$ 540,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 right-20 z-10 animate-float-delayed">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  A
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    +R$ 240,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/3 -left-8 z-10 animate-bounce-slow">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  J
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    +R$ 140,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-1/3 -right-8 z-10 animate-float">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  C
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    +R$ 340,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-24 z-10 animate-float-slow">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  L
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                    +R$ 640,00
                  </div>
                </div>
              </div>
            </div>

            {/* Central Workspace Interface */}
            <div className="relative bg-white/50 backdrop-blur-3xl rounded-3xl p-8 border border-white/80 shadow-3xl">
              {/* Header with User Info */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center bg-white/50 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/60 shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    JS
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-blue-900">João Santos</h3>
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span className="text-sm text-blue-600 font-medium">Admin do Workspace</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <ShieldCheckIcon className="h-3 w-3 inline mr-1" />
                    Seguro
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <UserGroupIcon className="h-3 w-3 inline mr-1" />
                    Compartilhado
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    <ClockIcon className="h-3 w-3 inline mr-1" />
                    Tempo Real
                  </div>
                </div>
              </div>

              {/* Main Balance Display */}
              <div className="text-center mb-10">
                <div className="text-sm text-blue-600 font-medium mb-2">Meu Balanço</div>
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  R$ 8.450,00
                </div>
                <div className="text-blue-600 font-medium text-lg">BRL</div>
              </div>

              {/* Income and Expenses */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 backdrop-blur-lg rounded-2xl p-6 border border-emerald-200/50 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-2 rounded-full">
                        <TrophyIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="ml-3 text-emerald-700 font-semibold">Receitas</span>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      +24%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-emerald-800">R$ 2.680,50</div>
                  <div className="text-sm text-emerald-600 font-medium">BRL</div>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-pink-50 backdrop-blur-lg rounded-2xl p-6 border border-rose-200/50 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-2 rounded-full">
                        <BanknotesIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="ml-3 text-rose-700 font-semibold">Gastos</span>
                    </div>
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -8%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-rose-800">R$ 540,00</div>
                  <div className="text-sm text-rose-600 font-medium">BRL</div>
                </div>
              </div>

              {/* Workspace Members */}
              <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-lg rounded-2xl p-6 border border-blue-200/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-blue-900 font-bold text-lg">Membros do Workspace</h4>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    6 Ativos
                  </div>
                </div>

                <div className="flex items-center -space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                    JS
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                    M
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                    J
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                    C
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
                    L
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-slate-200 font-bold text-sm">
                    +3
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  <button className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg text-sm">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Convidar Amigos
                  </button>
                  <button className="flex items-center bg-white/60 backdrop-blur-lg text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-white/80 transition-all duration-200 shadow-lg text-sm border border-white/50">
                    <ShieldCheckIcon className="h-4 w-4 mr-2" />
                    Gerenciar Permissões
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Revolucionando o Controle Financeiro
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Mais que uma ferramenta, uma inteligência artificial dedicada ao seu sucesso financeiro.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-2xl">
                <div className="flex items-center mb-4">
                  <RocketLaunchIcon className="h-8 w-8 text-sky-400 mr-3" />
                  <h3 className="text-2xl font-bold">Nossa Missão</h3>
                </div>
                <p className="text-blue-200 leading-relaxed text-lg">
                  Democratizar o acesso a ferramentas financeiras de alta qualidade,
                  empoderando pessoas e empresas a tomarem decisões mais inteligentes e alcançarem
                  a liberdade financeira através de tecnologia de ponta.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-2xl">
                <div className="flex items-center mb-4">
                  <TrophyIcon className="h-8 w-8 text-amber-400 mr-3" />
                  <h3 className="text-2xl font-bold">Nossa Visão</h3>
                </div>
                <p className="text-blue-200 leading-relaxed text-lg">
                  Ser a plataforma de referência global em inteligência financeira,
                  oferecendo uma experiência única que combina segurança, inovação e
                  simplicidade para transformar a relação das pessoas com o dinheiro.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {systemFeatures.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-2xl">
                  <feature.icon className="h-12 w-12 text-sky-400 mx-auto mb-4" />
                  <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                  <p className="text-blue-300 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 mb-6">
              Funcionalidades que Fazem a Diferença
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Cada recurso foi pensado para resolver problemas reais do seu dia a dia financeiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/50 backdrop-blur-2xl rounded-3xl p-8 border border-white/70 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 relative overflow-hidden"
              >
                {feature.highlight && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {feature.highlight}
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>

                <h3 className="text-xl font-bold text-blue-900 mb-4">{feature.title}</h3>
                <p className="text-blue-700 leading-relaxed">{feature.description}</p>

                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRightIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 mb-6">
              Transforme Sua Vida Financeira
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Resultados reais que nossos usuários experimentam desde o primeiro dia.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-6 bg-white/50 backdrop-blur-2xl rounded-2xl p-8 border border-white/70 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-3 rounded-xl flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-blue-800 font-medium text-lg leading-relaxed">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-blue-700">
              Esclarecemos suas principais dúvidas sobre o Budgetly.
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/50 backdrop-blur-2xl rounded-3xl p-8 border border-white/70 shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-xl flex-shrink-0">
                    <QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">{faq.question}</h3>
                    <p className="text-blue-700 leading-relaxed text-lg">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-sm"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Comece Sua Jornada Hoje
          </h2>
          <p className="text-xl text-blue-200 mb-12 leading-relaxed">
            Junte-se a milhares de usuários que já transformaram sua gestão financeira.
            <span className="font-semibold"> Por apenas R$ 18/mês, cancele quando quiser.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <a
              href="http://localhost:3000/register"
              className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white px-10 py-4 rounded-full font-semibold text-xl hover:from-blue-700 hover:via-indigo-700 hover:to-sky-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center backdrop-blur-lg"
            >
              Começar por R$ 18/mês
              <ArrowRightIcon className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <a
              href="http://localhost:3000/login"
              className="text-blue-200 px-10 py-4 rounded-full font-semibold text-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-xl border border-white/30 shadow-xl"
            >
              Já Tenho Conta
            </a>
          </div>

          <div className="text-sm text-blue-300">
            ✓ R$ 18/mês • ✓ Cancele quando quiser • ✓ Suporte 24/7
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-700 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-sky-400/20 rounded-full backdrop-blur-lg animate-float-slow"></div>
          <div className="absolute bottom-20 right-16 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full backdrop-blur-lg animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-sky-400/15 to-cyan-400/15 rounded-full backdrop-blur-lg animate-bounce-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-gradient-to-br from-purple-400/15 to-indigo-400/15 rounded-full backdrop-blur-lg animate-float"></div>
        </div>

        {/* Main CTA Section */}
        <div className="relative py-20 text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Comece a Controlar Suas Finanças
              <br />
              <span className="bg-gradient-to-r from-sky-200 to-blue-200 bg-clip-text text-transparent">
                em Apenas 4 Minutos
              </span>
            </h2>
            
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              O Budgetly tem paixão por simplificar o controle financeiro.
              Oferecemos soluções completas para todas as suas necessidades de gestão financeira.
            </p>

            {/* Email Signup Form */}
            <div className="max-w-md mx-auto">
              <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-2 border border-white/20 shadow-2xl">
                <div className="flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu endereço de email"
                    className="flex-1 bg-transparent text-white placeholder-blue-200 px-6 py-3 rounded-full focus:outline-none text-lg"
                  />
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center">
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Começar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links Section */}
        <div className="relative bg-black/20 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg">
                    <img src={logo} alt="Budgetly Logo" className="h-10 w-10 object-contain" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Budgetly
                    </span>
                  </div>
                </div>
                <p className="text-blue-200 leading-relaxed mb-6">
                  O Budgetly tem paixão por simplificar o controle financeiro. 
                  Oferecemos soluções completas para todas as suas necessidades de negócio financeiro.
                </p>
                <div className="text-blue-300 text-sm">
                  © Todos os Direitos Reservados
                </div>
              </div>

              {/* Home Links */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6">Home</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#about" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center group">
                      Sobre
                      <ArrowRightIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center group">
                      Benefícios
                      <ArrowRightIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center group">
                      Contato
                      <ArrowRightIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center group">
                      Depoimentos
                      <ArrowRightIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6">Company</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center group">
                      Carreira
                      <ArrowRightIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center group">
                      Blog
                      <ArrowRightIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center group">
                      Central de Suporte
                      <ArrowRightIcon className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6">Social Media</h3>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="bg-white/10 backdrop-blur-lg p-3 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg group"
                  >
                    <svg className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.965 1.404-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="bg-white/10 backdrop-blur-lg p-3 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg group"
                  >
                    <svg className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="bg-white/10 backdrop-blur-lg p-3 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg group"
                  >
                    <svg className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a 
                    href="#" 
                    className="bg-white/10 backdrop-blur-lg p-3 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg group"
                  >
                    <svg className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed right-6 bottom-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 backdrop-blur-xl border border-white/20 ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
        style={{ transition: 'transform 0.3s ease, opacity 0.3s ease' }}
        aria-label="Voltar ao topo"
      >
        <ChevronUpIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Landing;