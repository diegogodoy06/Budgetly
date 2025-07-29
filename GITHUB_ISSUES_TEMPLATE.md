# 🎫 Template de Issues para GitHub Projects

## 📋 Como criar Issues baseadas no plano de desenvolvimento

### 🏷️ Labels Sugeridas
- `epic-frontend-backend` - Para integração FE/BE
- `epic-favorecidos` - Para sistema de favorecidos
- `epic-importacao` - Para sistema de importação CSV
- `epic-robustez` - Para melhorias de performance/segurança
- `priority-high` - Alta prioridade
- `priority-medium` - Média prioridade
- `priority-low` - Baixa prioridade
- `frontend` - Trabalho de frontend
- `backend` - Trabalho de backend
- `enhancement` - Nova funcionalidade
- `bug` - Correção de bug
- `documentation` - Documentação

---

## 🎯 Exemplo de Issue: FB-001

### Título
`🔐 FB-001: Configurar autenticação JWT no frontend`

### Descrição
```markdown
## 📋 Descrição
Implementar sistema completo de autenticação JWT no frontend React para integração com o backend Django.

## 🎯 Objetivos
- [ ] Implementar login/logout com tokens JWT
- [ ] Armazenar tokens de forma segura (localStorage/sessionStorage)
- [ ] Criar interceptors Axios para requests autenticados
- [ ] Implementar refresh token automático
- [ ] Tratar erros de autenticação (401, 403)

## 📋 Critérios de Aceitação
- [ ] Login funcional com email/senha retorna token válido
- [ ] Token é incluído automaticamente em todas as requests
- [ ] Logout limpa tokens e redireciona para login
- [ ] Refresh token funciona automaticamente antes da expiração
- [ ] Usuário é redirecionado para login quando token expira
- [ ] Não há dados sensíveis expostos no console

## 🛠️ Tarefas Técnicas
- [ ] Instalar e configurar axios interceptors
- [ ] Criar context de autenticação (AuthContext)
- [ ] Implementar hooks useAuth()
- [ ] Criar componente ProtectedRoute
- [ ] Implementar formulário de login responsivo
- [ ] Adicionar loading states e error handling
- [ ] Testes unitários para autenticação

## 🔗 Arquivos Afetados
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/services/api.ts`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Login.tsx`

## ⚠️ Considerações
- Usar httpOnly cookies se possível para maior segurança
- Implementar rate limiting no lado do client
- Validar tokens antes de fazer requests

## 🧪 Como Testar
1. Tentar fazer login com credenciais válidas
2. Verificar se token está sendo enviado nas requests
3. Fazer logout e verificar se token foi removido
4. Tentar acessar rota protegida sem autenticação
5. Deixar token expirar e verificar refresh automático
```

### Labels
`epic-frontend-backend`, `priority-high`, `frontend`, `enhancement`

### Milestone
`Sprint 1`

### Assignees
`@frontend-dev`

### Estimativa
`5 pontos`

---

## 🎯 Exemplo de Issue: FAV-001

### Título
`👥 FAV-001: Criar modelo Favorecido no backend`

### Descrição
```markdown
## 📋 Descrição
Criar modelo Django para gerenciar favorecidos/destinatários de transações, permitindo identificação automática em importações futuras.

## 🎯 Objetivos
- [ ] Criar modelo Favorecido com campos essenciais
- [ ] Implementar relacionamento com User
- [ ] Adicionar métodos de busca e matching
- [ ] Configurar admin interface
- [ ] Criar migrations

## 📋 Critérios de Aceitação
- [ ] Modelo criado com todos os campos necessários
- [ ] Relacionamento 1:N com User funcionando
- [ ] Métodos de busca por nome/documento implementados
- [ ] Admin interface configurada com filtros
- [ ] Migrations aplicadas sem erros
- [ ] Testes unitários passando

## 🛠️ Campos do Modelo
- [ ] `user` (ForeignKey para User)
- [ ] `nome` (CharField, 200 chars)
- [ ] `documento` (CharField, CPF/CNPJ, opcional)
- [ ] `email` (EmailField, opcional)
- [ ] `telefone` (CharField, opcional)
- [ ] `banco` (CharField, opcional)
- [ ] `agencia` (CharField, opcional)
- [ ] `conta` (CharField, opcional)
- [ ] `tipo_conta` (choices: corrente, poupança, etc.)
- [ ] `observacoes` (TextField, opcional)
- [ ] `is_active` (BooleanField, default=True)
- [ ] `created_at`, `updated_at` (timestamps)

## 🔗 Arquivos Afetados
- `apps/transactions/models.py` (novo modelo)
- `apps/transactions/admin.py`
- `apps/transactions/migrations/`

## 🧪 Como Testar
1. Criar favorecido via admin
2. Testar busca por nome (case insensitive)
3. Testar busca por documento
4. Verificar relacionamento com User
5. Testar métodos de matching
```

### Labels
`epic-favorecidos`, `priority-medium`, `backend`, `enhancement`

### Milestone
`Sprint 3`

---

## 🎯 Exemplo de Issue: CSV-001

### Título
`📄 CSV-001: Implementar parser de CSV bancário genérico`

### Descrição
```markdown
## 📋 Descrição
Criar sistema robusto para processar arquivos CSV de diferentes bancos, com detecção automática de formato e mapeamento flexível de colunas.

## 🎯 Objetivos
- [ ] Criar parser genérico para CSV bancário
- [ ] Implementar detecção automática de formato
- [ ] Criar sistema de mapeamento de colunas
- [ ] Validar dados antes da importação
- [ ] Gerar relatório de importação

## 📋 Critérios de Aceitação
- [ ] Parser detecta formato automaticamente
- [ ] Suporta pelo menos 3 formatos de banco diferentes
- [ ] Valida dados obrigatórios (data, valor, descrição)
- [ ] Identifica e trata duplicatas
- [ ] Gera log detalhado de importação
- [ ] Performance adequada para arquivos até 10k linhas

## 🛠️ Funcionalidades
- [ ] Detecção automática de separador (vírgula, ponto-vírgula)
- [ ] Detecção de encoding (UTF-8, ISO-8859-1)
- [ ] Mapeamento flexível de colunas
- [ ] Validação de formato de data
- [ ] Normalização de valores monetários
- [ ] Tratamento de campos opcionais

## 📊 Formatos Suportados
- [ ] Banco do Brasil
- [ ] Itaú
- [ ] Bradesco
- [ ] Caixa Econômica
- [ ] Nubank
- [ ] Formato genérico configurável

## 🔗 Arquivos Afetados
- `apps/transactions/parsers/` (novo módulo)
- `apps/transactions/parsers/base.py`
- `apps/transactions/parsers/banco_brasil.py`
- `apps/transactions/parsers/itau.py`
- `apps/transactions/models.py` (ImportData)
- `apps/transactions/services/import_service.py`

## 🧪 Como Testar
1. Importar CSV do Banco do Brasil
2. Importar CSV do Itaú com formato diferente
3. Testar arquivo com encoding diferente
4. Testar arquivo com dados inválidos
5. Verificar detecção de duplicatas
6. Testar performance com arquivo grande
```

### Labels
`epic-importacao`, `priority-low`, `backend`, `enhancement`

### Milestone
`Sprint 5`

---

## 📊 Estrutura do GitHub Project

### 📋 Colunas Sugeridas
1. **📥 Backlog** - Issues criadas mas não priorizadas
2. **🎯 Ready** - Issues prontas para desenvolvimento
3. **🔄 In Progress** - Issues sendo desenvolvidas
4. **👀 Review** - Issues em code review
5. **🧪 Testing** - Issues em teste
6. **✅ Done** - Issues concluídas

### 🏷️ Filtros Úteis
- **Por Épico:** `label:epic-frontend-backend`
- **Por Prioridade:** `label:priority-high`
- **Por Assignee:** `assignee:@username`
- **Por Milestone:** `milestone:"Sprint 1"`

### 📈 Views Personalizadas
1. **Sprint Board** - Filtrado por milestone atual
2. **Backend Tasks** - Filtrado por `label:backend`
3. **Frontend Tasks** - Filtrado por `label:frontend`
4. **High Priority** - Filtrado por `label:priority-high`

---

## 🚀 Próximos Passos

1. **Criar Labels** no repositório
2. **Configurar Milestones** (Sprint 1, Sprint 2, etc.)
3. **Criar Issues** usando os templates acima
4. **Configurar GitHub Project** com as colunas
5. **Adicionar Issues ao Project**
6. **Configurar Automations** (mover para "In Progress" quando assignado)

Este sistema permitirá rastrear todo o progresso do desenvolvimento de forma organizada e visual! 🎯
