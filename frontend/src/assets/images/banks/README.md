# Logos dos Bancos - Estrutura de Assets

Esta pasta contém os logos dos bancos brasileiros organizados por código BACEN (3 dígitos).

## 📁 Principais Bancos para Download

### Top 10 Bancos Brasileiros (Prioridade Alta)

| Código | Banco | Logo Necessário |
|--------|-------|-----------------|
| `001` | Banco do Brasil S.A. | `001.png` |
| `033` | Banco Santander (Brasil) S.A. | `033.png` |
| `104` | Caixa Econômica Federal | `104.png` |
| `237` | Banco Bradesco S.A. | `237.png` |
| `341` | Itaú Unibanco S.A. | `341.png` |
| `077` | Banco Inter S.A. | `077.png` |
| `260` | Nu Pagamentos S.A. (Nubank) | `260.png` |
| `336` | Banco C6 S.A. | `336.png` |
| `212` | Banco Original S.A. | `212.png` |
| `208` | Banco BTG Pactual S.A. | `208.png` |

### Bancos Digitais (Prioridade Média)

| Código | Banco | Logo Necessário |
|--------|-------|-----------------|
| `290` | PagSeguro Digital Ltda. (PagBank) | `290.png` |
| `323` | Mercado Pago | `323.png` |
| `301` | BPP Instituição de Pagamento S.A. (PicPay) | `301.png` |
| `364` | Gerencianet Pagamentos do Brasil Ltda. | `364.png` |
| `380` | PicPay Servicos S.A. | `380.png` |

### Bancos Regionais/Cooperativas (Prioridade Baixa)

| Código | Banco | Logo Necessário |
|--------|-------|-----------------|
| `041` | Banrisul | `041.png` |
| `756` | Sicoob | `756.png` |
| `748` | Sicredi | `748.png` |
| `422` | Banco Safra S.A. | `422.png` |
| `655` | Banco Votorantim S.A. | `655.png` |

## 🎨 Especificações dos Logos

- **Formato:** PNG com transparência
- **Tamanho:** 60x60px
- **Qualidade:** Alta resolução (144 DPI)
- **Estilo:** Ícone/símbolo principal do banco
- **Fundo:** Transparente

## 📥 Fontes para Download

### Sites Oficiais dos Bancos
- **Banco do Brasil:** [bb.com.br](https://bb.com.br) → Área de Imprensa
- **Santander:** [santander.com.br](https://santander.com.br) → Kit de Mídia
- **Itaú:** [itau.com.br](https://itau.com.br) → Relações com Investidores
- **Bradesco:** [bradesco.com.br](https://bradesco.com.br) → Área de Imprensa
- **Nubank:** [nubank.com.br](https://nubank.com.br) → Área de Imprensa

### Recursos de Ícones
- **Flaticon:** [flaticon.com](https://flaticon.com) - Buscar por "bank icons brazil"
- **Iconfinder:** [iconfinder.com](https://iconfinder.com) - Ícones de bancos
- **Icons8:** [icons8.com](https://icons8.com) - Ícones bancários

### Repositórios GitHub
- Busque por "brazilian bank icons" ou "logos bancos brasileiros"
- Muitos projetos open source têm coleções de ícones bancários

## 🔧 Implementação no Código

Após adicionar os arquivos PNG nesta pasta, eles serão automaticamente carregados pelo sistema:

```typescript
// Exemplo de uso
import { BancoLogo } from '@/utils/assets';

// Em um componente React
<BancoLogo 
  codigoBanco="001" 
  nomeBanco="Banco do Brasil" 
  className="w-8 h-8" 
/>
```

## ✅ Status dos Logos

| Banco | Status | Arquivo |
|-------|--------|---------|
| Banco do Brasil | ❌ Pendente | `001.png` |
| Santander | ❌ Pendente | `033.png` |
| Caixa | ❌ Pendente | `104.png` |
| Bradesco | ❌ Pendente | `237.png` |
| Itaú | ❌ Pendente | `341.png` |
| Inter | ❌ Pendente | `077.png` |
| Nubank | ❌ Pendente | `260.png` |
| C6 Bank | ❌ Pendente | `336.png` |

*Atualize este status conforme for adicionando os arquivos.*

---

**💡 Dica:** Comece com os 5 principais bancos (BB, Santander, Caixa, Bradesco, Itaú) e depois expanda para os demais conforme a necessidade.
