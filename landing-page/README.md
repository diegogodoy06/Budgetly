# Budgetly Landing Page

Landing page moderna e independente para o Budgetly, utilizando estilo glassmorphism e executando como aplicação separada.

## 🚀 Características

- **Aplicação Independente**: Roda em porta separada (3001) da aplicação principal
- **Design Glassmorphism**: Efeitos de vidro desfocado modernos e elegantes
- **Responsivo**: Totalmente adaptado para todos os dispositivos
- **Animações Fluidas**: Elementos flutuantes e transições suaves
- **Tecnologia de Ponta**: React + TypeScript + Vite + TailwindCSS

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **TailwindCSS** com configurações customizadas para glassmorphism
- **Heroicons** para ícones consistentes
- **PostCSS** com plugins otimizados

## 📦 Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento (porta 3001)
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

## 🎨 Seções da Landing Page

### Hero Section
- Título principal com gradiente
- Estatísticas animadas em tempo real
- CTAs para registro e demonstração
- Elementos flutuantes animados

### Sobre (About)
- Missão e visão da empresa
- Características técnicas do sistema
- Cards com efeito glassmorphism escuro

### Funcionalidades (Features)
- 6 funcionalidades principais detalhadas
- Badges de destaque (Novo, IA, Exclusivo, etc.)
- Cards interativos com hover effects

### Benefícios (Benefits)
- 6 benefícios principais com ícones
- Layout responsivo em grid
- Ênfase em resultados reais

### FAQ
- 6 perguntas frequentes detalhadas
- Design expansível e acessível
- Informações técnicas e comerciais

### CTA Final
- Call-to-action principal
- Links diretos para o sistema principal
- Garantias e benefícios

## 🔗 Integração com Sistema Principal

A landing page redireciona para o sistema principal (porta 3000) através de:

- **Login**: `http://localhost:3000/login`
- **Registro**: `http://localhost:3000/register`

## 🎯 Configurações de Desenvolvimento

### Portas
- **Landing Page**: 3001
- **Sistema Principal**: 3000
- **Backend**: 8000

### Build e Deploy
```bash
# Build otimizado para produção
npm run build

# Os arquivos são gerados em ./dist/
# Podem ser servidos por qualquer servidor estático
```

## 🎨 Personalização

### Cores
As cores principais são definidas no `tailwind.config.js`:
- Primary: Azul (#2563eb)
- Gradientes personalizados
- Opacidades para glassmorphism

### Animações
- Float: Elementos flutuantes
- Pulse: Pulsação suave
- Hover: Transformações interativas

### Glassmorphism
Classes utilitárias personalizadas no `index.css`:
- `.glass`: Efeito básico
- `.glass-dark`: Para fundos escuros
- `.glass-card`: Para cards principais

## 📱 Responsividade

A landing page é totalmente responsiva com breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Todos os elementos se adaptam automaticamente, mantendo a qualidade visual em qualquer dispositivo.