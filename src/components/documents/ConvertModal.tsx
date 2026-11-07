'use client';

import React, { useState } from 'react';
import { Document as DocumentType, PaymentMethod } from '@/types/database';
import { convertOrcamentoToRecibo } from '@/lib/services/documents';
import { formatCurrency } from '@/utils/formatters';
import { X, ArrowRight, Loader2, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  orcamento: DocumentType | null;
  onConverted: (novoRecibo: DocumentType) => void;
}

export const ConvertModal: React.FC<ConvertModalProps> = ({
  isOpen,
  onClose,
  orcamento,
  onConverted,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !orcamento) return null;

  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const novoRecibo = await convertOrcamentoToRecibo(orcamento, paymentMethod);
      novoRecibo.client = orcamento.client;
      onConverted(novoRecibo);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao converter orçamento em recibo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 bg-avi-green text-white">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm">Transformar em Recibo Quitado</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-gray-600 leading-relaxed">
            O cliente aprovou e efetuou o pagamento? O sistema marcará o orçamento como{' '}
            <strong className="text-emerald-700">APROVADO</strong> e gerará um novo Recibo oficial{' '}
            <strong className="text-avi-green">PAGO</strong> com todos os dados copiados.
          </p>

          {/* Card Resumo do Orçamento */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Orçamento</span>
              <span className="text-xs font-bold text-gray-900">{orcamento.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Cliente</span>
              <span className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">
                {orcamento.client?.name || 'Cliente'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-gray-200">
              <span className="text-xs font-bold text-gray-700">Valor Total</span>
              <span className="text-sm font-bold text-avi-green">
                {formatCurrency(orcamento.total_amount)}
              </span>
            </div>
          </div>

          {/* Seleção da Forma de Quitação */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Como o cliente pagou?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('PIX')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                  paymentMethod === 'PIX'
                    ? 'border-avi-green bg-emerald-50 text-avi-green shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('DINHEIRO')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                  paymentMethod === 'DINHEIRO'
                    ? 'border-avi-green bg-emerald-50 text-avi-green shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span>Dinheiro</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleConvert}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-avi-green hover:bg-avi-green-light active:scale-95 rounded-xl shadow-md transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              )}
              <span>Gerar Recibo Quitado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
