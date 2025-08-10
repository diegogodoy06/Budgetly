import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CreditCardIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  BanknotesIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const Landing: React.FC = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Controle Financeiro Completo',
      description: 'Gerencie suas receitas, despesas e investimentos em uma plataforma unificada.'
    },
    {
      icon: CreditCardIcon,
      title: 'Gestão de Cartões',
      description: 'Controle limites, faturas e gastos de todos os seus cartões de crédito.'
    },
    {
      icon: BanknotesIcon,
      title: 'Múltiplas Contas',
      description: 'Organize suas finanças com contas bancárias, poupanças e investimentos.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Segurança Avançada',
      description: 'Seus dados protegidos com criptografia de ponta e backup automático.'
    },
    {
      icon: ClockIcon,
      title: 'Relatórios em Tempo Real',
      description: 'Acompanhe seus gastos e ganhos com relatórios detalhados e atualizados.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Acesso Multiplataforma',
      description: 'Use em qualquer dispositivo - web, mobile ou tablet.'
    }
  ];

  const benefits = [
    'Organize suas finanças de forma simples e intuitiva',
    'Tome decisões financeiras mais inteligentes',
    'Economize tempo com automação de tarefas',
    'Visualize onde seu dinheiro está sendo gasto',
    'Alcance suas metas financeiras mais rapidamente',
    'Tenha controle total sobre seu orçamento'
  ];

  const faqs = [
    {
      question: 'Como funciona o Budgetly?',
      answer: 'O Budgetly é uma plataforma completa de gestão financeira que permite controlar receitas, despesas, cartões de crédito e investimentos em um só lugar.'
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Sim! Utilizamos criptografia de ponta e as melhores práticas de segurança para proteger todas as suas informações financeiras.'
    },
    {
      question: 'Posso usar em vários dispositivos?',
      answer: 'Absolutamente! O Budgetly funciona perfeitamente em computadores, tablets e smartphones.'
    },
    {
      question: 'Preciso pagar para usar?',
      answer: 'Oferecemos um plano gratuito com funcionalidades essenciais e planos pagos para recursos avançados.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-white/20 backdrop-blur-md border-b border-white/20"></div>
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Budgetly</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="bg-white/40 backdrop-blur-lg rounded-full px-6 py-2 border border-white/20 shadow-lg">
                <span className="text-primary-600 font-medium">✨ Controle Financeiro Inteligente</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Suas Finanças Sob
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent block">
                Controle Total
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Organize, monitore e otimize suas finanças com a plataforma mais completa 
              e intuitiva do mercado. Tome decisões inteligentes e alcance seus objetivos financeiros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center"
              >
                Começar Gratuitamente
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/50 transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full backdrop-blur-sm border border-white/20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full backdrop-blur-sm border border-white/20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full backdrop-blur-sm border border-white/20 animate-pulse delay-2000"></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Sobre o Budgetly
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Criamos uma solução completa para quem busca ter controle total sobre suas finanças pessoais e empresariais.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
                <p className="text-gray-300 leading-relaxed">
                  Democratizar o acesso a ferramentas de gestão financeira de qualidade, 
                  ajudando pessoas e empresas a tomarem decisões mais inteligentes com seu dinheiro.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold mb-4">Nossa Visão</h3>
                <p className="text-gray-300 leading-relaxed">
                  Ser a plataforma de referência em controle financeiro, oferecendo 
                  uma experiência única, segura e eficiente para nossos usuários.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-primary-400">10k+</div>
                    <div className="text-gray-300">Usuários Ativos</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-purple-400">50M+</div>
                    <div className="text-gray-300">Transações</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-400">99.9%</div>
                    <div className="text-gray-300">Uptime</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-yellow-400">4.9</div>
                    <div className="text-gray-300">Avaliação</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como o Budgetly pode transformar a forma como você gerencia suas finanças.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/60 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors duration-300">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-r from-primary-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Benefícios do Budgetly
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como nossa plataforma pode melhorar sua vida financeira.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-white/30 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre o Budgetly.
            </p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <QuestionMarkCircleIcon className="h-6 w-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Pronto para Transformar suas Finanças?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Junte-se a milhares de usuários que já estão no controle de suas finanças.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="group bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center"
            >
              Começar Agora
              <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              to="/login"
              className="text-gray-300 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <SparklesIcon className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">Budgetly</span>
            </div>
            <div className="text-gray-400">
              © 2024 Budgetly. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;