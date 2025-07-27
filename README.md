# Budgetly - Sistema de Controle Financeiro Pessoal

Sistema completo de controle financeiro pessoal desenvolvido com Django REST Framework no backend e React no frontend.

## 🚀 Funcionalidades

- **Gestão de Contas**: Conta corrente, poupança, carteira, cartão de crédito
- **Transações**: Entradas, saídas e transferências com suporte a parcelamento e recorrência
- **Cartões de Crédito**: Controle de limite, faturas e vencimentos
- **Categorias e Tags**: Organização personalizada das transações
- **Orçamento Mensal**: Definição de metas e acompanhamento de gastos
- **Dashboard e Relatórios**: Gráficos e análises detalhadas
- **Importação de Extratos**: Upload de arquivos CSV
- **Sistema Multiusuário**: Cada usuário com seus próprios dados

## 🛠️ Tecnologias

- **Backend**: Django + Django REST Framework
- **Frontend**: React + TailwindCSS
- **Banco de Dados**: PostgreSQL
- **Containerização**: Docker

## 📋 Pré-requisitos

- Docker e Docker Compose
- Git

## 🚀 Instalação e Execução

1. Clone o repositório:
```bash
git clone https://github.com/diegogodoy06/Budgetly.git
cd Budgetly
```

2. Execute com Docker:
```bash
docker-compose up --build
```

3. Acesse a aplicação:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

## 📁 Estrutura do Projeto

```
Budgetly/
├── backend/                    # Django REST API
│   ├── budgetly/              # Configurações do projeto
│   ├── apps/                  # Aplicações Django
│   │   ├── accounts/          # Gestão de contas
│   │   ├── transactions/      # Transações
│   │   ├── categories/        # Categorias e tags
│   │   ├── budgets/          # Orçamentos
│   │   └── reports/          # Relatórios
│   └── requirements.txt
├── frontend/                  # React Application
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Serviços API
│   │   └── utils/            # Utilitários
│   └── package.json
└── docker-compose.yml
```

## 🔐 Usuário Padrão

- **Email**: admin@budgetly.com
- **Senha**: admin123

## 📖 API Documentation

A documentação da API estará disponível em: http://localhost:8000/api/docs/

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
