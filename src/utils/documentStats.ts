import { Document as DocumentType } from '@/types/database';

/**
 * Retorna todos os recibos gerados a partir de um orçamento específico.
 */
export function getLinkedRecibos(
  orcamentoId: string,
  allDocuments: DocumentType[]
): DocumentType[] {
  return allDocuments.filter(
    (d) => d.document_type === 'RECIBO' && d.origin_document_id === orcamentoId
  );
}

/**
 * Retorna o orçamento de origem de um recibo, quando existir.
 */
export function getOriginDocument(
  doc: DocumentType,
  allDocuments: DocumentType[]
): DocumentType | undefined {
  if (!doc.origin_document_id) return undefined;
  return allDocuments.find((d) => d.id === doc.origin_document_id);
}

/**
 * Verifica se um orçamento já possui pelo menos um recibo pago vinculado.
 */
export function hasLinkedPaidReceipt(
  doc: DocumentType,
  allDocuments: DocumentType[]
): boolean {
  if (doc.document_type !== 'ORCAMENTO') return false;
  return allDocuments.some(
    (other) =>
      other.document_type === 'RECIBO' &&
      other.origin_document_id === doc.id &&
      other.status === 'PAGO'
  );
}

export interface FinancialSummary {
  docsPago: DocumentType[];
  /** Orçamentos APROVADOS que ainda não possuem recibo pago vinculado (a executar/faturar) */
  docsAprovadoPendentes: DocumentType[];
  /** Todos os documentos com status APROVADO (histórico completo de aprovações) */
  docsAprovadoTotal: DocumentType[];
  docsPendente: DocumentType[];
  docsRecusado: DocumentType[];
  totalPago: number;
  totalAprovado: number;
  totalPendente: number;
}

/**
 * Calcula métricas financeiras evitando dupla contagem quando um orçamento aprovado
 * já foi convertido em um recibo pago.
 */
export function calculateFinancialSummary(
  subsetDocs: DocumentType[],
  allDocuments: DocumentType[] = subsetDocs
): FinancialSummary {
  const docsPago = subsetDocs.filter((d) => d.status === 'PAGO');
  const docsAprovadoTotal = subsetDocs.filter((d) => d.status === 'APROVADO');
  const docsAprovadoPendentes = docsAprovadoTotal.filter(
    (d) => !hasLinkedPaidReceipt(d, allDocuments)
  );
  const docsPendente = subsetDocs.filter((d) => d.status === 'PENDENTE');
  const docsRecusado = subsetDocs.filter((d) => d.status === 'RECUSADO');

  const sumAmount = (list: DocumentType[]) =>
    list.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  return {
    docsPago,
    docsAprovadoPendentes,
    docsAprovadoTotal,
    docsPendente,
    docsRecusado,
    totalPago: sumAmount(docsPago),
    totalAprovado: sumAmount(docsAprovadoPendentes),
    totalPendente: sumAmount(docsPendente),
  };
}

export type StatusFilterValue = 'TODOS' | 'PAGO' | 'APROVADO' | 'PENDENTE';

/**
 * Filtra uma lista de documentos por aba (tipo), card financeiro (status) e busca textual.
 */
export function filterDocuments(
  subsetDocs: DocumentType[],
  allDocuments: DocumentType[],
  options: {
    tab: 'TODOS' | 'ORCAMENTO' | 'RECIBO';
    statusFilter: StatusFilterValue;
    searchTerm: string;
  }
): DocumentType[] {
  const s = options.searchTerm.trim().toLowerCase();

  return subsetDocs.filter((doc) => {
    const matchesTab = options.tab === 'TODOS' || doc.document_type === options.tab;
    const matchesStatus =
      options.statusFilter === 'TODOS'
        ? true
        : options.statusFilter === 'APROVADO'
        ? doc.status === 'APROVADO' && !hasLinkedPaidReceipt(doc, allDocuments)
        : doc.status === options.statusFilter;
    const matchesSearch =
      !s ||
      doc.code.toLowerCase().includes(s) ||
      doc.client?.name?.toLowerCase().includes(s) ||
      doc.location?.toLowerCase().includes(s) ||
      (doc.items && doc.items.some((i) => i.title.toLowerCase().includes(s))) ||
      doc.notes?.toLowerCase().includes(s);

    return matchesTab && matchesStatus && matchesSearch;
  });
}
