'use client';

import React, { useState } from 'react';
import { Client, Document as DocumentType } from '@/types/database';
import { formatPhone, getWhatsAppUrl } from '@/utils/formatters';
import {
  calculateFinancialSummary,
  filterDocuments,
  StatusFilterValue,
} from '@/utils/documentStats';
import { DocumentCard } from '@/components/documents/DocumentCard';
import {
  FinancialSummaryCards,
  StatusFilterBanner,
} from '@/components/documents/FinancialSummaryCards';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  FileBadge,
  FileText,
  Edit3,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';

interface ClientDetailViewProps {
  client: Client;
  documents: DocumentType[];
  approvingId?: string | null;
  onBack: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onNewOrcamento: (client: Client) => void;
  onNewRecibo: (client: Client) => void;
  onApproveDoc: (doc: DocumentType) => void;
  onConvertDoc: (doc: DocumentType) => void;
  onOpenPDF: (doc: DocumentType) => void;
  onEditDoc: (doc: DocumentType) => void;
  onDeleteDoc: (id: string, code: string) => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  client,
  documents,
  approvingId,
  onBack,
  onEditClient,
  onDeleteClient,
  onNewOrcamento,
  onNewRecibo,
  onApproveDoc,
  onConvertDoc,
  onOpenPDF,
  onEditDoc,
  onDeleteDoc,
}) => {
  const [docTab, setDocTab] = useState<'TODOS' | 'ORCAMENTO' | 'RECIBO'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('TODOS');
  const [docSearch, setDocSearch] = useState('');

  // Documentos deste cliente
  const clientDocs = documents.filter((d) => d.client_id === client.id);

  // Resumo financeiro evitando dupla contagem de orçamentos já pagos via recibo
  const financialSummary = calculateFinancialSummary(clientDocs, documents);

  const handleToggleStatusFilter = (status: 'PAGO' | 'APROVADO' | 'PENDENTE') => {
    setStatusFilter((prev) => (prev === status ? 'TODOS' : status));
  };

  // Filtragem na lista de documentos do cliente
  const filteredDocs = filterDocuments(clientDocs, documents, {
    tab: docTab,
    statusFilter,
    searchTerm: docSearch,
  });

  const whatsappUrl = getWhatsAppUrl(
    client.phone,
    `Olá ${client.name}, tudo bem? Aqui é o Lucas da AVI Alumínios e Vidros.`
  );

  return (
    <div className="space-y-4">
      {/* Barra de Retorno */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-gray-50 border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 shadow-sm transition-all active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4 text-avi-green" />
        <span>Voltar para lista de clientes</span>
      </button>

      {/* Cabeçalho & Dados Cadastrais do Cliente */}
      <section className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-avi-green text-emerald-300 font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                {client.name}
              </h2>
              <span className="text-xs text-gray-500">
                {clientDocs.length}{' '}
                {clientDocs.length === 1 ? 'documento emitido' : 'documentos emitidos'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onEditClient(client)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold text-xs border border-gray-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteClient(client)}
              className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 transition-colors"
              title="Excluir cliente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informações de Contato */}
        {(client.phone || client.tax_id || client.default_location) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600">
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium">{formatPhone(client.phone)}</span>
              </div>
            )}

            {client.tax_id && (
              <div className="flex items-center gap-2">
                <FileBadge className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>CPF/CNPJ: {client.tax_id}</span>
              </div>
            )}

            {client.default_location && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate">Local: {client.default_location}</span>
              </div>
            )}
          </div>
        )}

        {/* Ações Rápidas do Cliente */}
        <div className="flex flex-wrap items-center gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => onNewOrcamento(client)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-avi-green hover:bg-avi-green-light transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Orçamento</span>
          </button>

          <button
            type="button"
            onClick={() => onNewRecibo(client)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-avi-orange bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Recibo</span>
          </button>
        </div>

        {/* Cards de Resumo Financeiro do Cliente (interativos para filtrar) */}
        <div className="space-y-2.5 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Resumo Financeiro deste Cliente
            </h3>
            {statusFilter !== 'TODOS' && (
              <span className="hidden sm:inline text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Filtro ativo: {statusFilter}
              </span>
            )}
          </div>

          <FinancialSummaryCards
            summary={financialSummary}
            statusFilter={statusFilter}
            onToggleStatusFilter={handleToggleStatusFilter}
          />
        </div>
      </section>

      {/* Histórico Completo de Documentos deste Cliente */}
      <section className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDocTab('TODOS')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docTab === 'TODOS'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos ({clientDocs.length})
            </button>
            <button
              type="button"
              onClick={() => setDocTab('ORCAMENTO')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docTab === 'ORCAMENTO'
                  ? 'bg-white text-avi-green shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Orçamentos
            </button>
            <button
              type="button"
              onClick={() => setDocTab('RECIBO')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                docTab === 'RECIBO'
                  ? 'bg-white text-avi-orange shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Recibos
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={docSearch}
              onChange={(e) => setDocSearch(e.target.value)}
              placeholder="Buscar código, serviço..."
              className="w-full sm:w-56 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
            />
          </div>
        </div>

        <StatusFilterBanner
          statusFilter={statusFilter}
          resultCount={filteredDocs.length}
          onClear={() => setStatusFilter('TODOS')}
        />

        {filteredDocs.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
            <FileText className="w-7 h-7 mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-medium text-gray-600">
              Nenhum documento encontrado para este cliente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                allDocuments={documents}
                showClientName={false}
                approvingId={approvingId}
                onApprove={onApproveDoc}
                onConvert={onConvertDoc}
                onOpenPDF={onOpenPDF}
                onEdit={onEditDoc}
                onDelete={onDeleteDoc}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
