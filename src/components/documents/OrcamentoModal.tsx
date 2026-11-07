'use client';

import React, { useState, useEffect } from 'react';
import { Client, Document as DocumentType } from '@/types/database';
import { getNextCode, createDocumentRecord, updateDocumentRecord } from '@/lib/services/documents';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { formatCurrency } from '@/utils/formatters';
import { 
  X, 
  FileText, 
  Plus, 
  Trash2, 
  Loader2, 
  Eye, 
  Calendar, 
  MapPin, 
  Hash,
  AlertCircle
} from 'lucide-react';

interface OrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (doc: DocumentType, openPreview?: boolean) => void;
  clients: Client[];
  onClientCreated: (client: Client) => void;
  documentToEdit?: DocumentType | null;
}

export const OrcamentoModal: React.FC<OrcamentoModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  clients,
  onClientCreated,
  documentToEdit,
}) => {
  const [code, setCode] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState(
    'Observação: Este documento apresenta os valores referentes aos serviços e à composição de material e mão de obra descritos acima.'
  );
  const [status, setStatus] = useState<'PENDENTE' | 'APROVADO' | 'RECUSADO'>('PENDENTE');

  const [items, setItems] = useState<
    Array<{
      title: string;
      object_description: string;
      material_cost: number | string;
      labor_cost: number | string;
      total_cost: number;
    }>
  >([
    {
      title: 'SERVIÇO 01 — ',
      object_description: '',
      material_cost: '',
      labor_cost: '',
      total_cost: 0,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa dados para edição ou novo
  useEffect(() => {
    if (!isOpen) return;

    if (documentToEdit) {
      setCode(documentToEdit.code);
      setIssueDate(documentToEdit.issue_date);
      setSelectedClient(documentToEdit.client || null);
      setLocation(documentToEdit.location || '');
      setNotes(documentToEdit.notes || '');
      setStatus(documentToEdit.status as any);

      if (documentToEdit.items && documentToEdit.items.length > 0) {
        setItems(
          documentToEdit.items.map((i) => ({
            title: i.title,
            object_description: i.object_description || '',
            material_cost: i.material_cost || '',
            labor_cost: i.labor_cost || '',
            total_cost: i.total_cost || 0,
          }))
        );
      }
    } else {
      getNextCode('ORCAMENTO').then((nextCode) => setCode(nextCode));
      setIssueDate(new Date().toISOString().split('T')[0]);
      setSelectedClient(null);
      setLocation('');
      setNotes(
        'Observação: Este documento apresenta os valores referentes aos serviços e à composição de material e mão de obra descritos acima.'
      );
      setStatus('PENDENTE');
      setItems([
        {
          title: 'SERVIÇO 01 — ',
          object_description: '',
          material_cost: '',
          labor_cost: '',
          total_cost: 0,
        },
      ]);
    }
    setError(null);
  }, [isOpen, documentToEdit]);

  if (!isOpen) return null;

  // Atualiza um item dinâmico
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    const mat = parseFloat(String(item.material_cost)) || 0;
    const lab = parseFloat(String(item.labor_cost)) || 0;
    item.total_cost = mat + lab;

    updated[index] = item;
    setItems(updated);
  };

  // Adiciona novo item de serviço
  const handleAddItem = () => {
    const nextNum = items.length + 1;
    setItems([
      ...items,
      {
        title: `SERVIÇO ${String(nextNum).padStart(2, '0')} — `,
        object_description: '',
        material_cost: '',
        labor_cost: '',
        total_cost: 0,
      },
    ]);
  };

  // Remove um item
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Total geral
  const totalGeral = items.reduce((acc, curr) => acc + (curr.total_cost || 0), 0);

  const handleSubmit = async (openPreview: boolean = false) => {
    if (!selectedClient) {
      setError('Por favor, selecione ou cadastre um cliente.');
      return;
    }
    if (items.some((i) => !i.title.trim())) {
      setError('Todos os serviços precisam ter um título.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const itemsToSave = items.map((i) => ({
        title: i.title,
        object_description: i.object_description || null,
        material_cost: parseFloat(String(i.material_cost)) || 0,
        labor_cost: parseFloat(String(i.labor_cost)) || 0,
        total_cost: i.total_cost,
      }));

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
            total_amount: totalGeral,
            notes,
          },
          itemsToSave
        );
      } else {
        savedDoc = await createDocumentRecord(
          {
            client_id: selectedClient.id,
            document_type: 'ORCAMENTO',
            code,
            issue_date: issueDate,
            location: location || null,
            status,
            total_amount: totalGeral,
            notes,
          },
          itemsToSave
        );
      }

      savedDoc.client = selectedClient;
      onSaved(savedDoc, openPreview);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha ao salvar orçamento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-avi-green text-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-emerald-300 shrink-0" />
            <h3 className="font-bold text-sm sm:text-base truncate">
              {documentToEdit ? `Editar Orçamento — ${code}` : 'Novo Orçamento (Proposta Comercial)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-4 sm:space-y-5 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dados Gerais: Número, Data e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Número do Orçamento
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
                  className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-avi-green focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Data da Proposta
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

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Status da Proposta
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="RECUSADO">Recusado</option>
              </select>
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
                Local do Imóvel / Obra <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Res. Waldgarten - Apto 402, Bloco 2"
                  className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Seção Dinâmica de Serviços */}
          <div className="pt-2 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Serviços & Itens da Proposta
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-avi-green bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Serviço</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-avi-green">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Remover serviço"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={item.title}
                      onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                      placeholder="Ex: SERVIÇO 01 — TROCA ROLO PERSIANA"
                      className="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-avi-green"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.object_description}
                      onChange={(e) => handleItemChange(idx, 'object_description', e.target.value)}
                      placeholder="Especificação / Objeto (Ex: 45X PALHETA PRETA + PRESILHAS)"
                      className="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green"
                    />
                  </div>

                  {/* Custos Responsivos: 2 colunas no celular e 3 no desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="min-w-0">
                      <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                        Material (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.material_cost}
                        onChange={(e) => handleItemChange(idx, 'material_cost', e.target.value)}
                        placeholder="0,00"
                        className="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green text-right font-medium"
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                        Mão de Obra (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.labor_cost}
                        onChange={(e) => handleItemChange(idx, 'labor_cost', e.target.value)}
                        placeholder="0,00"
                        className="w-full min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green text-right font-medium"
                      />
                    </div>

                    {/* Subtotal Item: ocupa as 2 colunas no celular e 1 no desktop */}
                    <div className="col-span-2 sm:col-span-1 min-w-0 flex sm:flex-col justify-between sm:justify-end items-center sm:items-end bg-emerald-50/80 border border-emerald-100 rounded-xl px-3 py-2">
                      <span className="text-[11px] font-medium text-emerald-800">
                        Subtotal Item:
                      </span>
                      <span className="text-sm font-bold text-avi-green">
                        {formatCurrency(item.total_cost)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destaque do Total Geral */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div>
              <span className="text-xs font-semibold text-emerald-800">
                TOTAL GERAL DA PROPOSTA
              </span>
              <p className="text-[11px] text-emerald-600">Soma de materiais e serviços</p>
            </div>
            <span className="text-xl font-bold text-avi-green">
              {formatCurrency(totalGeral)}
            </span>
          </div>

          {/* Observações */}
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Observações no Rodapé do Orçamento
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-w-0 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
            />
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
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs font-semibold text-white bg-avi-green hover:bg-avi-green-light active:scale-95 rounded-xl shadow-md transition-all disabled:opacity-70"
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
