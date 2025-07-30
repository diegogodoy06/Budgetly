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

### Formatação de Dados
**Moeda**: Padrão brasileiro com máscara em tempo real

```tsx
// Formatação para exibição
const formatarMoeda = (valor: string | number) => {
  const numericValue = typeof valor === 'string' ? parseFloat(valor) : valor;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numericValue);
};

// Parsing de entrada de moeda (remove formatação, converte para number)
const parseValorInput = (valorString: string): number => {
  if (!valorString) return 0;
  const numericString = valorString.replace(/\D/g, '');
  if (!numericString) return 0;
  const centavos = parseInt(numericString);
  return centavos / 100;
};

// Formatação para input de moeda (visual)
const formatarValorDisplay = (valor: number): string => {
  if (valor === 0) return '';
  const centavos = Math.round(valor * 100);
  const reais = Math.floor(centavos / 100);
  const centavosRestantes = centavos % 100;
  
  if (centavos < 100) {
    return `0,${centavosRestantes.toString().padStart(2, '0')}`;
  } else {
    return `${reais.toLocaleString('pt-BR')},${centavosRestantes.toString().padStart(2, '0')}`;
  }
};

// Handler para mudança de valor em input
const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputValue = e.target.value;
  const numericValue = parseValorInput(inputValue);
  setFormData(prev => ({ ...prev, valor: numericValue }));
};
```

**Datas**: Formato brasileiro e correção de timezone
```tsx
// Data atual correta (evita problema de timezone)
data: new Date().toLocaleDateString('en-CA') // Formato YYYY-MM-DD local

// Formatação para exibição
const formatarData = (data: string) => {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR');
};
```

### Estrutura de Modais/Popups
**Padrão Estabelecido**: Estrutura flex com scroll otimizado e bordas arredondadas preservadas

```tsx
{/* Modal */}
{mostrarModal && (
  <>
    {/* Backdrop com blur */}
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" 
      onClick={fecharModal}
    />
    
    {/* Modal Container */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[tamanho] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Título do Modal</h2>
          <button onClick={fecharModal} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Área de Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto">
          <form id="form-id" onSubmit={handleSubmit} className="p-6">
            {/* Conteúdo do formulário */}
          </form>
        </div>

        {/* Botões Fixos na Parte Inferior */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button type="button" onClick={fecharModal} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" form="form-id" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            Salvar
          </button>
        </div>
      </div>
    </div>
  </>
)}
```

**Características Importantes dos Modais:**
- **Backdrop**: `bg-black bg-opacity-50 backdrop-blur-sm` para efeito de desfoque
- **Container Principal**: `flex flex-col overflow-hidden` para controle de layout
- **Header**: `flex-shrink-0` para manter fixo no topo
- **Área de Scroll**: `flex-1 overflow-y-auto` - apenas o conteúdo tem scroll
- **Botões**: `flex-shrink-0` para manter fixos na parte inferior
- **Bordas Arredondadas**: `rounded-xl` preservadas em todos os cantos
- ### Integração com APIs
**Estrutura de Transações**: Suporte a contas e cartões de crédito
```tsx
interface TransactionForm {
  account?: number;          // ID da conta (opcional - para transações de conta)
  credit_card?: number;      // ID do cartão (opcional - para transações de cartão)
  tipo: 'entrada' | 'saida' | 'transferencia';
  valor: number;
  descricao: string;
  data: string;             // Formato YYYY-MM-DD
  category?: number;        // ID da categoria
  total_parcelas: number;   // Para parcelamento
  tipo_recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  observacoes: string;
}
```

**Seleção de Conta/Cartão**: Interface unificada
```tsx
<select
  value={formData.account || formData.credit_card || ''}
  onChange={(e) => {
    const selectedId = parseInt(e.target.value);
    if (!selectedId) {
      setFormData(prev => ({ ...prev, account: undefined, credit_card: undefined }));
      return;
    }
    const isAccount = accounts.some(acc => acc.id === selectedId);
    if (isAccount) {
      setFormData(prev => ({ ...prev, account: selectedId, credit_card: undefined }));
    } else {
      setFormData(prev => ({ ...prev, credit_card: selectedId, account: undefined }));
    }
  }}
>
  <option value="">Selecione uma conta</option>
  <optgroup label="Contas">
    {accounts.map((account) => (
      <option key={`account-${account.id}`} value={account.id}>
        {account.nome}
      </option>
    ))}
  </optgroup>
  <optgroup label="Cartões de Crédito">
    {creditCards.map((card) => (
      <option key={`card-${card.id}`} value={card.id}>
        {card.nome}
      </option>
    ))}
  </optgroup>
</select>
```

**Tratamento de Erros e Loading States**:
```tsx
const [loading, setLoading] = useState(false);

const carregarDados = async () => {
  try {
    setLoading(true);
    const [transactionsData, accountsData, categoriesData] = await Promise.all([
      transactionsAPI.getAll(),
      accountsAPI.getAll(),
      categoriesAPI.getAll()
    ]);
    // Atualizar estados...
    toast.success('Dados carregados com sucesso!');
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    toast.error('Erro ao carregar dados');
  } finally {
    setLoading(false);
  }
};
```

### Padrões de Interface Específicos

**Toggle de Recorrência**: Interface intuitiva para transações recorrentes
```tsx
const [isRecorrente, setIsRecorrente] = useState(false);

<div className="col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Tipo de Lançamento
  </label>
  <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
    <span className={`text-sm font-medium ${!isRecorrente ? 'text-gray-900' : 'text-gray-500'}`}>
      Transação única
    </span>
    <button
      type="button"
      onClick={() => {
        setIsRecorrente(!isRecorrente);
        setFormData(prev => ({ 
          ...prev, 
          tipo_recorrencia: !isRecorrente ? 'mensal' : 'nenhuma' 
        }));
      }}
      className={`mx-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isRecorrente ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        isRecorrente ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
    <span className={`text-sm font-medium ${isRecorrente ? 'text-gray-900' : 'text-gray-500'}`}>
      Recorrente
    </span>
  </div>
</div>
```

**Diferenciação Visual**: Contas vs Cartões de Crédito
```tsx
const getContaDisplay = (transaction: Transaction) => {
  const nome = getContaOuCartaoNome(transaction);
  const isCartao = transaction.credit_card && !transaction.account_name;
  
  return (
    <div className="flex items-center">
      {isCartao && (
        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" title="Cartão de Crédito"></div>
      )}
      <span className={isCartao ? 'text-orange-700' : 'text-gray-900'}>
        {nome}
      </span>
    </div>
  );
};
```

**Sistema de Parcelas**: Seletor intuitivo com valores calculados
```tsx
<select
  value={formData.total_parcelas}
  onChange={(e) => setFormData(prev => ({ ...prev, total_parcelas: parseInt(e.target.value) || 1 }))}
>
  <option value={1}>À vista (1x)</option>
  {Array.from({ length: 24 }, (_, i) => i + 2).map(num => (
    <option key={num} value={num}>
      {num}x de {formatarMoeda(formData.valor / num)}
    </option>
  ))}
</select>
## 📋 Boas Práticas Estabelecidas

### Modais e Popups
- **SEMPRE** usar a estrutura padrão estabelecida com `flex flex-col overflow-hidden`
- **Header fixo** com `flex-shrink-0` no topo
- **Conteúdo com scroll** usando `flex-1 overflow-y-auto`
- **Botões fixos** na parte inferior com `flex-shrink-0`
- **Backdrop** com blur: `bg-black bg-opacity-50 backdrop-blur-sm`
- **Bordas arredondadas** preservadas: `rounded-xl` no container principal

### Formulários
- **IDs nos forms** para permitir submit externo: `<form id="form-name">`
- **Botões externos** referenciando o form: `<button form="form-name">`
- **Validação visual** com estados de foco e erro
- **Loading states** em todos os submits

### Entrada de Dados
- **Moeda**: Usar máscara em tempo real com formatação brasileira
- **Datas**: Sempre usar `toLocaleDateString('en-CA')` para evitar problemas de timezone
- **Seletores**: Optgroups para categorizar opções (Contas vs Cartões)

### Estados Visuais
- **Loading**: Spinner + texto explicativo
- **Empty states**: Ícone + título + descrição + CTA
- **Erro**: Toast notifications com mensagens claras
- **Sucesso**: Feedback imediato com toast

### Responsividade
- **Mobile-first**: Começar com design mobile
- **Breakpoints**: `sm:`, `md:`, `lg:` do Tailwind
- **Grid responsivo**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

## 🚀 Melhorias Implementadas (Histórico)

### Estrutura de Modais Otimizada
- ✅ Bordas arredondadas preservadas durante scroll
- ✅ Header e botões fixos, apenas conteúdo com scroll
- ✅ Backdrop com efeito blur
- ✅ Estrutura flexbox otimizada

### Sistema de Entrada de Moeda
- ✅ Máscara em tempo real com formatação brasileira
- ✅ Parsing automático de entrada (centavos → reais)
- ✅ Display formatado para visualização

### Interface de Transações
- ✅ Toggle intuitivo para recorrência
- ✅ Sistema de parcelas com valores calculados
- ✅ Diferenciação visual entre contas e cartões
- ✅ Integração unificada de contas e cartões de crédito

### Correções de Data/Timezone
- ✅ Data atual sem problemas de timezone
- ✅ Formatação consistente pt-BR
- ✅ Handling correto de datas em formulários

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
