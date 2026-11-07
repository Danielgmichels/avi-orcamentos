'use client';

import React, { useState, useEffect } from 'react';
import { Client, Document as DocumentType, PaymentMethod } from '@/types/database';
import { getNextCode, createDocumentRecord, updateDocumentRecord } from '@/lib/services/documents';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { formatCurrency } from '@/utils/formatters';
import { 
  X, 
  Receipt, 
  Loader2, 
  Eye, 
  Calendar, 
  MapPin, 
  Hash, 
  AlertCircle
} from 'lucide-react';

interface ReciboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (doc: DocumentType, openPreview?: boolean) => void;
  clients: Client[];
  onClientCreated: (client: Client) => void;
  documentToEdit?: DocumentType | null;
  defaultPixKey?: string;
}

export const ReciboModal: React.FC<ReciboModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  clients,
  onClientCreated,
  documentToEdit,
  defaultPixKey = '47 99659-4199',
}) => {
  const [code, setCode] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [location, setLocation] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<string | number>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [pixKey, setPixKey] = useState(defaultPixKey);
  const [status, setStatus] = useState<'PAGO' | 'PENDENTE'>('PAGO');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (documentToEdit) {
      setCode(documentToEdit.code);
      setIssueDate(documentToEdit.issue_date);
      setSelectedClient(documentToEdit.client || null);
      setLocation(documentToEdit.location || '');
      setTotalAmount(documentToEdit.total_amount);
      setPaymentMethod(documentToEdit.payment_method || 'PIX');
      setPixKey(documentToEdit.pix_key_snapshot || defaultPixKey);
      setStatus(documentToEdit.status as any || 'PAGO');

      if (documentToEdit.items && documentToEdit.items.length > 0) {
        setServiceDescription(documentToEdit.items.map((i) => i.title).join('; '));
      } else {
        setServiceDescription(documentToEdit.notes || '');
      }
    } else {
      getNextCode('RECIBO').then((nextCode) => setCode(nextCode));
      setIssueDate(new Date().toISOString().split('T')[0]);
      setSelectedClient(null);
      setLocation('');
      setServiceDescription('');
      setTotalAmount('');
      setPaymentMethod('PIX');
      setPixKey(defaultPixKey);
      setStatus('PAGO');
    }
    setError(null);
  }, [isOpen, documentToEdit, defaultPixKey]);

  if (!isOpen) return null;

  const handleSubmit = async (openPreview: boolean = false) => {
    if (!selectedClient) {
      setError('Por favor, selecione ou cadastre um cliente.');
      return;
    }
    if (!serviceDescription.trim()) {
      setError('Por favor, descreva o serviço realizado.');
      return;
    }
    const valor = parseFloat(String(totalAmount)) || 0;
    if (valor <= 0) {
      setError('O valor do serviço deve ser maior que zero.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const itemToSave = [
        {
          title: serviceDescription.trim(),
          object_description: null,
          material_cost: 0,
          labor_cost: valor,
          total_cost: valor,
        },
      ];

      let savedDoc: DocumentType;
      if (documentToEdit) {
        savedDoc = await updateDocumentRecord(
          documentToEdit.id,
          {
            client_id: selectedClient.id,
            code,
            issue_date: issueDate,
            location: location || null,
            status,
            payment_method: paymentMethod,
            total_amount: valor,
            notes: serviceDescription,
          },
          itemToSave
        );
      } else {
        savedDoc = await createDocumentRecord(
          {
            client_id: selectedClient.id,
            document_type: 'RECIBO',
            code,
            issue_date: issueDate,
            location: location || null,
            status,
            payment_method: paymentMethod,
            pix_key_snapshot: pixKey,
            total_amount: valor,
            notes: serviceDescription,
          },
          itemToSave
        );
      }

      savedDoc.client = selectedClient;
      onSaved(savedDoc, openPreview);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar recibo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-avi-green text-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="w-5 h-5 text-orange-400 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base truncate">
              {documentToEdit ? `Editar Recibo — ${code}` : 'Novo Recibo de Prestação de Serviços'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-4 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dados Gerais: Número e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Número do Recibo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-avi-orange focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Data do Recibo / Quitação
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cliente e Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ClientAutocomplete
              clients={clients}
              selectedClient={selectedClient}
              onSelectClient={(client) => {
                setSelectedClient(client);
                if (client.default_location && !location) {
                  setLocation(client.default_location);
                }
              }}
              onClientCreated={onClientCreated}
            />

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Local do Imóvel <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Apto 301, Bloco 1 - Waldgarten"
                  className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Descrição do Serviço Realizado */}
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Serviço Realizado <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Ex: Regulagem de fecho e trava da porta de correr"
              className="w-full min-w-0 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
            />
          </div>

          {/* Valor do Serviço em Destaque */}
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-2 min-w-0">
            <label className="block text-xs font-bold text-avi-orange uppercase tracking-wider">
              Valor do Serviço (R$) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none font-bold text-gray-500 text-sm">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="100,00"
                className="w-full min-w-0 pl-10 pr-3 py-2.5 bg-white border border-orange-300 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-avi-orange"
              />
            </div>
          </div>

          {/* Forma de Pagamento & Chave PIX */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 min-w-0">
            <label className="block text-xs font-semibold text-gray-700">
              Forma de Pagamento
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

            {paymentMethod === 'PIX' && (
              <div className="min-w-0">
                <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                  Chave PIX que sairá no recibo
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-avi-green"
                />
              </div>
            )}
          </div>
        </div>

        {/* Rodapé de Ações do Modal */}
        <div className="p-3.5 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSubmit(false)}
              className="px-3.5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 active:scale-95 rounded-xl shadow-sm transition-all"
            >
              Salvar
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-semibold text-white bg-avi-orange hover:bg-avi-orange-dark active:scale-95 rounded-xl shadow-md transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>Salvar e Ver PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
