import type { CreditCardBrand } from '@/types';

export interface CreditCardBrandInfo {
  value: CreditCardBrand;
  label: string;
  cor: string;
  logo: string;
}

export const CREDIT_CARD_BRANDS: CreditCardBrandInfo[] = [
  { value: 'Visa', label: 'Visa', cor: 'bg-blue-600', logo: '/src/assets/images/card-brands/visa.png' },
  { value: 'Mastercard', label: 'Mastercard', cor: 'bg-red-600', logo: '/src/assets/images/card-brands/mastercard.png' },
  { value: 'American Express', label: 'American Express', cor: 'bg-green-600', logo: '/src/assets/images/card-brands/amex.png' },
  { value: 'Elo', label: 'Elo', cor: 'bg-yellow-600', logo: '/src/assets/images/card-brands/elo.png' },
  { value: 'Hipercard', label: 'Hipercard', cor: 'bg-orange-600', logo: '/src/assets/images/card-brands/hipercard.png' },
  { value: 'Diners Club', label: 'Diners Club', cor: 'bg-gray-600', logo: '/src/assets/images/card-brands/diners.png' },
  { value: 'Discover', label: 'Discover', cor: 'bg-purple-600', logo: '/src/assets/images/card-brands/discover.png' },
  { value: 'JCB', label: 'JCB', cor: 'bg-indigo-600', logo: '/src/assets/images/card-brands/jcb.png' },
  { value: 'UnionPay', label: 'UnionPay', cor: 'bg-pink-600', logo: '/src/assets/images/card-brands/unionpay.png' },
  { value: 'Cabal', label: 'Cabal', cor: 'bg-teal-600', logo: '/src/assets/images/card-brands/cabal.png' },
  { value: 'Aura', label: 'Aura', cor: 'bg-cyan-600', logo: '/src/assets/images/card-brands/aura.webp' },
  { value: 'Banricompras', label: 'Banricompras', cor: 'bg-lime-600', logo: '/src/assets/images/card-brands/banricompras.png' }
];

export const getBrandColor = (brand: CreditCardBrand): string => {
  const brandInfo = CREDIT_CARD_BRANDS.find(b => b.value === brand);
  return brandInfo?.cor || 'bg-gray-600';
};

export const getBrandLogoPath = (brand: CreditCardBrand): string => {
  const brandInfo = CREDIT_CARD_BRANDS.find(b => b.value === brand);
  return brandInfo?.logo || '/src/assets/images/card-brands/visa.png';
};