import React from 'react';

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

  const iconSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const textSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  if (variant === 'icon') {
    return (
      <div className={`bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg ${sizeClasses[size]} ${className}`}>
        <span className={`text-white font-black ${iconSize[size]}`}>B</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg ${sizeClasses[size]}`}>
        <span className={`text-white font-black ${iconSize[size]}`}>B</span>
      </div>
      <h1 className={`ml-3 font-black text-gradient ${textSize[size]}`}>
        Budgetly
      </h1>
    </div>
  );
};

export default Logo;