import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Document as DocumentType, Profile } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 35,
    paddingHorizontal: 45,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 155,
    height: 90,
    objectFit: 'contain',
  },
  topDivider: {
    width: '100%',
    height: 4,
    backgroundColor: '#D9531E',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#14452F',
    textAlign: 'center',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#111827',
  },
  docCodeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    color: '#14452F',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardTopBarGreen: {
    height: 7,
    backgroundColor: '#14452F',
    width: '100%',
  },
  cardContent: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#111827',
    marginRight: 6,
  },
  cardValue: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.3,
  },
  amountBox: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
    marginBottom: 12,
  },
  amountLabelCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#FDBA74',
    justifyContent: 'center',
  },
  amountLabelText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#14452F',
    letterSpacing: 0.5,
  },
  amountValueCell: {
    width: 140,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  amountValueText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#D9531E',
  },
  paymentBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkboxSquare: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#14452F',
  },
  checkboxLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
  },
  pixKeyText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#14452F',
  },
  declarationText: {
    fontSize: 8.5,
    color: '#374151',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 1.3,
  },
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    marginBottom: 20,
  },
  signatureBlock: {
    width: 180,
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#6B7280',
    marginBottom: 6,
  },
  signatureTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#374151',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    alignItems: 'center',
    gap: 2,
  },
  footerCompany: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#14452F',
    letterSpacing: 0.5,
  },
  footerSlogan: {
    fontSize: 7.5,
    color: '#4B5563',
    textAlign: 'center',
  },
  footerVerse: {
    fontSize: 7.5,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

interface ReciboPDFProps {
  document: DocumentType;
  profile?: Profile | null;
}

export const ReciboPDF: React.FC<ReciboPDFProps> = ({ document, profile }) => {
  const companyName = profile?.company_name || 'AVI ALUMÍNIOS E VIDROS';
  const slogan =
    profile?.slogan ||
    'Manutenções em vidros e alumínios • Instalações de esquadrias em geral • Telhados';
  const verse = profile?.verse || 'Seja forte e corajoso — Josué 1:9';
  const pixKey = document.pix_key_snapshot || profile?.pix_key || '47 99659-4199';

  const isPix = document.payment_method === 'PIX' || !document.payment_method;
  const isDinheiro = document.payment_method === 'DINHEIRO';

  // Consolidação dos serviços para exibição no recibo
  const servicosTexto =
    document.items && document.items.length > 0
      ? document.items.map((i) => i.title).join('; ')
      : document.notes || 'Serviços de manutenção e instalação';

  return (
    <Document title={`Recibo ${document.code} - ${document.client?.name || 'Cliente'}`}>
      <Page size="A4" style={styles.page}>
        {/* Logo Centralizado */}
        <View style={styles.logoContainer}>
          <Image src="/logo-avi.jpg" style={styles.logo} />
        </View>

        {/* Linha Decorativa Laranja */}
        <View style={styles.topDivider} />

        {/* Título Principal */}
        <Text style={styles.title}>RECIBO DE PRESTAÇÃO DE SERVIÇOS</Text>

        {/* Bloco de Data e Código */}
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>DATA: {formatDate(document.issue_date)}</Text>
          <Text style={styles.docCodeText}>Nº {document.code}</Text>
        </View>

        {/* Dados do Cliente */}
        <View style={styles.card}>
          <View style={styles.cardTopBarGreen} />
          <View style={styles.cardContent}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Nome / Razão Social:</Text>
              <Text style={styles.cardValue}>{document.client?.name || 'Não informado'}</Text>
            </View>
            {document.client?.tax_id ? (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>CPF / CNPJ:</Text>
                <Text style={styles.cardValue}>{document.client.tax_id}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Descrição do Serviço Realizado */}
        <View style={styles.card}>
          <View style={styles.cardTopBarGreen} />
          <View style={styles.cardContent}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Serviço realizado:</Text>
              <Text style={styles.cardValue}>{servicosTexto}</Text>
            </View>
            {document.location ? (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Local:</Text>
                <Text style={styles.cardValue}>{document.location}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Valor do Serviço em Destaque */}
        <View style={styles.amountBox}>
          <View style={styles.amountLabelCell}>
            <Text style={styles.amountLabelText}>VALOR DO SERVIÇO</Text>
          </View>
          <View style={styles.amountValueCell}>
            <Text style={styles.amountValueText}>{formatCurrency(document.total_amount)}</Text>
          </View>
        </View>

        {/* Forma de Pagamento e Chave PIX */}
        <View style={styles.paymentBox}>
          <View style={styles.paymentMethods}>
            <Text style={styles.cardLabel}>Forma de pagamento:</Text>
            <View style={styles.checkboxItem}>
              <View style={[styles.checkboxSquare, isPix ? styles.checkboxChecked : {}]} />
              <Text style={styles.checkboxLabel}>PIX</Text>
            </View>
            <View style={styles.checkboxItem}>
              <View style={[styles.checkboxSquare, isDinheiro ? styles.checkboxChecked : {}]} />
              <Text style={styles.checkboxLabel}>Dinheiro</Text>
            </View>
          </View>

          <Text style={styles.pixKeyText}>Chave PIX: {pixKey}</Text>
        </View>

        {/* Declaração Legal */}
        <Text style={styles.declarationText}>
          Declaro, para os devidos fins, que o valor acima corresponde ao serviço descrito neste recibo.
        </Text>

        {/* Linhas de Assinatura */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>{companyName}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTitle}>CLIENTE / RESPONSÁVEL</Text>
          </View>
        </View>

        {/* Rodapé Institucional */}
        <View style={styles.footer}>
          <Text style={styles.footerCompany}>{companyName}</Text>
          <Text style={styles.footerSlogan}>{slogan}</Text>
          <Text style={styles.footerVerse}>{verse}</Text>
        </View>
      </Page>
    </Document>
  );
};
