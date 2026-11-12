'use client';

import React from 'react';
import { CheckCircle2, Clock, FileCheck, X } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { FinancialSummary, StatusFilterValue } from '@/utils/documentStats';

interface FinancialSummaryCardsProps {
  summary: FinancialSummary;
  statusFilter: StatusFilterValue;
  onToggleStatusFilter: (status: 'PAGO' | 'APROVADO' | 'PENDENTE') => void;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  summary,
  statusFilter,
  onToggleStatusFilter,
}) => {
  const cards = [
    {
      status: 'PAGO' as const,
      label: 'Recebido',
      title: 'Filtrar por orçamentos/recibos quitados',
      value: summary.totalPago,
      subtitle: `${summary.docsPago.length} ${summary.docsPago.length === 1 ? 'quitado' : 'quitados'}`,
      Icon: CheckCircle2,
      activeBoxClass: 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500 shadow-sm',
      idleBoxClass: 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm',
      labelClass: 'text-emerald-800',
      valueClass: 'text-gray-900',
      iconClass: statusFilter === 'PAGO' ? 'text-emerald-600' : 'text-emerald-500',
      badgeClass: 'text-emerald-700 bg-emerald-100',
    },
    {
      status: 'APROVADO' as const,
      label: 'Aprovados',
      title: 'Filtrar por orçamentos aprovados (a executar)',
      value: summary.totalAprovado,
      subtitle: `${summary.docsAprovadoPendentes.length} a executar`,
      Icon: FileCheck,
      activeBoxClass: 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500 shadow-sm',
      idleBoxClass: 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm',
      labelClass: 'text-blue-800',
      valueClass: 'text-blue-700',
      iconClass: statusFilter === 'APROVADO' ? 'text-blue-600' : 'text-blue-500',
      badgeClass: 'text-blue-700 bg-blue-100',
    },
    {
      status: 'PENDENTE' as const,
      label: 'Aguardando confirmação',
      title: 'Filtrar por propostas pendentes em análise',
      value: summary.totalPendente,
      subtitle: `${summary.docsPendente.length} em análise`,
      Icon: Clock,
      activeBoxClass: 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500 shadow-sm',
      idleBoxClass: 'bg-white border-gray-200 hover:border-amber-300 hover:shadow-sm',
      labelClass: 'text-amber-800',
      valueClass: 'text-amber-600',
      iconClass: statusFilter === 'PENDENTE' ? 'text-amber-600' : 'text-amber-500',
      badgeClass: 'text-amber-700 bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {cards.map((card) => {
        const isActive = statusFilter === card.status;
        const Icon = card.Icon;

        return (
          <button
            key={card.status}
            type="button"
            onClick={() => onToggleStatusFilter(card.status)}
            title={card.title}
            className={`p-2.5 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden group active:scale-[0.98] ${
              isActive ? card.activeBoxClass : card.idleBoxClass
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 text-[11px] sm:text-xs mb-1">
              <span className={`font-semibold truncate ${card.labelClass}`}>{card.label}</span>
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${card.iconClass}`} />
            </div>
            <div
              className={`text-xs sm:text-lg md:text-xl font-black truncate ${card.valueClass}`}
              title={formatCurrency(card.value)}
            >
              {formatCurrency(card.value)}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">{card.subtitle}</p>
              {isActive && (
                <span
                  className={`hidden sm:inline-block text-[9px] font-bold px-1 rounded shrink-0 ${card.badgeClass}`}
                >
                  Filtrado
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

interface StatusFilterBannerProps {
  statusFilter: StatusFilterValue;
  resultCount: number;
  onClear: () => void;
}

const FILTER_META: Record<
  Exclude<StatusFilterValue, 'TODOS'>,
  { label: string; pillClass: string }
> = {
  PAGO: { label: 'RECEBIDO / PAGO', pillClass: 'bg-emerald-100 text-emerald-800' },
  APROVADO: { label: 'APROVADO', pillClass: 'bg-blue-100 text-blue-800' },
  PENDENTE: { label: 'AGUARDANDO CONFIRMAÇÃO', pillClass: 'bg-amber-100 text-amber-800' },
};

export const StatusFilterBanner: React.FC<StatusFilterBannerProps> = ({
  statusFilter,
  resultCount,
  onClear,
}) => {
  if (statusFilter === 'TODOS') return null;
  const meta = FILTER_META[statusFilter];

  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-gray-500">Filtrando por status:</span>
        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${meta.pillClass}`}>
          {meta.label}
        </span>
        <span className="text-gray-400">
          ({resultCount} {resultCount === 1 ? 'encontrado' : 'encontrados'})
        </span>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-red-600 transition-colors shrink-0 ml-2"
      >
        <X className="w-3.5 h-3.5" />
        <span>Limpar filtro</span>
      </button>
    </div>
  );
};
