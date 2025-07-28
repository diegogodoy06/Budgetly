# Assets - Logos e Ícones

Esta pasta contém todos os assets visuais da aplicação Budgetly.

## Estrutura de Pastas

```
src/assets/
├── images/
│   ├── banks/          # Logos dos bancos brasileiros
│   └── card-brands/    # Logos das bandeiras de cartão
```

## 📱 Bandeiras de Cartão (`card-brands/`)

Coloque os PNGs das bandeiras de cartão nesta pasta com os seguintes nomes:

### Principais Bandeiras
- `visa.png` - Visa
- `mastercard.png` - Mastercard  
- `elo.png` - Elo
- `american-express.png` - American Express
- `hipercard.png` - Hipercard
- `diners-club.png` - Diners Club
- `discover.png` - Discover
- `jcb.png` - JCB
- `unionpay.png` - UnionPay

### Bandeiras Nacionais
- `cabal.png` - Cabal
- `aura.png` - Aura
- `banricompras.png` - Banricompras

## 🏦 Logos dos Bancos (`banks/`)

Coloque os PNGs dos logos dos bancos usando o **código do banco** como nome do arquivo:

### Principais Bancos (Exemplos)
- `001.png` - Banco do Brasil
- `104.png` - Caixa Econômica Federal
- `341.png` - Itaú Unibanco
- `237.png` - Banco Bradesco
- `033.png` - Banco Santander
- `077.png` - Banco Inter
- `260.png` - Nubank
- `336.png` - Banco C6
- `212.png` - Banco Original
- `208.png` - Banco BTG Pactual

### Todos os Códigos de Bancos

O arquivo `src/data/bancos.ts` contém a lista completa com todos os 435+ bancos brasileiros e seus códigos. Use o código de 3 dígitos como nome do arquivo PNG.

Exemplos:
- `001.png` - Banco do Brasil S.A.
- `003.png` - Banco da Amazônia S.A.
- `004.png` - Banco do Nordeste do Brasil S.A.
- `007.png` - BNDES
- `010.png` - Credicoamo
- ... (continua com todos os códigos)

## 📐 Especificações Técnicas

### Bandeiras de Cartão
- **Formato:** PNG com transparência
- **Tamanho:** 80x50px (proporção 8:5)
- **Resolução:** 144 DPI mínimo
- **Fundo:** Transparente

### Logos dos Bancos
- **Formato:** PNG com transparência
- **Tamanho:** 60x60px (quadrado)
- **Resolução:** 144 DPI mínimo
- **Fundo:** Transparente
- **Estilo:** Preferencialmente apenas o símbolo/ícone do banco

## 🔧 Como Usar no Código

### Importando Bandeiras
```typescript
import visaLogo from '@/assets/images/card-brands/visa.png';
import mastercardLogo from '@/assets/images/card-brands/mastercard.png';
```

### Importando Logos de Bancos
```typescript
import bancoBrasilLogo from '@/assets/images/banks/001.png';
import itauLogo from '@/assets/images/banks/341.png';
```

### Uso Dinâmico
```typescript
// Para bandeiras
const getBandeiraLogo = (bandeira: string) => {
  try {
    return require(`@/assets/images/card-brands/${bandeira.toLowerCase()}.png`);
  } catch {
    return null; // Fallback para ícone padrão
  }
};

// Para bancos
const getBancoLogo = (codigo: string) => {
  try {
    return require(`@/assets/images/banks/${codigo}.png`);
  } catch {
    return null; // Fallback para ícone padrão
  }
};
```

## 📋 Checklist de Assets

### Bandeiras Prioritárias ✅
- [ ] Visa
- [ ] Mastercard
- [ ] Elo
- [ ] American Express
- [ ] Hipercard

### Bancos Prioritários ✅
- [ ] Banco do Brasil (001)
- [ ] Caixa Econômica Federal (104)
- [ ] Itaú Unibanco (341)
- [ ] Banco Bradesco (237)
- [ ] Banco Santander (033)
- [ ] Banco Inter (077)
- [ ] Nubank (260)
- [ ] Banco C6 (336)

## 🎨 Dicas de Design

1. **Consistência:** Mantenha o mesmo estilo visual para todos os logos
2. **Legibilidade:** Certifique-se de que os logos sejam legíveis em tamanhos pequenos
3. **Cores:** Use as cores oficiais das instituições
4. **Simplicidade:** Prefira versões simplificadas dos logos para melhor visualização

## 📁 Organização de Arquivos

- Use nomes em **lowercase**
- Use **hífens** para separar palavras (ex: `american-express.png`)
- Para bancos, use apenas o **código de 3 dígitos** (ex: `001.png`)
- Mantenha os arquivos organizados e sem espaços nos nomes

---

**Nota:** Esta estrutura garante que a aplicação tenha uma aparência profissional e consistente ao exibir informações bancárias e de cartões de crédito.
