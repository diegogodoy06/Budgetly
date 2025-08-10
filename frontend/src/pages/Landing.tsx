import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BanknotesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const Landing: React.FC = () => {
  const features = [
    {
      icon: CreditCardIcon,
      title: 'Controle total de cartões de crédito',
      description: 'Veja faturas, limites, datas de vencimento e histórico de compras em um só lugar.'
    },
    {
      icon: ChartBarIcon,
      title: 'Integração com Open Finance (em breve)',
      description: 'Conecte contas bancárias e receba atualizações automáticas.'
    },
    {
      icon: BanknotesIcon,
      title: 'Gestão de finanças pessoais e em grupo',
      description: 'Ideal para organizar sua vida financeira ou administrar fundos coletivos.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Automações',
      description: 'O sistema aprende com você e classifica automaticamente suas transações.'
    },

  ];

  const benefits = [
    'Saiba exatamente para onde seu dinheiro está indo',
    'Automação para que você gaste menos tempo organizando',
    'Gráficos e dashboards simples e objetivos',
    'Alcance suas metas financeiras mais rapidamente',
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
      answer: 'Sim. Cobramos um valor fixo e acessível, destinado a cobrir os custos de infraestrutura, sem pegadinhas.'
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
            <div className="hidden md:flex md:items-center md:space-x-8">
              <Link
                to="/about" className="text-gray-700 hover:text-primary-600 transition-colors duration-200">Sobre</Link>
              <Link
                to="/about" className="text-gray-700 hover:text-primary-600 transition-colors duration-200">Funcionalidades</Link>
              <Link
                to="/about" className="text-gray-700 hover:text-primary-600 transition-colors duration-200">Benefícios</Link>
              <Link
                to="/about" className="text-gray-700 hover:text-primary-600 transition-colors duration-200">Perguntas</Link>s
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-primary-600 text-white px-6 py-2 rounded-full hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              O seu controle
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent block">
                financeiro pessoal
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Uma aplicação moderna, com automações inteligentes, pensada especialmente para o dia a dia dos brasileiros. Tome decisões inteligentes e alcance seus objetivos financeiros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-primary-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center"
              >
                Demonstração
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
                  Democratizar o acesso a ferramentas de qualidade,
                  ajudando pessoas a tomarem decisões mais inteligentes com seu dinheiro.
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Nossa Visão</h3>
              <p className="text-gray-300 leading-relaxed">
                Ser a plataforma de referência em controle financeiro, oferecendo
                uma experiência única, segura e eficiente para nossos usuários.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              O que torna o Budgetly único?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra como o Budgetly pode transformar a forma como você gerencia suas finanças.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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
              Mais que controle, liberdade financeira.
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