# 📋 Budgetly - Plano de Desenvolvimento Completo

## 🎯 Visão Geral do Projeto
Sistema completo de controle financeiro pessoal com funcionalidades avançadas de importação, categorização automática e relatórios detalhados.

---

## 🏆 ÉPICOS PRINCIPAIS

### 🔗 ÉPICO 1: Integração Frontend-Backend
**Objetivo:** Conectar completamente o frontend React com as APIs Django

### 📊 ÉPICO 2: Sistema de Favorecidos/Destinatários  
**Objetivo:** Cadastro e identificação automática de favorecidos para transações

### 📈 ÉPICO 3: Importação e Processamento de Extratos
**Objetivo:** Sistema robusto de importação de CSV bancário com identificação automática

### 🔧 ÉPICO 4: Robustez e Otimização
**Objetivo:** Melhorar performance, segurança e remover código desnecessário

---

## 📋 BACKLOG DETALHADO

### 🔥 ALTA PRIORIDADE (Sprint 1-2)

#### 🔗 Integração Frontend-Backend
- [x] **FB-001** - Configurar autenticação JWT no frontend ✅
  - Implementar login/logout com tokens
  - Armazenar tokens no localStorage/sessionStorage
  - Interceptors Axios para requests autenticados
  - **Estimativa:** 5 pontos | **Assignee:** @frontend-dev

- [x] **FB-002** - Integrar página de contas com API ✅
  - Consumir endpoints de contas (`/api/accounts/`)
  - CRUD completo de contas no frontend
  - Validações e tratamento de erros
  - **Estimativa:** 8 pontos | **Assignee:** @frontend-dev

- [x] **FB-003** - Integrar cartões de crédito com API ✅
  - Consumir endpoints de cartões (`/api/credit-cards/`)
  - CRUD completo de cartões no frontend
  - Gestão de limites e faturas
  - Interface para bandeiras e vencimentos
  - **Estimativa:** 8 pontos | **Assignee:** @frontend-dev

- [x] **FB-004** - Integrar transações com API ✅
  - Listar transações com filtros e paginação
  - Formulário de criação/edição de transações
  - Suporte a parcelamento no frontend
  - Associação com contas e cartões
  - **Estimativa:** 13 pontos | **Assignee:** @frontend-dev

- [x] **FB-005** - Implementar sistema de categorias hierárquicas ✅
  - Refatorar modelo Category para suportar subcategorias
  - Migração de dados existentes
  - CRUD de categorias e subcategorias no frontend
  - Atualizar todas as referências nas transações
  - Interface hierárquica com dropdown aninhado
  - **Estimativa:** 13 pontos | **Assignee:** @fullstack-dev

#### 🗂️ Sistema de Categorias Hierárquicas (Detalhado)

- [x] **CAT-001** - Refatoração do modelo Category (Backend) ✅
  - Adicionar campo `parent` (ForeignKey self-referencial)
  - Manter compatibilidade com dados existentes
  - Métodos para árvore de categorias (get_children, get_ancestors)
  - Validação para evitar loops infinitos
  - **Estimativa:** 5 pontos | **Assignee:** @backend-dev

- [x] **CAT-002** - Migração de dados existentes ✅
  - Script para converter categorias atuais em principais
  - Criação de subcategorias pré-definidas por categoria
  - Backup de dados antes da migração
  - **Estimativa:** 3 pontos | **Assignee:** @backend-dev

- [x] **CAT-003** - API para categorias hierárquicas ✅
  - Endpoint para listar categorias em árvore
  - Serializer aninhado para parent/children
  - Filtros por nível (principais, subcategorias)
  - **Estimativa:** 3 pontos | **Assignee:** @backend-dev

- [x] **CAT-004** - Interface de gestão de categorias (Frontend) ✅
  - Página para CRUD de categorias principais
  - Interface para CRUD de subcategorias
  - Drag & drop para reorganizar hierarquia
  - **Estimativa:** 8 pontos | **Assignee:** @frontend-dev

- [x] **CAT-005** - Seletor hierárquico em transações ✅
  - Dropdown aninhado categoria > subcategoria
  - Busca por nome em categorias e subcategorias
  - Exibição hierárquica na listagem de transações
  - **Estimativa:** 5 pontos | **Assignee:** @frontend-dev

#### 🏷️ Exemplos de Categorias Pré-definidas
```
📍 Alimentação
  ├── 🥖 Padaria
  ├── ☕ Cafeteria
  ├── 🚚 Delivery
  ├── 🍽️ Restaurante
  └── 🛒 Supermercado

💻 Assinaturas
  ├── 🎮 Jogos
  ├── 📺 Streaming
  ├── 📱 Aplicativos
  └── ☁️ Cloud/Software

🚗 Transporte
  ├── ⛽ Combustível
  ├── 🚌 Transporte Público
  ├── 🚗 Uber/Taxi
  └── 🛠️ Manutenção

📱 Telefonia
  ├── 📞 Celular
  ├── 🌐 Internet
  └── 📺 TV a Cabo
```

#### 🛠️ APIs Essenciais Backend
- [ ] **BE-001** - Implementar ViewSets completos para todas as entidades
  - AccountViewSet com filtros e serializers
  - TransactionViewSet com filtros complexos
  - CategoryViewSet e CostCenterViewSet
  - **Estimativa:** 8 pontos | **Assignee:** @backend-dev

- [ ] **BE-002** - Sistema de autenticação JWT
  - Endpoints de login/logout/refresh token
  - Middleware de autenticação
  - Permissions customizadas
  - **Estimativa:** 5 pontos | **Assignee:** @backend-dev

### 🔧 MÉDIA PRIORIDADE (Sprint 3-4)

#### 👥 Sistema de Favorecidos
- [ ] **FAV-001** - Criar modelo Favorecido
  - Modelo com nome, documento, banco, agência, conta
  - Relacionamento com User
  - Métodos de busca e matching
  - **Estimativa:** 5 pontos | **Assignee:** @backend-dev

- [ ] **FAV-002** - CRUD de Favorecidos no Backend
  - ViewSet completo para favorecidos
  - Serializers com validações
  - Filtros por nome, documento, banco
  - **Estimativa:** 8 pontos | **Assignee:** @backend-dev

- [ ] **FAV-003** - Interface de Favorecidos no Frontend
  - Página de listagem e cadastro
  - Formulário com validação de CPF/CNPJ
  - Busca e filtros
  - **Estimativa:** 8 pontos | **Assignee:** @frontend-dev

- [ ] **FAV-004** - Identificação automática em transações
  - Algoritmo de matching por nome/documento
  - Sugestões na criação de transações
  - Auto-complete de favorecidos
  - **Estimativa:** 13 pontos | **Assignee:** @backend-dev

#### 📊 Dashboard e Relatórios
- [ ] **DASH-001** - Dashboard funcional no frontend
  - Gráficos com dados reais da API
  - Cards de resumo financeiro
  - Filtros por período funcionais
  - **Estimativa:** 13 pontos | **Assignee:** @frontend-dev

- [ ] **REP-001** - Sistema de relatórios backend
  - Endpoints para dados agregados
  - Relatórios por categoria, período, conta
  - Cache para relatórios pesados
  - **Estimativa:** 8 pontos | **Assignee:** @backend-dev

### 📈 BAIXA PRIORIDADE (Sprint 5-6)

#### 📄 Sistema de Importação CSV
- [ ] **CSV-001** - Parser de CSV bancário genérico
  - Detecção automática de formato
  - Mapeamento de colunas flexível
  - Validação de dados
  - **Estimativa:** 13 pontos | **Assignee:** @backend-dev

- [ ] **CSV-002** - Interface de importação
  - Upload de arquivo CSV
  - Preview dos dados antes da importação
  - Mapeamento manual de colunas
  - **Estimativa:** 8 pontos | **Assignee:** @frontend-dev

- [ ] **CSV-003** - Processamento avançado
  - Identificação automática de favorecidos
  - Sugestão de categorias baseada em histórico
  - Detecção de duplicatas
  - **Estimativa:** 21 pontos | **Assignee:** @backend-dev

#### 🎨 Melhorias de UX/UI
- [ ] **UX-001** - Responsividade mobile completa
  - Layouts otimizados para mobile
  - Touch gestures para navegação
  - PWA básico
  - **Estimativa:** 13 pontos | **Assignee:** @frontend-dev

- [ ] **UX-002** - Feedback visual avançado
  - Loading states em todas as operações
  - Animações de transição
  - Notificações toast aprimoradas
  - **Estimativa:** 8 pontos | **Assignee:** @frontend-dev

### 🔧 ROBUSTEZ E OTIMIZAÇÃO (Sprint 7-8)

#### 🛡️ Segurança
- [ ] **SEC-001** - Auditoria de segurança
  - Rate limiting nas APIs
  - Validação rigorosa de inputs
  - Sanitização de dados
  - **Estimativa:** 8 pontos | **Assignee:** @backend-dev

- [ ] **SEC-002** - Logs e monitoramento
  - Sistema de logs estruturado
  - Monitoramento de performance
  - Alertas de erro
  - **Estimativa:** 5 pontos | **Assignee:** @backend-dev

#### ⚡ Performance
- [ ] **PERF-001** - Otimização de queries
  - Análise de queries N+1
  - Implementar select_related/prefetch_related
  - Índices no banco de dados
  - **Estimativa:** 8 pontos | **Assignee:** @backend-dev

- [ ] **PERF-002** - Cache estratégico
  - Cache de dados agregados
  - Cache de relatórios
  - Cache de resultados de busca
  - **Estimativa:** 5 pontos | **Assignee:** @backend-dev

#### 🧹 Limpeza de Código
- [ ] **CLEAN-001** - Remover código não utilizado
  - Análise de dead code no frontend
  - Remoção de dependências não utilizadas
  - Limpeza de imports desnecessários
  - **Estimativa:** 3 pontos | **Assignee:** @fullstack-dev

- [ ] **CLEAN-002** - Refatoração de componentes
  - Divisão de componentes grandes
  - Hooks customizados reutilizáveis
  - Padronização de estilos
  - **Estimativa:** 8 pontos | **Assignee:** @frontend-dev

#### 🧪 Testes
- [ ] **TEST-001** - Testes unitários backend
  - Testes para todos os models
  - Testes para ViewSets principais
  - Cobertura mínima de 80%
  - **Estimativa:** 13 pontos | **Assignee:** @backend-dev

- [ ] **TEST-002** - Testes frontend
  - Testes de componentes críticos
  - Testes de integração com APIs
  - E2E tests para fluxos principais
  - **Estimativa:** 13 pontos | **Assignee:** @frontend-dev

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO GERAIS

### ✅ Definition of Done
Toda tarefa deve atender:
- [ ] Código revisado por outro desenvolvedor
- [ ] Testes implementados (quando aplicável)
- [ ] Documentação atualizada
- [ ] Funcionalidade testada em ambiente de desenvolvimento
- [ ] Sem erros no console/logs
- [ ] Responsivo (para frontend)
- [ ] Segue padrões de código do projeto

### 🔍 Critérios de Qualidade
- **Performance:** Tempo de resposta < 2s
- **Segurança:** Validação completa de inputs
- **UX:** Interface intuitiva e responsiva
- **Manutenibilidade:** Código limpo e documentado

---

## 📊 MÉTRICAS DE SUCESSO

### 📈 KPIs Técnicos
- **Cobertura de Testes:** > 80%
- **Performance API:** < 500ms tempo médio
- **Bugs em Produção:** < 5 por sprint
- **Uptime:** > 99.5%

### 👥 KPIs de Usuário
- **Time to Value:** Usuário consegue fazer primeira transação em < 5min
- **Usabilidade:** 95% das tarefas completadas sem ajuda
- **Satisfação:** NPS > 8/10

---

## 🗓️ CRONOGRAMA ESTIMADO

| Sprint | Período | Foco Principal | Pontos |
|--------|---------|----------------|--------|
| 1 | Semana 1-2 | Integração Frontend-Backend Básica | 34 |
| 2 | Semana 3-4 | APIs Completas + Auth | 26 |
| 3 | Semana 5-6 | Sistema de Favorecidos | 34 |
| 4 | Semana 7-8 | Dashboard + Relatórios | 34 |
| 5 | Semana 9-10 | Importação CSV | 42 |
| 6 | Semana 11-12 | UX/UI Avançado | 29 |
| 7 | Semana 13-14 | Segurança + Performance | 26 |
| 8 | Semana 15-16 | Testes + Limpeza | 37 |

**Total Estimado:** 262 pontos (16 semanas)

---

## 🚀 ENTREGÁVEIS POR SPRINT

### Sprint 1-2: MVP Conectado
- ✅ Login funcional
- ✅ CRUD de contas conectado
- ✅ Listagem de transações da API
- ✅ Categorias funcionais

### Sprint 3-4: Funcionalidades Core
- ✅ Sistema de favorecidos básico
- ✅ Dashboard com dados reais
- ✅ Relatórios simples

### Sprint 5-6: Funcionalidades Avançadas
- ✅ Importação CSV básica
- ✅ UX/UI polido
- ✅ Mobile responsivo

### Sprint 7-8: Produção Ready
- ✅ Sistema seguro e otimizado
- ✅ Testes abrangentes
- ✅ Código limpo e documentado

---

**📝 Nota:** Este documento será atualizado conforme o progresso do projeto. Cada tarefa deve ser convertida em uma Issue do GitHub com labels apropriadas (frontend, backend, enhancement, bug, etc.).
