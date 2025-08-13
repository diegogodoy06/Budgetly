import React from 'react';
import logoIcon from '../assets/images/logo.webp';
import logoFull from '../assets/images/Logo completo.webp';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = 'full', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: variant === 'icon' ? 'w-8 h-8' : 'h-8',
    md: variant === 'icon' ? 'w-10 h-10' : 'h-10',
    lg: variant === 'icon' ? 'w-16 h-16' : 'h-16',
  };

  if (variant === 'icon') {
    return (
      <img
        src={logoIcon}
        alt="Budgetly"
        className={`${sizeClasses[size]} ${className} object-contain`}
      />
    );
  }

  return (
    <img
      src={logoFull}
      alt="Budgetly"
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
};

export default Logo;