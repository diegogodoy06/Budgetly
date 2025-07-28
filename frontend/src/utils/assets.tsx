import React from 'react';

/**
 * Utilitário para carregamento dinâmico de assets (logos de bancos e bandeiras)
 */

export interface BandeiraCartao {
  id: string;
  nome: string;
  filename: string;
}

export const bandeirasCartao: BandeiraCartao[] = [
  { id: 'visa', nome: 'Visa', filename: 'visa.png' },
  { id: 'mastercard', nome: 'Mastercard', filename: 'mastercard.png' },
  { id: 'elo', nome: 'Elo', filename: 'elo.png' },
  { id: 'american-express', nome: 'American Express', filename: 'american-express.png' },
  { id: 'hipercard', nome: 'Hipercard', filename: 'hipercard.png' },
  { id: 'diners-club', nome: 'Diners Club', filename: 'diners-club.png' },
  { id: 'discover', nome: 'Discover', filename: 'discover.png' },
  { id: 'jcb', nome: 'JCB', filename: 'jcb.png' },
  { id: 'unionpay', nome: 'UnionPay', filename: 'unionpay.png' },
  { id: 'cabal', nome: 'Cabal', filename: 'cabal.png' },
  { id: 'aura', nome: 'Aura', filename: 'aura.png' },
  { id: 'banricompras', nome: 'Banricompras', filename: 'banricompras.png' },
];

/**
 * Carrega dinamicamente o logo de uma bandeira de cartão
 * @param bandeiraId - ID da bandeira (ex: 'visa', 'mastercard')
 * @returns URL do logo ou null se não encontrado
 */
export const getBandeiraLogo = async (bandeiraId: string): Promise<string | null> => {
  try {
    const bandeira = bandeirasCartao.find(b => b.id === bandeiraId.toLowerCase());
    if (!bandeira) return null;
    
    const module = await import(`@/assets/images/card-brands/${bandeira.filename}`);
    return module.default;
  } catch (error) {
    console.warn(`Logo da bandeira '${bandeiraId}' não encontrado`);
    return null;
  }
};

/**
 * Carrega dinamicamente o logo de um banco
 * @param codigoBanco - Código de 3 dígitos do banco (ex: '001', '341')
 * @returns URL do logo ou null se não encontrado
 */
export const getBancoLogo = async (codigoBanco: string): Promise<string | null> => {
  try {
    // Garante que o código tenha 3 dígitos com zeros à esquerda
    const codigo = codigoBanco.padStart(3, '0');
    
    const module = await import(`@/assets/images/banks/${codigo}.png`);
    return module.default;
  } catch (error) {
    console.warn(`Logo do banco '${codigoBanco}' não encontrado`);
    return null;
  }
};

/**
 * Hook React para carregar logo de bandeira com estado de loading
 */
export const useBandeiraLogo = (bandeiraId: string | null) => {
  const [logo, setLogo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!bandeiraId) {
      setLogo(null);
      return;
    }

    setLoading(true);
    getBandeiraLogo(bandeiraId)
      .then(setLogo)
      .finally(() => setLoading(false));
  }, [bandeiraId]);

  return { logo, loading };
};

/**
 * Hook React para carregar logo de banco com estado de loading
 */
export const useBancoLogo = (codigoBanco: string | null) => {
  const [logo, setLogo] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!codigoBanco) {
      setLogo(null);
      return;
    }

    setLoading(true);
    getBancoLogo(codigoBanco)
      .then(setLogo)
      .finally(() => setLoading(false));
  }, [codigoBanco]);

  return { logo, loading };
};

/**
 * Componente para exibir logo de bandeira com fallback
 */
interface BandeiraLogoProps {
  bandeiraId: string;
  className?: string;
  fallbackText?: string;
}

export const BandeiraLogo: React.FC<BandeiraLogoProps> = ({ 
  bandeiraId, 
  className = "w-10 h-6", 
  fallbackText 
}) => {
  const { logo, loading } = useBandeiraLogo(bandeiraId);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded`} />
    );
  }

  if (logo) {
    return (
      <img 
        src={logo} 
        alt={`Logo ${bandeiraId}`}
        className={className}
      />
    );
  }

  // Fallback para texto ou ícone genérico
  return (
    <div className={`${className} bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded border-2 border-dashed border-gray-300`}>
      {fallbackText || bandeiraId.toUpperCase().slice(0, 3)}
    </div>
  );
};

/**
 * Componente para exibir logo de banco com fallback
 */
interface BancoLogoProps {
  codigoBanco: string;
  nomeBanco?: string;
  className?: string;
  showFallback?: boolean;
}

export const BancoLogo: React.FC<BancoLogoProps> = ({ 
  codigoBanco, 
  nomeBanco, 
  className = "w-8 h-8",
  showFallback = true
}) => {
  const { logo, loading } = useBancoLogo(codigoBanco);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded-full`} />
    );
  }

  if (logo) {
    return (
      <div className={`${className} bg-white rounded-full p-1 shadow-sm flex items-center justify-center`}>
        <img 
          src={logo} 
          alt={`Logo ${nomeBanco || codigoBanco}`}
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    );
  }

  // Fallback para texto ou ícone genérico
  if (!showFallback) return null;
  
  const fallbackText = nomeBanco 
    ? nomeBanco.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
    : codigoBanco;

  return (
    <div className={`${className} bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-xs font-bold text-white rounded-full border-2 border-white shadow-sm`}>
      {fallbackText}
    </div>
  );
};
