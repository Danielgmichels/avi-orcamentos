import * as XLSX from 'xlsx';
import { Document as DocumentType } from '@/types/database';
import { formatDate } from './formatters';

export function exportDocumentsToExcel(documents: DocumentType[], filenamePrefix = 'Relatorio_AVI') {
  const rows = documents.map((doc) => {
    // Monta serviços em texto
    const servicosTexto =
      doc.items && doc.items.length > 0
        ? doc.items.map((i) => i.title).join(' | ')
        : doc.notes || '';

    return {
      Código: doc.code,
      Tipo: doc.document_type === 'ORCAMENTO' ? 'Orçamento' : 'Recibo',
      Data: formatDate(doc.issue_date),
      Cliente: doc.client?.name || 'Não informado',
      'Telefone Cliente': doc.client?.phone || '',
      'Local / Imóvel': doc.location || '',
      'Serviços Realizados': servicosTexto,
      Status: doc.status,
      'Forma de Pagamento': doc.payment_method || '-',
      'Valor Total (R$)': Number(doc.total_amount) || 0,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ajusta larguras das colunas
  worksheet['!cols'] = [
    { wch: 14 }, // Código
    { wch: 12 }, // Tipo
    { wch: 12 }, // Data
    { wch: 25 }, // Cliente
    { wch: 18 }, // Telefone
    { wch: 30 }, // Local
    { wch: 40 }, // Serviços
    { wch: 12 }, // Status
    { wch: 18 }, // Pagamento
    { wch: 16 }, // Valor
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Documentos');

  const dateStr = new Date().toISOString().slice(0, 7); // AAAA-MM
  const fullFilename = `${filenamePrefix}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, fullFilename);
}
