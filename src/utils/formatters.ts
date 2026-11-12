/**
 * Formata um número para o padrão monetário brasileiro (R$ 1.850,00)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formata uma data no formato brasileiro (DD/MM/AAAA)
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    const today = new Date();
    return today.toLocaleDateString('pt-BR');
  }

  // Trata formato YYYY-MM-DD sem distorção de fuso horário
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  const d = new Date(dateString);
  return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('pt-BR');
}

/**
 * Formata número de telefone para o padrão WhatsApp/BR: (47) 99659-4199
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Gera URL direta do WhatsApp (wa.me) com DDI 55 e mensagem opcional
 */
export function getWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  const waNumber = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${waNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
