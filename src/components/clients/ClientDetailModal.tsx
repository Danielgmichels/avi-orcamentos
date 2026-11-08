'use client';

import React, { useState } from 'react';
import { Client, Document as DocumentType, Profile } from '@/types/database';
import { formatCurrency, formatDate, formatPhone } from '@/utils/formatters';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  FileBadge,
  FileText,
  Receipt,
  Eye,
  Edit3,
  Trash2,
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  FileCheck,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  documents: DocumentType[];
  profile: Profile | null;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onNewOrcamento: (client: Client) => void;
  onNewRecibo: (client: Client) => void;
  onOpenPDF: (doc: DocumentType) => void;
  onEditDoc: (doc: DocumentType) => void;
  onConvertDoc: (doc: DocumentType) => void;
  onDeleteDoc: (id: string, code: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  documents,
  profile,
  onEditClient,
  onDeleteClient,
  onNewOrcamento,
  onNewRecibo,
  onOpenPDF,
  onEditDoc,
  onConvertDoc,
  onDeleteDoc,
}) => {
  const [docTab, setDocTab] = useState<'TODOS' | 'ORCAMENTO' | 'RECIBO'>('TODOS');
  const [docSearch, setDocSearch] = useState('');

  if (!isOpen || !client) return null;

  // Documentos deste cliente
  const clientDocs = documents.filter((d) => d.client_id === client.id);

  // Cálculos financeiros do cliente
  const docsPago = clientDocs.filter((d) => d.status === 'PAGO');
  const docsAprovado = clientDocs.filter((d) => d.status === 'APROVADO');
  const docsPendente = clientDocs.filter((d) => d.status === 'PENDENTE');
  const docsRecusado = clientDocs.filter((d) => d.status === 'RECUSADO');

  const totalPago = docsPago.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const totalAprovado = docsAprovado.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const totalPendente = docsPendente.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  // Filtragem na lista de documentos do cliente
  const filteredDocs = clientDocs.filter((doc) => {
    const matchesTab = docTab === 'TODOS' || doc.document_type === docTab;
    const s = docSearch.toLowerCase();
    const matchesSearch =
      !docSearch ||
      doc.code.toLowerCase().includes(s) ||
      doc.location?.toLowerCase().includes(s) ||
      (doc.items && doc.items.some((i) => i.title.toLowerCase().includes(s))) ||
      doc.notes?.toLowerCase().includes(s);
    return matchesTab && matchesSearch;
  });

  // Link WhatsApp direto
  const phoneDigits = client.phone ? client.phone.replace(/\D/g, '') : '';
  const waNumber = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
  const whatsappUrl = phoneDigits
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        `Olá ${client.name}, tudo bem? Aqui é o Lucas da AVI Alumínios e Vidros.`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="px-5 py-4 bg-avi-green text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center font-black text-emerald-300 text-base">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight truncate max-w-xs sm:max-w-md">
                  {client.name}
                </h3>
                <span className="text-[11px] text-emerald-200">
                  {clientDocs.length} {clientDocs.length === 1 ? 'documento emitido' : 'documentos emitidos'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Card de Informações de Contato e Ações Rápidas */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
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

            {/* Ações de Contato & Cadastro */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Conversar no WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => onEditClient(client)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Editar Dados</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteClient(client)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold text-xs border border-gray-200 transition-colors ml-auto"
                title="Excluir cliente"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas Financeiras deste Cliente */}
          <div>
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Resumo Financeiro do Cliente
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {/* Quitado */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 mb-1">
                  <span>Recebido</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xs sm:text-base font-extrabold text-gray-900 truncate" title={formatCurrency(totalPago)}>
                  {formatCurrency(totalPago)}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {docsPago.length} {docsPago.length === 1 ? 'quitado' : 'quitados'}
                </p>
              </div>

              {/* Aprovado */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                <div className="flex items-center justify-between text-[11px] font-semibold text-blue-800 mb-1">
                  <span>Aprovados</span>
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-xs sm:text-base font-extrabold text-blue-700 truncate" title={formatCurrency(totalAprovado)}>
                  {formatCurrency(totalAprovado)}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {docsAprovado.length} {docsAprovado.length === 1 ? 'a executar' : 'a executar'}
                </p>
              </div>

              {/* Aguardando / Pendente */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 mb-1">
                  <span>Aguardando</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-xs sm:text-base font-extrabold text-amber-600 truncate" title={formatCurrency(totalPendente)}>
                  {formatCurrency(totalPendente)}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {docsPendente.length} {docsPendente.length === 1 ? 'em análise' : 'em análise'}
                </p>
              </div>
            </div>
          </div>

          {/* Seção Histórico de Documentos do Cliente */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Documentos ({clientDocs.length})
              </h4>

              {/* Botões rápidos para novo documento */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNewOrcamento(client)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-avi-green hover:bg-avi-green-light transition-all shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>Orçamento</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNewRecibo(client)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-avi-orange bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>Recibo</span>
                </button>
              </div>
            </div>

            {/* Abas e Busca dentro do histórico do cliente */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDocTab('TODOS')}
                  className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
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
                  className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
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
                  className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    docTab === 'RECIBO'
                      ? 'bg-white text-avi-orange shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Recibos
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Buscar nos documentos..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green"
                />
              </div>
            </div>

            {/* Lista de Documentos */}
            {filteredDocs.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                <p className="text-xs">Nenhum documento encontrado para este filtro.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredDocs.map((doc) => {
                  const isOrc = doc.document_type === 'ORCAMENTO';

                  return (
                    <div
                      key={doc.id}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOrc ? 'bg-emerald-50 text-avi-green' : 'bg-orange-50 text-avi-orange'
                          }`}
                        >
                          {isOrc ? 'ORC' : 'REC'}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-gray-900">{doc.code}</span>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-semibold shrink-0 ${
                                doc.status === 'PAGO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.status === 'APROVADO'
                                  ? 'bg-blue-100 text-blue-800'
                                  : doc.status === 'RECUSADO'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doc.status}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {formatDate(doc.issue_date)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 truncate">
                            {doc.items && doc.items.length > 0
                              ? doc.items[0].title
                              : doc.notes || 'Sem descrição'}
                          </p>
                        </div>
                      </div>

                      {/* Valor e Ações */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
                        <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                          {formatCurrency(doc.total_amount)}
                        </span>

                        <div className="flex items-center gap-1">
                          {isOrc && doc.status !== 'RECUSADO' && (
                            <button
                              type="button"
                              onClick={() => onConvertDoc(doc)}
                              className="p-1.5 rounded-lg bg-orange-50 text-avi-orange hover:bg-orange-100 transition-colors"
                              title="Converter em Recibo Quitado"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onOpenPDF(doc)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-avi-green hover:bg-gray-100 border border-gray-200 transition-colors"
                            title="Visualizar PDF e Enviar"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEditDoc(doc)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteDoc(doc.id, doc.code)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={() => onNewOrcamento(client)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-avi-green hover:bg-avi-green-light rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
