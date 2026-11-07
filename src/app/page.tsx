'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, 
  Receipt, 
  Users, 
  Clock, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  ArrowRightLeft, 
  Edit3, 
  Trash2, 
  LogOut, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Building,
  UserPlus
} from 'lucide-react';
import { Document as DocumentType, Client, Profile } from '@/types/database';
import { getDocuments, deleteDocumentRecord } from '@/lib/services/documents';
import { getClients } from '@/lib/services/clients';
import { getCurrentProfile } from '@/lib/services/profile';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { exportDocumentsToExcel } from '@/utils/exportExcel';

// Modais importados
import { OrcamentoModal } from '@/components/documents/OrcamentoModal';
import { ReciboModal } from '@/components/documents/ReciboModal';
import { ConvertModal } from '@/components/documents/ConvertModal';
import { ClientModal } from '@/components/clients/ClientModal';

// Modal de PDF dinâmico para evitar SSR
const PDFPreviewModal = dynamic(
  () => import('@/components/pdf/PDFPreviewModal').then((mod) => mod.PDFPreviewModal),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Dados do banco
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros e busca
  const [activeTab, setActiveTab] = useState<'TODOS' | 'ORCAMENTO' | 'RECIBO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Modais de Controle
  const [isOrcamentoModalOpen, setIsOrcamentoModalOpen] = useState(false);
  const [isReciboModalOpen, setIsReciboModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  // Itens selecionados para edição / conversão / preview
  const [docToEdit, setDocToEdit] = useState<DocumentType | null>(null);
  const [docToConvert, setDocToConvert] = useState<DocumentType | null>(null);
  const [selectedPDFDoc, setSelectedPDFDoc] = useState<DocumentType | null>(null);

  // Carrega dados do usuário e banco
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const [profData, docsData, clientsData] = await Promise.all([
        getCurrentProfile(),
        getDocuments(),
        getClients(),
      ]);

      setProfile(profData);
      setDocuments(docsData);
      setClients(clientsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Logout
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Exclusão de documento
  const handleDeleteDoc = async (id: string, code: string) => {
    if (confirm(`Tem certeza que deseja excluir o documento ${code}?`)) {
      try {
        await deleteDocumentRecord(id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } catch (err: any) {
        alert('Erro ao excluir: ' + err.message);
      }
    }
  };

  // Callback após salvar documento
  const handleDocumentSaved = (savedDoc: DocumentType, openPreview = false) => {
    loadData();
    if (openPreview) {
      setSelectedPDFDoc(savedDoc);
      setIsPDFModalOpen(true);
    }
  };

  // Callback após conversão 1-clique
  const handleConverted = (novoRecibo: DocumentType) => {
    loadData();
    setSelectedPDFDoc(novoRecibo);
    setIsPDFModalOpen(true);
  };

  // Filtro na lista
  const filteredDocs = documents.filter((doc) => {
    const matchesTab = activeTab === 'TODOS' || doc.document_type === activeTab;
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      doc.code.toLowerCase().includes(s) ||
      doc.client?.name?.toLowerCase().includes(s) ||
      doc.location?.toLowerCase().includes(s);
    return matchesTab && matchesSearch;
  });

  // Métricas financeiras calculadas dinamicamente
  const totalQuitado = documents
    .filter((d) => d.status === 'PAGO')
    .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  const totalAguardando = documents
    .filter((d) => d.status === 'PENDENTE' || d.status === 'APROVADO')
    .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  const totalServicosQuitados = documents.filter((d) => d.status === 'PAGO').length;

  return (
    <main className="max-w-md mx-auto min-h-screen px-4 py-5 md:max-w-4xl md:px-8">
      {/* Topo Institucional AVI & Usuário */}
      <header className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-avi-orange"></span>
            <h1 className="text-xl font-bold tracking-tight text-avi-green-dark">
              AVI ALUMÍNIOS E VIDROS
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manutenções & Instalações de Esquadrias
          </p>
        </div>

        {/* Botão de Logout & Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsClientModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-avi-green bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Cliente</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Sair do Sistema"
            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Ações Rápidas em Destaque */}
      <section className="grid grid-cols-2 gap-3 mb-5">
        <button
          type="button"
          onClick={() => {
            setDocToEdit(null);
            setIsOrcamentoModalOpen(true);
          }}
          className="flex flex-col items-center justify-center p-4 bg-avi-green text-white rounded-2xl shadow-sm hover:bg-avi-green-light active:scale-[0.98] transition-all text-center group"
        >
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-emerald-300" />
          </div>
          <span className="font-bold text-sm">+ Novo Orçamento</span>
          <span className="text-[11px] text-emerald-200 mt-0.5">Proposta comercial</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setDocToEdit(null);
            setIsReciboModalOpen(true);
          }}
          className="flex flex-col items-center justify-center p-4 bg-white text-gray-800 border-2 border-orange-200 rounded-2xl shadow-sm hover:border-avi-orange active:scale-[0.98] transition-all text-center group"
        >
          <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Receipt className="w-5 h-5 text-avi-orange" />
          </div>
          <span className="font-bold text-sm">+ Novo Recibo</span>
          <span className="text-[11px] text-gray-500 mt-0.5">Comprovante de serviço</span>
        </button>
      </section>

      {/* Cards de Métricas Reais do Banco */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Painel Financeiro
          </h2>
          <button
            type="button"
            onClick={() => exportDocumentsToExcel(documents)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Total Recebido</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalQuitado)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {totalServicosQuitados} {totalServicosQuitados === 1 ? 'serviço quitado' : 'serviços quitados'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Aguardando</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600">
              {formatCurrency(totalAguardando)}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Propostas pendentes</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Clientes</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {clients.length}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Cadastrados no sistema</p>
          </div>
        </div>
      </section>

      {/* Histórico e Gestão de Documentos */}
      <section className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
        {/* Barra de Filtro e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Abas */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('TODOS')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'TODOS'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos ({documents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ORCAMENTO')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ORCAMENTO'
                  ? 'bg-white text-avi-green shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Orçamentos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RECIBO')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'RECIBO'
                  ? 'bg-white text-avi-orange shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Recibos
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, número..."
              className="w-full sm:w-56 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
            />
          </div>
        </div>

        {/* Lista de Documentos */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-avi-green" />
            <span className="text-xs">Carregando documentos...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-700">Nenhum documento encontrado</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Clique nos botões acima para emitir o seu primeiro orçamento ou recibo.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const isOrcamento = doc.document_type === 'ORCAMENTO';

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Lado Esquerdo: Identificação & Detalhes */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isOrcamento
                          ? 'bg-emerald-50 text-avi-green'
                          : 'bg-orange-50 text-avi-orange'
                      }`}
                    >
                      {isOrcamento ? 'ORC' : 'REC'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {doc.client?.name || 'Cliente'}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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
                          {doc.payment_method ? ` (${doc.payment_method})` : ''}
                        </span>

                        <span className="text-[11px] font-semibold text-gray-400">
                          {doc.code}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">
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
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-left sm:text-right">
                      <span className="block font-bold text-sm text-gray-900">
                        {formatCurrency(doc.total_amount)}
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1.5">
                      {/* Botão Pulo do Gato: Converter Orçamento em Recibo */}
                      {isOrcamento && doc.status !== 'RECUSADO' && (
                        <button
                          type="button"
                          onClick={() => {
                            setDocToConvert(doc);
                            setIsConvertModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-avi-orange font-semibold text-xs transition-colors"
                          title="Converter Orçamento em Recibo Quitado"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Gerar Recibo</span>
                        </button>
                      )}

                      {/* Visualizar PDF */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPDFDoc(doc);
                          setIsPDFModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-gray-600 hover:text-avi-green hover:bg-white border border-gray-200 transition-colors"
                        title="Visualizar e Enviar PDF no WhatsApp"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => {
                          setDocToEdit(doc);
                          if (isOrcamento) {
                            setIsOrcamentoModalOpen(true);
                          } else {
                            setIsReciboModalOpen(true);
                          }
                        }}
                        className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-white border border-gray-200 transition-colors"
                        title="Editar Documento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id, doc.code)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-white border border-gray-200 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MODAIS DO SISTEMA */}

      {/* 1. Modal de Orçamento */}
      <OrcamentoModal
        isOpen={isOrcamentoModalOpen}
        onClose={() => setIsOrcamentoModalOpen(false)}
        onSaved={handleDocumentSaved}
        clients={clients}
        onClientCreated={(c) => setClients((prev) => [...prev, c])}
        documentToEdit={docToEdit?.document_type === 'ORCAMENTO' ? docToEdit : null}
      />

      {/* 2. Modal de Recibo */}
      <ReciboModal
        isOpen={isReciboModalOpen}
        onClose={() => setIsReciboModalOpen(false)}
        onSaved={handleDocumentSaved}
        clients={clients}
        onClientCreated={(c) => setClients((prev) => [...prev, c])}
        documentToEdit={docToEdit?.document_type === 'RECIBO' ? docToEdit : null}
        defaultPixKey={profile?.pix_key || '47 99659-4199'}
      />

      {/* 3. Modal de Conversão 1-Clique */}
      <ConvertModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        orcamento={docToConvert}
        onConverted={handleConverted}
      />

      {/* 4. Modal Avulso de Cliente */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaved={(c) => setClients((prev) => [...prev, c])}
      />

      {/* 5. Modal de Visualização & WhatsApp do PDF */}
      {selectedPDFDoc && (
        <PDFPreviewModal
          isOpen={isPDFModalOpen}
          onClose={() => setIsPDFModalOpen(false)}
          document={selectedPDFDoc}
          profile={profile}
        />
      )}
    </main>
  );
}
