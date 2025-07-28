# Configurações - Submenu Expansível

Este documento descreve as alterações implementadas para criar um submenu expansível em "Configurações" no menu lateral.

## Alterações Implementadas

### 1. Novas Páginas Criadas

#### CategoriesManagement.tsx (`/settings/categories`)
- Página dedicada para gerenciar categorias
- Funcionalidades:
  - Listar todas as categorias
  - Adicionar nova categoria
  - Editar categoria existente
  - Excluir categoria
  - Toggle para ativar/desativar categoria
  - Toggle para incluir/excluir do dashboard
  - Seleção de nível de importância (Essencial, Necessário, Supérfluo)

#### CostCentersManagement.tsx (`/settings/cost-centers`)
- Página dedicada para gerenciar centros de custo
- Funcionalidades:
  - Listar todos os centros de custo
  - Adicionar novo centro de custo
  - Editar centro de custo existente
  - Excluir centro de custo
  - Toggle para ativar/desativar centro de custo

### 2. Layout Atualizado

#### Modificações no Layout.tsx
- Adicionada interface `NavigationItem` para suportar itens com sub-items
- Implementado estado `expandedItems` para controlar quais seções estão expandidas
- Criada função `renderNavigationItem()` para renderizar itens com ou sem filhos
- Adicionados ícones `ChevronRightIcon` e `BuildingOfficeIcon`
- Implementada lógica de detecção de item ativo considerando sub-rotas

#### Estrutura do Menu
```
├── Dashboard
├── Carteiras
├── Cartão de Crédito
├── Transações
├── Categorias
├── Orçamentos
├── Relatórios
└── Configurações (expansível)
    ├── Categorias
    └── Centros de Custo
```

### 3. Rotas Adicionadas

#### App.tsx
- `/settings/categories` → CategoriesManagement
- `/settings/cost-centers` → CostCentersManagement

### 4. Funcionalidades do Submenu

#### Comportamento
- Clique no item "Configurações" expande/contrai o submenu
- Ícone de seta rotaciona para indicar estado (expandido/contraído)
- Sub-itens são identados para melhor visualização hierárquica
- Detecção automática de rota ativa em sub-itens
- Estado do menu é mantido durante a navegação

#### Styling
- Consistente com o design existente
- Transições suaves para expansão/contração
- Indicadores visuais claros para itens ativos
- Responsivo para mobile e desktop

## Como Usar

1. **Acessar Configurações de Categorias:**
   - Clique em "Configurações" no menu lateral
   - Clique em "Categorias" no submenu expandido
   - Ou navegue diretamente para `/settings/categories`

2. **Acessar Configurações de Centros de Custo:**
   - Clique em "Configurações" no menu lateral
   - Clique em "Centros de Custo" no submenu expandido
   - Ou navegue diretamente para `/settings/cost-centers`

## Integração com Contexto

As páginas de gerenciamento utilizam o contexto `ConfiguracoesContext` existente:
- `useConfiguracoes()` hook para acessar dados e funções
- Integração total com o estado global da aplicação
- Mudanças refletem imediatamente em outros componentes

## Benefícios

- **Organização:** Melhor estruturação das configurações
- **UX:** Interface mais intuitiva e hierárquica
- **Escalabilidade:** Fácil adição de novas seções de configuração
- **Manutenibilidade:** Código bem estruturado e reutilizável
- **Consistência:** Design alinhado com o resto da aplicação
