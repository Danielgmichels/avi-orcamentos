'use client';

import React from 'react';
import { Document as DocumentType } from '@/types/database';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { getLinkedRecibos, getOriginDocument } from '@/utils/documentStats';
import {
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Edit3,
  Eye,
  Link2,
  Loader2,
  Trash2,
} from 'lucide-react';

interface DocumentCardProps {
  doc: DocumentType;
  allDocuments: DocumentType[];
  showClientName?: boolean;
  approvingId?: string | null;
  onApprove: (doc: DocumentType) => void;
  onConvert: (doc: DocumentType) => void;
  onOpenPDF: (doc: DocumentType) => void;
  onEdit: (doc: DocumentType) => void;
  onDelete: (id: string, code: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  allDocuments,
  showClientName = true,
  approvingId,
  onApprove,
  onConvert,
  onOpenPDF,
  onEdit,
  onDelete,
}) => {
  const isOrcamento = doc.document_type === 'ORCAMENTO';
  const linkedRecibos = isOrcamento ? getLinkedRecibos(doc.id, allDocuments) : [];
  const originDoc = !isOrcamento ? getOriginDocument(doc, allDocuments) : undefined;
  const isApproving = approvingId === doc.id;

  const statusBadgeClass =
    doc.status === 'PAGO'
      ? 'bg-emerald-100 text-emerald-800'
      : doc.status === 'APROVADO'
      ? 'bg-blue-100 text-blue-800'
      : doc.status === 'RECUSADO'
      ? 'bg-red-100 text-red-800'
      : 'bg-amber-100 text-amber-800';

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Lado Esquerdo: Identificação & Detalhes */}
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
            isOrcamento
              ? 'bg-emerald-50 text-avi-green'
              : 'bg-orange-50 text-avi-orange'
          }`}
        >
          {isOrcamento ? 'ORC' : 'REC'}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {showClientName && (
              <span className="font-bold text-sm text-gray-900 truncate">
                {doc.client?.name || 'Cliente'}
              </span>
            )}

            <span className="text-xs font-bold text-gray-700 shrink-0">
              {doc.code}
            </span>

            {/* Status Badge */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${statusBadgeClass}`}
            >
              {doc.status}
              {doc.payment_method ? ` (${doc.payment_method})` : ''}
            </span>

            {/* Ligação Orçamento -> Recibo(s) gerado(s) */}
            {isOrcamento &&
              linkedRecibos.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => onOpenPDF(rec)}
                  title={`Abrir PDF do recibo ${rec.code} gerado a partir deste orçamento`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0"
                >
                  <Link2 className="w-3 h-3" />
                  <span>Gerou {rec.code}</span>
                </button>
              ))}

            {/* Ligação Recibo -> Orçamento de origem */}
            {!isOrcamento && originDoc && (
              <button
                type="button"
                onClick={() => onOpenPDF(originDoc)}
                title={`Abrir PDF do orçamento de origem ${originDoc.code}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shrink-0"
              >
                <Link2 className="w-3 h-3" />
                <span>Ref. {originDoc.code}</span>
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 truncate">
            {doc.items && doc.items.length > 0
              ? doc.items[0].title
              : doc.notes || 'Sem descrição'}
            {doc.location ? ` • ${doc.location}` : ''}
          </p>

          <p className="text-[11px] text-gray-400">
            Emitido em: {formatDate(doc.issue_date)}
          </p>
        </div>
      </div>

      {/* Lado Direito: Valor & Ações */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0">
        <div className="text-left sm:text-right">
          <span className="block font-bold text-sm text-gray-900">
            {formatCurrency(doc.total_amount)}
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-1.5">
          {/* Fluxo do Orçamento: Pendente -> Aprovar | Aprovado -> Gerar Recibo | Já convertido -> Ver Recibo */}
          {isOrcamento && linkedRecibos.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenPDF(linkedRecibos[0])}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-colors"
              title={`Recibo ${linkedRecibos[0].code} já emitido — clique para visualizar PDF`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Recibo</span>
              <span className="sm:hidden">Recibo</span>
            </button>
          )}

          {isOrcamento && linkedRecibos.length === 0 && doc.status === 'PENDENTE' && (
            <button
              type="button"
              disabled={isApproving}
              onClick={() => onApprove(doc)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs transition-colors disabled:opacity-60"
              title="Aprovar este orçamento com 1 clique"
            >
              {isApproving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Aprovar</span>
            </button>
          )}

          {isOrcamento && linkedRecibos.length === 0 && doc.status === 'APROVADO' && (
            <button
              type="button"
              onClick={() => onConvert(doc)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-avi-orange border border-orange-200 font-semibold text-xs transition-colors"
              title="Converter Orçamento em Recibo Quitado"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gerar Recibo</span>
              <span className="sm:hidden">Recibo</span>
            </button>
          )}

          {/* Visualizar PDF */}
          <button
            type="button"
            onClick={() => onOpenPDF(doc)}
            className="p-2 rounded-xl text-gray-600 hover:text-avi-green hover:bg-white border border-gray-200 transition-colors"
            title="Visualizar e Enviar PDF no WhatsApp"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Editar */}
          <button
            type="button"
            onClick={() => onEdit(doc)}
            className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-white border border-gray-200 transition-colors"
            title="Editar Documento"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Excluir */}
          <button
            type="button"
            onClick={() => onDelete(doc.id, doc.code)}
            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-white border border-gray-200 transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
