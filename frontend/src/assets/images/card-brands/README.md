# Bandeiras de Cartão - Logos e Ícones

Esta pasta contém os logos das principais bandeiras de cartão de crédito e débito aceitas no Brasil.

## 📁 Bandeiras Essenciais

### Bandeiras Principais (Prioridade Máxima)

| Bandeira | Arquivo | Market Share | Status |
|----------|---------|--------------|--------|
| Visa | `visa.png` | ~50% | ❌ Pendente |
| Mastercard | `mastercard.png` | ~35% | ❌ Pendente |
| Elo | `elo.png` | ~10% | ❌ Pendente |

### Bandeiras Secundárias (Prioridade Alta)

| Bandeira | Arquivo | Uso | Status |
|----------|---------|-----|--------|
| American Express | `american-express.png` | Premium | ❌ Pendente |
| Hipercard | `hipercard.png` | Nacional | ❌ Pendente |
| Diners Club | `diners-club.png` | Corporate | ❌ Pendente |

### Bandeiras Específicas (Prioridade Média)

| Bandeira | Arquivo | Observação | Status |
|----------|---------|------------|--------|
| Discover | `discover.png` | Internacional | ❌ Pendente |
| JCB | `jcb.png` | Asiática | ❌ Pendente |
| UnionPay | `unionpay.png` | Chinesa | ❌ Pendente |
| Aura | `aura.png` | Nacional | ❌ Pendente |
| Cabal | `cabal.png` | Argentina/Brasil | ❌ Pendente |
| Banricompras | `banricompras.png` | Regional | ❌ Pendente |

## 🎨 Especificações Técnicas

### Padrão Visual
- **Formato:** PNG com transparência
- **Tamanho:** 80x50px (proporção 8:5)
- **Resolução:** 144 DPI mínimo
- **Fundo:** Transparente
- **Qualidade:** Alta definição

### Estilo Recomendado
- Logo oficial da bandeira
- Cores originais da marca
- Sem bordas ou sombras adicionais
- Centralizados no canvas

## 📥 Fontes Oficiais para Download

### Principais Bandeiras

**Visa**
- Site: [visa.com.br](https://visa.com.br) → Área de Imprensa
- Logo: Azul e branco, tipografia oficial

**Mastercard**
- Site: [mastercard.com.br](https://mastercard.com.br) → Brand Center  
- Logo: Círculos vermelho e amarelo sobrepostos

**Elo**
- Site: [elo.com.br](https://elo.com.br) → Kit de Mídia
- Logo: Verde, amarelo e vermelho (cores nacionais)

**American Express**
- Site: [americanexpress.com](https://americanexpress.com) → Media Kit
- Logo: Azul com tipografia branca

**Hipercard**
- Site: [hipercard.com.br](https://hipercard.com.br) → Área de Imprensa
- Logo: Vermelho e branco

### Recursos Alternativos

**Sites de Ícones**
- [Flaticon](https://flaticon.com) - "credit card brands"
- [Iconfinder](https://iconfinder.com) - "payment methods"  
- [Icons8](https://icons8.com) - "credit card icons"

**Repositórios GitHub**
- "payment-icons"
- "credit-card-logos"
- "brand-icons"

## 🔧 Implementação no Código

```typescript
// Importação estática
import visaLogo from '@/assets/images/card-brands/visa.png';
import mastercardLogo from '@/assets/images/card-brands/mastercard.png';

// Uso com componente
import { BandeiraLogo } from '@/utils/assets';

<BandeiraLogo 
  bandeiraId="visa" 
  className="w-10 h-6"
  fallbackText="VISA"
/>
```

## 🎯 Casos de Uso

### Formulários de Cartão
- Seleção de bandeira no cadastro
- Validação visual do número do cartão
- Display na lista de cartões salvos

### Relatórios e Dashboards  
- Gráficos por bandeira de cartão
- Análise de uso por tipo de pagamento
- Estatísticas de transações

### Interface de Pagamento
- Seleção visual de método de pagamento
- Confirmação de dados do cartão
- Histórico de transações

## 📊 Prioridade de Implementação

### Fase 1 (Essencial)
1. ✅ Visa - Principal bandeira do mercado
2. ✅ Mastercard - Segunda maior bandeira  
3. ✅ Elo - Bandeira nacional obrigatória

### Fase 2 (Importante)
4. ✅ American Express - Cartões premium
5. ✅ Hipercard - Relevante no mercado nacional
6. ✅ Diners Club - Cartões corporativos

### Fase 3 (Complementar)
7. ✅ Discover, JCB, UnionPay - Cobertura internacional
8. ✅ Aura, Cabal - Bandeiras regionais
9. ✅ Banricompras - Cobertura local específica

## ✅ Checklist de Qualidade

Antes de adicionar um logo, verifique:

- [ ] Formato PNG com transparência
- [ ] Dimensões corretas (80x50px)
- [ ] Qualidade alta (sem pixelização)
- [ ] Cores oficiais da marca
- [ ] Fundo completamente transparente
- [ ] Nome do arquivo correto (lowercase com hífens)
- [ ] Logo oficial e atualizado

---

**🎨 Nota de Design:** Mantenha consistência visual entre todos os logos para uma experiência de usuário harmoniosa. Use sempre as versões mais recentes dos logos oficiais das bandeiras.
