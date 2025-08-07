import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { invoicesAPI, accountsAPI } from '@/services/api';
import type { CreditCardInvoice, Account } from '@/types';
import toast from 'react-hot-toast';

interface InvoiceManagementModalProps {
  creditCard: { id: number; nome: string; bandeira?: string };
  onClose: () => void;
}

const InvoiceManagementModal: React.FC<InvoiceManagementModalProps> = ({
  creditCard,
  onClose
}) => {
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    invoiceId: number | null;
    valor: string;
    contaOrigem: number | null;
  }>({
    invoiceId: null,
    valor: '',
    contaOrigem: null
  });

  useEffect(() => {
    loadData();
  }, [creditCard.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, accountsData] = await Promise.all([
        invoicesAPI.getByCard(creditCard.id),
        accountsAPI.getAll()
      ]);
      
      setInvoices(invoicesData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da fatura');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInvoice = async (invoiceId: number) => {
    try {
      setActionLoading(`close-${invoiceId}`);
      const result = await invoicesAPI.close(invoiceId);
      
      toast.success(result.message);
      await loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao fechar fatura:', error);
      toast.error(error.response?.data?.error || 'Erro ao fechar fatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopenInvoice = async (invoiceId: number) => {
    try {
      setActionLoading(`reopen-${invoiceId}`);
      const result = await invoicesAPI.reopen(invoiceId);
      
      toast.success(result.message);
      await loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao reabrir fatura:', error);
      toast.error(error.response?.data?.error || 'Erro ao reabrir fatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayInvoice = async () => {
    if (!paymentData.invoiceId || !paymentData.valor || !paymentData.contaOrigem) {
      toast.error('Preencha todos os campos para pagamento');
      return;
    }

    try {
      setActionLoading(`pay-${paymentData.invoiceId}`);
      const result = await invoicesAPI.pay(paymentData.invoiceId, {
        valor: parseFloat(paymentData.valor.replace(',', '.')),
        conta_origem: paymentData.contaOrigem
      });
      
      toast.success(result.message);
      setPaymentData({ invoiceId: null, valor: '', contaOrigem: null });
      await loadData(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao pagar fatura:', error);
      toast.error(error.response?.data?.error || 'Erro ao pagar fatura');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'aberta': { color: 'bg-blue-100 text-blue-800', text: 'Aberta' },
      'fechada': { color: 'bg-yellow-100 text-yellow-800', text: 'Fechada' },
      'paga': { color: 'bg-green-100 text-green-800', text: 'Paga' },
      'vencida': { color: 'bg-red-100 text-red-800', text: 'Vencida' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.aberta;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciar Faturas
              </h3>
              <p className="text-sm text-gray-500">
                {creditCard.nome}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Carregando faturas...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Invoice List */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Faturas do Cartão
                </h4>
                
                {invoices.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma fatura encontrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-gray-900">
                              Fatura {invoice.mes.toString().padStart(2, '0')}/{invoice.ano}
                            </h5>
                            {getStatusBadge(invoice.status)}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(invoice.valor_total)}
                            </p>
                            {invoice.valor_pago !== '0.00' && (
                              <p className="text-sm text-gray-500">
                                Pago: {formatCurrency(invoice.valor_pago)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Fechamento:</span>
                            <br />
                            {new Date(invoice.data_fechamento).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Vencimento:</span>
                            <br />
                            {new Date(invoice.data_vencimento).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Restante:</span>
                            <br />
                            {formatCurrency(invoice.valor_restante)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {invoice.status === 'aberta' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCloseInvoice(invoice.id)}
                                disabled={actionLoading === `close-${invoice.id}`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                              >
                                {actionLoading === `close-${invoice.id}` ? 'Fechando...' : 'Fechar Manualmente'}
                              </button>
                              <span className="text-xs text-gray-500">
                                ⚠️ Normalmente faturas fecham automaticamente
                              </span>
                            </div>
                          )}
                          
                          {invoice.status === 'fechada' && (
                            <>
                              {/* Botão para reabrir fatura */}
                              <button
                                onClick={() => handleReopenInvoice(invoice.id)}
                                disabled={actionLoading === `reopen-${invoice.id}`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                              >
                                {actionLoading === `reopen-${invoice.id}` ? 'Reabrindo...' : 'Reabrir Fatura'}
                              </button>
                              
                              {/* Pagamento apenas se houver valor restante */}
                              {parseFloat(invoice.valor_restante) > 0 && (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Valor"
                                    value={paymentData.invoiceId === invoice.id ? paymentData.valor : ''}
                                    onChange={(e) => setPaymentData({
                                      ...paymentData,
                                      invoiceId: invoice.id,
                                      valor: e.target.value
                                    })}
                                    className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                                  />
                                  
                                  <select
                                    value={paymentData.invoiceId === invoice.id ? paymentData.contaOrigem || '' : ''}
                                    onChange={(e) => setPaymentData({
                                      ...paymentData,
                                      invoiceId: invoice.id,
                                      contaOrigem: e.target.value ? parseInt(e.target.value) : null
                                    })}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded"
                                  >
                                    <option value="">Conta</option>
                                    {accounts.map(account => (
                                      <option key={account.id} value={account.id}>
                                        {account.nome}
                                      </option>
                                    ))}
                                  </select>
                                  
                                  <button
                                    onClick={handlePayInvoice}
                                    disabled={actionLoading === `pay-${invoice.id}` || paymentData.invoiceId !== invoice.id}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                  >
                                    {actionLoading === `pay-${invoice.id}` ? 'Pagando...' : 'Pagar'}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagementModal;