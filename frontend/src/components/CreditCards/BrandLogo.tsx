import React from 'react';
import type { CreditCardBrand } from '@/types';
import { getBrandLogoPath } from '@/utils/creditCardBrands';

interface BrandLogoProps {
  brand: CreditCardBrand;
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ brand, className = "h-6 w-auto object-contain" }) => {
  const logoPath = getBrandLogoPath(brand);
  
  return (
    <img 
      src={logoPath} 
      alt={brand} 
      className={className}
      onError={(e) => {
        // Fallback para emoji se a imagem não carregar
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: inline');
      }}
    />
  );
};

export default BrandLogo;