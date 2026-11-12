'use client';

import React, { useState } from 'react';
import { Client, Document as DocumentType } from '@/types/database';
import { formatCurrency, formatPhone, getWhatsAppUrl } from '@/utils/formatters';
import { calculateFinancialSummary } from '@/utils/documentStats';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  MapPin,
  FileBadge,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';

interface ClientsManagerViewProps {
  clients: Client[];
  documents: DocumentType[];
  onOpenClientDetail: (client: Client) => void;
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (client: Client) => void;
  onNewOrcamento: (client: Client) => void;
}

export const ClientsManagerView: React.FC<ClientsManagerViewProps> = ({
  clients,
  documents,
  onOpenClientDetail,
  onNewClient,
  onEditClient,
  onDeleteClient,
  onNewOrcamento,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Clientes filtrados por termo de busca
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.default_location && c.default_location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.tax_id && c.tax_id.includes(searchTerm))
  );

  // Estatísticas globais dos clientes
  const totalFaturadoGlobal = documents
    .filter((d) => d.status === 'PAGO')
    .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  const clientsWithDocs = clients.filter((c) =>
    documents.some((d) => d.client_id === c.id)
  ).length;

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Ação Novo Cliente */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone, condomínio ou CPF/CNPJ..."
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={onNewClient}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-avi-green hover:bg-avi-green-light active:scale-95 shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Resumo Rápido da Carteira */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
          <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl text-center">
            <span className="block text-[10px] sm:text-xs text-gray-400 font-medium">Cadastrados</span>
            <span className="text-sm sm:text-base font-extrabold text-gray-900">{clients.length}</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl text-center">
            <span className="block text-[10px] sm:text-xs text-gray-400 font-medium">Com Serviços</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-700">{clientsWithDocs}</span>
          </div>
          <div className="p-2 sm:p-2.5 bg-gray-50 rounded-xl text-center truncate">
            <span className="block text-[10px] sm:text-xs text-gray-400 font-medium">Faturamento Total</span>
            <span className="text-sm sm:text-base font-extrabold text-gray-900 truncate" title={formatCurrency(totalFaturadoGlobal)}>
              {formatCurrency(totalFaturadoGlobal)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Clientes */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-gray-700">Nenhum cliente encontrado</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Cadastre o seu primeiro cliente clicando no botão "Novo Cliente".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredClients.map((client) => {
            // Documentos e métricas financeiras deste cliente
            const clientDocs = documents.filter((d) => d.client_id === client.id);
            const {
              docsPago,
              docsAprovadoPendentes,
              docsPendente,
              totalPago,
              totalAprovado,
              totalPendente,
            } = calculateFinancialSummary(clientDocs, documents);

            const whatsappUrl = getWhatsAppUrl(
              client.phone,
              `Olá ${client.name}, tudo bem? Aqui é o Lucas da AVI Alumínios e Vidros.`
            );

            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl border border-gray-200 hover:border-gray-300 p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between gap-3 group"
              >
                {/* Topo do Card */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenClientDetail(client)}
                      className="flex items-center gap-2.5 min-w-0 text-left group/title"
                    >
                      <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-avi-green font-black text-sm flex items-center justify-center shrink-0 border border-emerald-100 group-hover/title:bg-avi-green group-hover/title:text-emerald-300 transition-colors">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover/title:text-avi-green truncate transition-colors">
                          {client.name}
                        </h3>
                        <span className="text-[11px] text-gray-400">
                          {clientDocs.length} {clientDocs.length === 1 ? 'documento' : 'documentos'}
                        </span>
                      </div>
                    </button>

                    {/* Ações Rápidas: Editar e Excluir */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditClient(client)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                        title="Editar cliente"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteClient(client)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        title="Excluir cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Informações de Contato e Local */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 pt-1">
                    {client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{formatPhone(client.phone)}</span>
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 ml-0.5 p-0.5 rounded"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-100" />
                          </a>
                        )}
                      </div>
                    )}

                    {client.tax_id && (
                      <div className="flex items-center gap-1">
                        <FileBadge className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{client.tax_id}</span>
                      </div>
                    )}

                    {client.default_location && (
                      <div className="flex items-center gap-1 truncate max-w-full">
                        <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                        <span className="truncate">{client.default_location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini Resumo Financeiro deste Cliente */}
                <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <div className="truncate">
                    <span className="block text-[9px] text-gray-400 font-medium truncate">Recebido</span>
                    <span className="text-xs font-bold text-emerald-700 truncate block">
                      {formatCurrency(totalPago)}
                    </span>
                    <span className="text-[9px] text-gray-400">({docsPago.length})</span>
                  </div>

                  <div className="truncate border-x border-gray-200">
                    <span className="block text-[9px] text-gray-400 font-medium truncate">Aprovado</span>
                    <span className="text-xs font-bold text-blue-700 truncate block">
                      {formatCurrency(totalAprovado)}
                    </span>
                    <span className="text-[9px] text-gray-400">({docsAprovadoPendentes.length})</span>
                  </div>

                  <div className="truncate">
                    <span className="block text-[9px] text-gray-400 font-medium truncate">Aguardando</span>
                    <span className="text-xs font-bold text-amber-600 truncate block">
                      {formatCurrency(totalPendente)}
                    </span>
                    <span className="text-[9px] text-gray-400">({docsPendente.length})</span>
                  </div>
                </div>

                {/* Botões de Ação do Card */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => onOpenClientDetail(client)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs border border-gray-200 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                    <span>Ver Histórico & Docs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNewOrcamento(client)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-avi-green font-bold text-xs border border-emerald-200 transition-colors shrink-0"
                    title="Emitir novo orçamento para este cliente"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Orçamento</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
