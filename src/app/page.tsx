'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, 
  Receipt, 
  Users, 
  TrendingUp, 
  ShieldCheck,
  Eye,
  ArrowRight,
  Download
} from 'lucide-react';
import { Document as DocumentType, Profile } from '@/types/database';

// Import dinâmico do Modal de PDF para evitar SSR com APIs de navegador
const PDFPreviewModal = dynamic(
  () => import('@/components/pdf/PDFPreviewModal').then((mod) => mod.PDFPreviewModal),
  { ssr: false }
);

// Dados de exemplo fiéis aos arquivos originais do Lucas para teste imediato
const MOCK_ORCAMENTO_PERSIANA: DocumentType = {
  id: 'doc-orc-1',
  user_id: 'user-1',
  client_id: 'client-1',
  document_type: 'ORCAMENTO',
  code: 'ORC-001/26',
  issue_date: '2026-10-24',
  location: 'APARTAMENTO 402 BLOCO 2 RESIDENCIAL WALDGARTEN',
  status: 'PENDENTE',
  total_amount: 1850.0,
  notes:
    'Observação: Este documento apresenta os valores referentes aos serviços e à composição de material e mão de obra descritos acima.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  client: {
    id: 'client-1',
    user_id: 'user-1',
    name: 'IMOBILIARIA PRIZMA',
    phone: '47996594199',
    tax_id: '20.132.177/0001-59',
    created_at: new Date().toISOString(),
  },
  items: [
    {
      order_index: 0,
      title: 'SERVIÇO 01 — TROCA ROLO PERCIANA INTEGRADA',
      object_description: '45X DE PALHETA PERCIANA PRETA + TERMINAL + PRESILHAS',
      material_cost: 1150.0,
      labor_cost: 700.0,
      total_cost: 1850.0,
    },
  ],
};

const MOCK_RECIBO_REGULAGEM: DocumentType = {
  id: 'doc-rec-1',
  user_id: 'user-1',
  client_id: 'client-1',
  document_type: 'RECIBO',
  code: 'REC-001/26',
  issue_date: '2026-10-28',
  location: 'Apartamento Walgarden - 301, bloco 01',
  status: 'PAGO',
  payment_method: 'PIX',
  pix_key_snapshot: '47 99659-4199',
  total_amount: 100.0,
  notes: 'Regulagem fecho e trava da porta',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  client: {
    id: 'client-1',
    user_id: 'user-1',
    name: 'Imobiliária Prizma',
    phone: '47996594199',
    created_at: new Date().toISOString(),
  },
  items: [
    {
      order_index: 0,
      title: 'Regulagem fecho e trava da porta',
      material_cost: 0,
      labor_cost: 100.0,
      total_cost: 100.0,
    },
  ],
};

const MOCK_PROFILE: Profile = {
  id: 'user-1',
  full_name: 'Lucas Eduardo Avi',
  company_name: 'AVI — ALUMÍNIOS E VIDROS',
  slogan: 'Manutenções em vidros e alumínios • Instalações de esquadrias em geral • Telhados',
  verse: 'Seja forte e corajoso — Josué 1:9',
  pix_key: '47 99659-4199',
  phone: '(47) 99659-4199',
  updated_at: new Date().toISOString(),
};

export default function Home() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenPreview = (doc: DocumentType) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  return (
    <main className="max-w-md mx-auto min-h-screen px-4 py-6 md:max-w-4xl md:px-8">
      {/* Topo Institucional AVI */}
      <header className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
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

        {/* Status Supabase Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Banco Conectado</span>
        </div>
      </header>

      {/* Banner de Demonstração dos Modelos de PDF */}
      <section className="bg-gradient-to-r from-avi-green to-avi-green-dark text-white rounded-2xl p-5 mb-6 shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-avi-orange text-white mb-2">
              Motor de PDFs Ativo
            </span>
            <h2 className="text-lg font-bold">Modelos Oficiais AVI Alumínios</h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-sm">
              Os templates de Orçamento e Recibo foram recriados com fidelidade gráfica milimétrica, logotipo em alta resolução e envio direto via WhatsApp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => handleOpenPreview(MOCK_ORCAMENTO_PERSIANA)}
            className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 active:scale-98 rounded-xl transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-xs text-white">Visualizar Orçamento</p>
                <p className="text-[11px] text-emerald-200">ORC-001/26 (R$ 1.850,00)</p>
              </div>
            </div>
            <Eye className="w-4 h-4 text-emerald-200" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenPreview(MOCK_RECIBO_REGULAGEM)}
            className="flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 active:scale-98 rounded-xl transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-avi-orange flex items-center justify-center">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-xs text-white">Visualizar Recibo</p>
                <p className="text-[11px] text-emerald-200">REC-001/26 (R$ 100,00 - PIX)</p>
              </div>
            </div>
            <Eye className="w-4 h-4 text-emerald-200" />
          </button>
        </div>
      </section>

      {/* Cards de Métricas do Mês */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Resumo Operacional
          </h2>
          <span className="text-xs text-gray-400">Novembro / 2026</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Total Quitado</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-bold text-gray-900">R$ 100,00</div>
            <p className="text-[11px] text-gray-400 mt-1">1 serviço quitado (PIX)</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Aguardando Aprovação</span>
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="text-xl font-bold text-amber-600">R$ 1.850,00</div>
            <p className="text-[11px] text-gray-400 mt-1">1 proposta pendente</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Clientes Cadastrados</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">1</div>
            <p className="text-[11px] text-gray-400 mt-1">Imobiliária Prizma</p>
          </div>
        </div>
      </section>

      {/* Lista de Documentos Recentes */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">Documentos Recentes</h3>
          <span className="text-xs text-avi-green font-medium">Histórico</span>
        </div>

        <div className="space-y-3">
          {/* Card Orçamento */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-avi-green flex items-center justify-center font-bold text-xs">
                ORC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-gray-900">
                    IMOBILIARIA PRIZMA
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Pendente
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Troca Rolo Persiana • Res. Waldgarten, 402
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-bold text-xs text-gray-900">R$ 1.850,00</span>
                <p className="text-[10px] text-gray-400">ORC-001/26</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPreview(MOCK_ORCAMENTO_PERSIANA)}
                className="p-2 rounded-lg text-gray-400 hover:text-avi-green hover:bg-white border border-gray-200 transition-colors"
                title="Visualizar PDF"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Recibo */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-50 text-avi-orange flex items-center justify-center font-bold text-xs">
                REC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-gray-900">
                    Imobiliária Prizma
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Pago (PIX)
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Regulagem fecho e trava • Res. Waldgarten, 301
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="font-bold text-xs text-gray-900">R$ 100,00</span>
                <p className="text-[10px] text-gray-400">REC-001/26</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPreview(MOCK_RECIBO_REGULAGEM)}
                className="p-2 rounded-lg text-gray-400 hover:text-avi-orange hover:bg-white border border-gray-200 transition-colors"
                title="Visualizar PDF"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Pré-visualização do PDF */}
      {selectedDoc && (
        <PDFPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          document={selectedDoc}
          profile={MOCK_PROFILE}
        />
      )}
    </main>
  );
}
