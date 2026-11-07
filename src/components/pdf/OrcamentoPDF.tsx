import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Document as DocumentType, Profile } from '@/types/database';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoContainer: {
    width: 130,
    height: 75,
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-start',
    width: 250,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#14452F',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: '#4B5563',
    marginBottom: 6,
  },
  headerMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  metaLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  clientBox: {
    borderTopWidth: 2,
    borderTopColor: '#D9531E',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 4,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientLabel: {
    width: 70,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#111827',
    textTransform: 'uppercase',
  },
  clientValue: {
    flex: 1,
    fontSize: 9,
    color: '#1F2937',
    textTransform: 'uppercase',
  },
  servicesSection: {
    marginBottom: 14,
  },
  serviceCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceHeaderBar: {
    backgroundColor: '#14452F',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  serviceHeaderText: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  serviceBody: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  serviceObjectRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  serviceObjectLabel: {
    width: 60,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#374151',
  },
  serviceObjectValue: {
    flex: 1,
    fontSize: 8.5,
    color: '#1F2937',
    textTransform: 'uppercase',
  },
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tableHeaderCol1: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#374151',
  },
  tableHeaderCol2: {
    width: 100,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tableRowCol1: {
    flex: 1,
    fontSize: 8.5,
    color: '#374151',
  },
  tableRowCol2: {
    width: 100,
    textAlign: 'right',
    fontSize: 8.5,
    color: '#1F2937',
  },
  tableRowTotal: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRowTotalCol1: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#111827',
  },
  tableRowTotalCol2: {
    width: 100,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#14452F',
  },
  totalGeneralBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#14452F',
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  totalGeneralLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#14452F',
    letterSpacing: 0.5,
  },
  totalGeneralValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: '#14452F',
  },
  notesBox: {
    borderLeftWidth: 3,
    borderLeftColor: '#D9531E',
    backgroundColor: '#FFF7ED',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  notesText: {
    fontSize: 8,
    color: '#7C2D12',
    lineHeight: 1.3,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerCompany: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#14452F',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerVerse: {
    fontSize: 8,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 7.5,
    color: '#9CA3AF',
  },
});

interface OrcamentoPDFProps {
  document: DocumentType;
  profile?: Profile | null;
}

export const OrcamentoPDF: React.FC<OrcamentoPDFProps> = ({ document, profile }) => {
  const companyName = profile?.company_name || 'AVI — ALUMÍNIOS E VIDROS';
  const verse = profile?.verse || 'Seja forte e corajoso — Josué 1:9';

  return (
    <Document title={`Orçamento ${document.code} - ${document.client?.name || 'Cliente'}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Imagem do Logo extraída em alta resolução */}
            <Image src="/logo-avi.jpg" style={styles.logo} />
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.title}>ORÇAMENTO</Text>
            <Text style={styles.subtitle}>Proposta comercial de serviços</Text>
            
            <View style={styles.headerMetaRow}>
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>Data: </Text>
                {formatDate(document.issue_date)}
              </Text>
              <Text style={styles.metaItem}>
                <Text style={styles.metaLabel}>Nº: </Text>
                {document.code}
              </Text>
            </View>
          </View>
        </View>

        {/* Dados do Cliente e Local */}
        <View style={styles.clientBox}>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Cliente:</Text>
            <Text style={styles.clientValue}>{document.client?.name || 'Não informado'}</Text>
          </View>
          {document.location ? (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Local:</Text>
              <Text style={styles.clientValue}>{document.location}</Text>
            </View>
          ) : null}
          {document.client?.tax_id ? (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>CPF/CNPJ:</Text>
              <Text style={styles.clientValue}>{document.client.tax_id}</Text>
            </View>
          ) : null}
        </View>

        {/* Lista Dinâmica de Serviços */}
        <View style={styles.servicesSection}>
          {document.items && document.items.length > 0 ? (
            document.items.map((item, idx) => (
              <View key={item.id || idx} style={styles.serviceCard} wrap={false}>
                {/* Faixa Verde com Título do Serviço */}
                <View style={styles.serviceHeaderBar}>
                  <Text style={styles.serviceHeaderText}>
                    {item.title || `SERVIÇO ${String(idx + 1).padStart(2, '0')}`}
                  </Text>
                </View>

                <View style={styles.serviceBody}>
                  {item.object_description ? (
                    <View style={styles.serviceObjectRow}>
                      <Text style={styles.serviceObjectLabel}>Objeto:</Text>
                      <Text style={styles.serviceObjectValue}>{item.object_description}</Text>
                    </View>
                  ) : null}

                  {/* Tabela de Composição de Custos */}
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.tableHeaderCol1}>Descrição</Text>
                      <Text style={styles.tableHeaderCol2}>Valor</Text>
                    </View>

                    {Number(item.material_cost) > 0 && (
                      <View style={styles.tableRow}>
                        <Text style={styles.tableRowCol1}>Material</Text>
                        <Text style={styles.tableRowCol2}>{formatCurrency(item.material_cost)}</Text>
                      </View>
                    )}

                    {Number(item.labor_cost) > 0 && (
                      <View style={styles.tableRow}>
                        <Text style={styles.tableRowCol1}>Mão de obra</Text>
                        <Text style={styles.tableRowCol2}>{formatCurrency(item.labor_cost)}</Text>
                      </View>
                    )}

                    <View style={styles.tableRowTotal}>
                      <Text style={styles.tableRowTotalCol1}>Total do serviço</Text>
                      <Text style={styles.tableRowTotalCol2}>{formatCurrency(item.total_cost)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.serviceCard}>
              <View style={styles.serviceHeaderBar}>
                <Text style={styles.serviceHeaderText}>SERVIÇO 01 — PRESTAÇÃO DE SERVIÇOS</Text>
              </View>
              <View style={styles.serviceBody}>
                <View style={styles.table}>
                  <View style={styles.tableRowTotal}>
                    <Text style={styles.tableRowTotalCol1}>Total do serviço</Text>
                    <Text style={styles.tableRowTotalCol2}>{formatCurrency(document.total_amount)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Total Geral do Orçamento */}
        <View style={styles.totalGeneralBox} wrap={false}>
          <Text style={styles.totalGeneralLabel}>TOTAL GERAL DO ORÇAMENTO</Text>
          <Text style={styles.totalGeneralValue}>{formatCurrency(document.total_amount)}</Text>
        </View>

        {/* Observações */}
        <View style={styles.notesBox} wrap={false}>
          <Text style={styles.notesText}>
            {document.notes ||
              'Observação: Este documento apresenta os valores referentes aos serviços e à composição de material e mão de obra descritos acima.'}
          </Text>
        </View>

        {/* Rodapé */}
        <View style={styles.footer} wrap={false}>
          <Text style={styles.footerCompany}>{companyName}</Text>
          <Text style={styles.footerVerse}>{verse}</Text>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};
