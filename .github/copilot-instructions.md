# Copilot Instructions - Budgetly

## 📋 Visão Geral do Projeto

**Budgetly** é um sistema completo de controle financeiro pessoal com arquitetura full-stack:
- **Backend**: Django REST Framework (Python)
- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Banco de Dados**: PostgreSQL (SQLite para desenvolvimento)
- **Infraestrutura**: Docker + Docker Compose

## 🎯 Funcionalidades Principais

- Gestão de contas financeiras (corrente, poupança, carteira, cartão de crédito)
- Transações com suporte a parcelamento e recorrência
- Controle de cartões de crédito com limites e faturas
- Sistema de categorias e centros de custo globais
- Orçamento mensal com metas e acompanhamento
- Dashboard e relatórios analíticos
- Importação de extratos via CSV
- Sistema multiusuário com autenticação JWT

## 🏗️ Arquitetura Frontend

### Estrutura de Diretórios
```
frontend/src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com sidebar
│   └── AuthLayout.tsx  # Layout para autenticação
├── contexts/           # Contextos React
│   ├── AuthContext.tsx # Autenticação global
│   └── ConfiguracoesContext.tsx # Configurações globais
├── pages/              # Páginas da aplicação
├── services/           # Serviços API
├── types/              # Definições TypeScript
└── utils/              # Utilitários
```

### Stack Tecnológico Frontend
- **React 18** com TypeScript
- **React Router DOM** para roteamento
- **Context API** para estado global
- **TailwindCSS** para estilização
- **Heroicons** para ícones
- **React Hook Form** para formulários
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações
- **Recharts** para gráficos

### Padrões de Design
- **Design System**: Paleta de cores customizada (primary, success, warning, danger)
- **Responsividade**: Mobile-first approach
- **Acessibilidade**: Uso do Headless UI para componentes acessíveis

## 🔧 Convenções de Código Frontend

### Componentes React
- Usar **Function Components** com hooks
- Exportar componentes como `export default`
- Props tipadas com TypeScript interfaces
- Componentes em PascalCase (ex: `UserProfile.tsx`)

### Estrutura de Arquivos
- Um componente principal por arquivo
- Interfaces TypeScript no mesmo arquivo ou em `types/`
- Hooks customizados prefixados com `use`

### Estilização
- **TailwindCSS** como sistema principal
- Classes utilitárias responsivas (`sm:`, `md:`, `lg:`)
- Cores do design system (`bg-primary-600`, `text-success-500`)
- Estados interativos (`hover:`, `focus:`, `active:`)

### Estado Global
- **Context API** para dados compartilhados
- Contextos específicos por domínio (Auth, Configurações)
- Hooks personalizados para consumir contextos

## 🌐 Arquitetura Backend

### Estrutura Django
```
backend/
├── budgetly/           # Configurações do projeto
├── apps/              # Aplicações Django
│   ├── accounts/      # Gestão de contas
│   ├── transactions/  # Transações
│   ├── categories/    # Categorias e tags
│   ├── budgets/      # Orçamentos
│   └── reports/      # Relatórios
└── requirements.txt
```

### APIs e Endpoints
- **Django REST Framework** para APIs
- **drf-spectacular** para documentação OpenAPI
- **CORS** configurado para desenvolvimento
- **JWT** para autenticação
- **Filtros** e paginação implementados

## 🎨 Sistema de Design

### Paleta de Cores
```css
Primary: #2563eb (blue-600)
Success: #22c55e (green-500)
Warning: #f59e0b (amber-500)
Danger: #ef4444 (red-500)
```

### Tipografia
- **Fonte**: Inter (sistema sans-serif)
- **Tamanhos**: text-sm, text-base, text-lg, text-xl, text-2xl

### Layout
- **Sidebar**: Navegação principal fixa
- **Container**: max-width com padding responsivo
- **Cards**: bg-white com shadow e border-radius
- **Forms**: Campos com focus states e validação

## 🔄 Funcionalidades Específicas

### Sistema de Configurações Globais
**Contexto**: `ConfiguracoesContext.tsx`
- **Categorias**: Nome, ativo/inativo, consideração no dashboard, níveis de importância (essencial/necessário/supérfluo)
- **Centros de Custo**: Nome, ativo/inativo
- **CRUD**: Operações completas via Context API
- **Integração**: Dados consumidos em formulários de transações

### Navegação
**Componente**: `Layout.tsx`
- Menu lateral com ícones do Heroicons
- Item "Configurações" (CogIcon) substituiu "Perfil"
- Roteamento via React Router
- Estados ativos visuais

### Autenticação
**Contexto**: `AuthContext.tsx`
- Login/logout com JWT
- Rotas protegidas
- Estados de carregamento

## 📝 Diretrizes para Desenvolvimento

### Ao Criar Novos Componentes
1. Usar TypeScript com interfaces bem definidas
2. Implementar estados de carregamento e erro
3. Seguir padrões de acessibilidade
4. Usar classes TailwindCSS do design system
5. Documentar props complexas

### Ao Trabalhar com APIs
1. Centralizar chamadas em `services/`
2. Implementar tratamento de erros consistente
3. Usar toast notifications para feedback
4. Considerar estados de loading

### Ao Criar Páginas
1. Seguir layout padrão com `Layout.tsx`
2. Implementar breadcrumbs quando necessário
3. Usar títulos semânticos (h1, h2, h3)
4. Considerar responsividade mobile

### Ao Modificar Contextos
1. Manter tipagem TypeScript rigorosa
2. Implementar providers no nível adequado
3. Criar hooks customizados para consumo
4. Considerar performance com useMemo/useCallback

## 🚀 Comandos Úteis

### Frontend (Vite)
```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build
```

### Backend (Django)
```bash
python manage.py runserver     # Servidor desenvolvimento
python manage.py migrate      # Migrações
python manage.py collectstatic # Arquivos estáticos
```

### Docker
```bash
docker-compose up --build     # Build e execução
docker-compose down           # Parar containers
```

## 🔍 Debugging e Troubleshooting

### Problemas Comuns Frontend
- **Import errors**: Verificar paths com `@/` alias
- **Context undefined**: Verificar se Provider está no nível correto
- **Styles não aplicados**: Verificar classes TailwindCSS
- **Routing issues**: Verificar estrutura de Routes

### Ferramentas de Debug
- React DevTools para componentes
- Redux DevTools para contextos
- Chrome DevTools para performance
- TypeScript para erros de tipo

## 📚 Recursos Adicionais

- **Documentação React**: https://react.dev/
- **TailwindCSS**: https://tailwindcss.com/
- **Django REST**: https://www.django-rest-framework.org/
- **TypeScript**: https://www.typescriptlang.org/

---

**Nota**: Esta documentação deve ser atualizada conforme o projeto evolui. Mantenha-a sincronizada com mudanças arquiteturais significativas.
