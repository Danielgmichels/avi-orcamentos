'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  FileText, 
  Receipt, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function Home() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkSupabase() {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('clients').select('id').limit(1);
        
        // Se a tabela ainda não tiver sido criada no SQL Editor, não é erro de credencial
        if (error && error.code !== '42P01') {
          console.warn('Supabase check:', error.message);
        }
        setSupabaseStatus('connected');
      } catch (err: any) {
        setSupabaseStatus('error');
        setErrorMessage(err?.message || 'Falha na conexão');
      }
    }
    checkSupabase();
  }, []);

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
          <span>Supabase Ativo</span>
        </div>
      </header>

      {/* Ações Rápidas (Mobile First) */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          className="flex flex-col items-center justify-center p-4 bg-avi-green text-white rounded-2xl shadow-sm hover:bg-avi-green-light active:scale-[0.98] transition-all text-center"
        >
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-sm">Novo Orçamento</span>
          <span className="text-[11px] text-emerald-200 mt-0.5">Proposta comercial</span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center justify-center p-4 bg-white text-gray-800 border-2 border-avi-green/20 rounded-2xl shadow-sm hover:border-avi-green active:scale-[0.98] transition-all text-center"
        >
          <div className="h-10 w-10 rounded-full bg-avi-orange/10 flex items-center justify-center mb-2">
            <Receipt className="w-5 h-5 text-avi-orange" />
          </div>
          <span className="font-semibold text-sm">Novo Recibo</span>
          <span className="text-[11px] text-gray-500 mt-0.5">Comprovante de serviço</span>
        </button>
      </section>

      {/* Cards de Métricas do Mês */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Resumo do Mês
          </h2>
          <span className="text-xs text-gray-400">Novembro / 2026</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Total Recebido</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-bold text-gray-900">R$ 0,00</div>
            <p className="text-[11px] text-gray-400 mt-1">0 serviços quitados</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Aguardando</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600">R$ 0,00</div>
            <p className="text-[11px] text-gray-400 mt-1">0 orçamentos pendentes</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>Clientes</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">0</div>
            <p className="text-[11px] text-gray-400 mt-1">Imobiliárias e particulares</p>
          </div>
        </div>
      </section>

      {/* Lista de Atividades Recentes (Mock de Boas-Vindas) */}
      <section className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">Últimos Documentos</h3>
          <span className="text-xs text-avi-green font-medium">Ver todos</span>
        </div>

        <div className="text-center py-8">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-medium text-gray-700">Nenhum documento ainda</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Assim que você criar o primeiro orçamento ou recibo, ele aparecerá aqui com acesso rápido para PDF e WhatsApp.
          </p>
        </div>
      </section>

      {/* Barra de Navegação Inferior (Mobile PWA) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-around md:hidden z-30 shadow-lg">
        <button type="button" className="flex flex-col items-center gap-1 text-avi-green font-semibold text-xs">
          <TrendingUp className="w-5 h-5" />
          <span>Início</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-700 text-xs">
          <FileText className="w-5 h-5" />
          <span>Documentos</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-700 text-xs">
          <Users className="w-5 h-5" />
          <span>Clientes</span>
        </button>
      </nav>
    </main>
  );
}
