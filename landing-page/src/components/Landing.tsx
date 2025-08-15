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
  GlobeAltIcon
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
      answer: 'Oferecemos uma versão gratuita com funcionalidades essenciais e planos premium a partir de R$ 19,90/mês com recursos avançados de IA e relatórios ilimitados.'
    },
    {
      question: 'Posso usar em equipe ou família?',
      answer: 'Absolutamente! Os Workspaces permitem compartilhar finanças com controle granular de permissões, ideal para casais, famílias ou pequenas empresas.'
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-sky-400/20 to-blue-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-sky-400/20 rounded-full backdrop-blur-lg border border-white/30 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full backdrop-blur-lg border border-white/30 animate-float-delayed"></div>
      </div>

      {/* Header */}
      <header className="relative z-50">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl border-b border-white/40"></div>
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30 shadow-lg">
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
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/50 backdrop-blur-xl border border-white/40 text-sm font-medium text-blue-700 mb-8 shadow-xl">
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
              A única plataforma que você precisa para dominar suas finanças.
              <span className="font-semibold text-blue-800"> IA avançada, automações inteligentes</span> e
              insights que transformam dados em decisões inteligentes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a
                href="http://localhost:3000/register"
                className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:via-indigo-700 hover:to-sky-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center backdrop-blur-lg"
              >
                Começar Gratuitamente
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href="#features"
                className="text-blue-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/60 transition-all duration-200 backdrop-blur-xl border border-white/40 shadow-xl"
              >
                Ver Demonstração
              </a>
            </div>

            {/* Real-time Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 border border-white/50 shadow-2xl">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats.users.toLocaleString()}+</div>
                <div className="text-sm text-blue-700">Usuários Ativos</div>
              </div>
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 border border-white/50 shadow-2xl">
                <CurrencyDollarIcon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats.transactions.toLocaleString()}+</div>
                <div className="text-sm text-blue-700">Transações</div>
              </div>
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 border border-white/50 shadow-2xl">
                <ClockIcon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats.uptime}%</div>
                <div className="text-sm text-blue-700">Uptime</div>
              </div>
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300 border border-white/50 shadow-2xl">
                <StarIcon className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats.rating}/5</div>
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
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/60 backdrop-blur-xl border border-blue-200/40 text-sm font-medium text-blue-700 mb-8 shadow-xl">
              <TrophyIcon className="h-4 w-4 mr-2 text-blue-600" />
              Budgetly Fácil de Usar
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Obtenha a Mais Poderosa e{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                Fácil de Usar
              </span>{' '}
              Plataforma Financeira
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-8 bg-white/40 backdrop-blur-xl rounded-full px-8 py-4 border border-white/50 shadow-2xl">
              <div className="flex items-center text-blue-700 font-medium">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Pessoas
              </div>
              <div className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-lg">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Freelancers
              </div>
              <div className="flex items-center text-blue-700 font-medium">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Empresas
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pessoas Card */}
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserGroupIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Pessoas</h3>
                <p className="text-blue-700 mb-8 leading-relaxed">
                  Crie e compartilhe orçamentos profissionais para sua vida pessoal. Envie lembretes para metas financeiras facilmente
                </p>
                <div className="flex items-center justify-center text-blue-600 mb-6">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">15k+ Usuários pelo Brasil</span>
                </div>
                <button className="flex items-center justify-center mx-auto bg-white/60 backdrop-blur-lg text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-white/80 transition-all duration-200 shadow-lg">
                  <span>Saiba Mais</span>
                </button>
              </div>
            </div>

            {/* Freelancers Card - Highlighted */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl p-8 shadow-3xl transform scale-105 hover:scale-110 transition-all duration-300">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-lg w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BanknotesIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Freelancers</h3>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Comece a coletar pagamentos de clientes em todo o mundo. Crie um negócio e comece a vender online rapidamente
                </p>
                <div className="flex items-center justify-center text-white mb-6">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">8k+ Usuários pelo Brasil</span>
                </div>
                <button className="flex items-center justify-center mx-auto bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-200 shadow-lg border border-white/30">
                  <span>Saiba Mais</span>
                </button>
              </div>
            </div>

            {/* Empresas Card */}
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChartBarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Empresas</h3>
                <p className="text-blue-700 mb-8 leading-relaxed">
                  Crie e compartilhe relatórios profissionais para seus clientes. Envie lembretes para pagamentos recorrentes facilmente
                </p>
                <div className="flex items-center justify-center text-blue-600 mb-6">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">3k+ Empresas pelo Brasil</span>
                </div>
                <button className="flex items-center justify-center mx-auto bg-white/60 backdrop-blur-lg text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-white/80 transition-all duration-200 shadow-lg">
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100/60 backdrop-blur-xl border border-blue-200/40 text-sm font-medium text-blue-700 mb-8 shadow-xl">
                <RocketLaunchIcon className="h-4 w-4 mr-2 text-blue-600" />
                Budgetly Velocidade de Controle
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Colete Todas as Informações
                Financeiras em{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  Minutos
                </span>
              </h2>

              <p className="text-xl text-blue-700 mb-12 leading-relaxed">
                Integre o Budgetly facilmente em seu site ou aplicativo com nossas APIs
                amigáveis para desenvolvedores e plugins. Deixe seus usuários controlarem
                suas finanças da forma que quiserem.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="flex items-center bg-white/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/50 shadow-xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">Otimize controles</span>
                </div>
                <div className="flex items-center bg-white/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/50 shadow-xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <TrophyIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">Aumente seu patrimônio</span>
                </div>
                <div className="flex items-center bg-white/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/50 shadow-xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">Trabalhe em movimento</span>
                </div>
                <div className="flex items-center bg-white/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/50 shadow-xl">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-800 font-medium">Segurança em primeiro lugar</span>
                </div>
              </div>
            </div>

            {/* Right Content - Payment Interface Mockup */}
            <div className="relative">
              {/* Main Payment Card */}
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-3xl">
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
                  <h4 className="text-blue-900 font-semibold mb-4">Método de Controle</h4>

                  {/* Payment Method Icons */}
                  <div className="flex items-center justify-between bg-blue-50/60 backdrop-blur-lg rounded-2xl p-4 mb-4">
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <div className="bg-white/80 rounded-lg p-3 flex items-center justify-center">
                        <CreditCardIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 flex items-center justify-center">
                        <BanknotesIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 flex items-center justify-center">
                        <ChartBarIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="bg-white/80 rounded-lg p-3 flex items-center justify-center">
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
              <div className="absolute -bottom-4 -right-4 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-2xl">
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
                compartilhados
              </span>
            </h2>

            <p className="text-xl text-blue-700 max-w-4xl mx-auto leading-relaxed">
              O Workspace é um espaço colaborativo onde você pode criar ambientes separados para cada projeto ou objetivo: suas contas pessoais, o grupo da igreja, o time de futebol… Você pode adicione outros membros para acompanhar ou registrar movimentações, tudo organizado e com relatórios claros.            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Floating User Avatars */}
            <div className="absolute -top-8 left-16 z-10">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    +R$ 540,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 right-20 z-10">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    +R$ 240,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/3 -left-8 z-10">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  J
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    +R$ 140,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-1/3 -right-8 z-10">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  C
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    +R$ 340,00
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-24 z-10">
              <div className="flex items-center bg-white/60 backdrop-blur-xl rounded-full px-4 py-3 border border-white/50 shadow-2xl">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  L
                </div>
                <div className="ml-3">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    +R$ 640,00
                  </div>
                </div>
              </div>
            </div>

            {/* Central Workspace Interface */}
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-3xl">
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
                className="group bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 relative overflow-hidden"
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
                className="flex items-start space-x-6 bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
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
                className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300"
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
            Junte-se a milhares de usuários que já transformaram sua relação com o dinheiro.
            <span className="font-semibold"> Primeiros 30 dias gratuitos.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <a
              href="http://localhost:3000/register"
              className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white px-10 py-4 rounded-full font-semibold text-xl hover:from-blue-700 hover:via-indigo-700 hover:to-sky-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center backdrop-blur-lg"
            >
              Criar Conta Gratuita
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
            ✓ Sem compromisso • ✓ Cancele quando quiser • ✓ Suporte 24/7
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-1 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
                <img src={logo} alt="Budgetly Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Budgetly
                </span>
                <div className="text-xs text-blue-300">Controle Financeiro Inteligente</div>
              </div>
            </div>
            <div className="text-blue-300 text-center md:text-right">
              <div>© 2024 Budgetly. Todos os direitos reservados.</div>
              <div className="text-sm mt-1">Feito com ❤️ para transformar sua vida financeira</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;