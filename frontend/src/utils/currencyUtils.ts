export const formatCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

export const formatCurrencyInput = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatCardNumber = (lastFour: string): string => {
  return `**** **** **** ${lastFour}`;
};

export const parseCurrencyInput = (value: string): number => {
  // Remove tudo que não é número
  const numbersOnly = value.replace(/\D/g, '');
  
  // Converte para centavos (divide por 100)
  const valueInCents = parseInt(numbersOnly) || 0;
  return valueInCents / 100;
};