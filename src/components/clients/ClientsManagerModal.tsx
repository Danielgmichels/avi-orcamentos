'use client';

import React, { useState } from 'react';
import { Client, Document as DocumentType } from '@/types/database';
import { deleteClientRecord } from '@/lib/services/clients';
import { ClientModal } from './ClientModal';
import { formatPhone } from '@/utils/formatters';
import { 
  X, 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  MapPin, 
  FileBadge, 
  Loader2, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface ClientsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  documents: DocumentType[];
  onClientsChanged: () => void;
}

export const ClientsManagerModal: React.FC<ClientsManagerModalProps> = ({
  isOpen,
  onClose,
  clients,
  documents,
  onClientsChanged,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.default_location && c.default_location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (client: Client) => {
    const docCount = documents.filter((d) => d.client_id === client.id).length;
    if (docCount > 0) {
      alert(
        `O cliente "${client.name}" possui ${docCount} documento(s) cadastrado(s) e não pode ser excluído para não apagar o histórico de serviços.`
      );
      return;
    }

    if (confirm(`Deseja realmente excluir o cliente "${client.name}"?`)) {
      setDeletingId(client.id);
      setErrorMessage(null);
      try {
        await deleteClientRecord(client.id);
        onClientsChanged();
      } catch (err: any) {
        setErrorMessage(err.message || 'Erro ao excluir cliente.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 overflow-x-hidden">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-avi-green text-white shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Gerenciar Clientes ({clients.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca e Ação Novo Cliente */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente por nome, telefone ou local..."
              className="w-full min-w-0 pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-avi-green"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setClientToEdit(null);
              setIsClientModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-avi-green hover:bg-avi-green-light active:scale-95 shadow-sm transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Lista de Clientes */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const docCount = documents.filter((d) => d.client_id === client.id).length;

              return (
                <div
                  key={client.id}
                  className="p-3.5 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white shadow-sm flex items-center justify-between gap-3 transition-all"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 truncate">
                        {client.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 shrink-0">
                        {docCount} {docCount === 1 ? 'documento' : 'documentos'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      {client.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {formatPhone(client.phone)}
                        </span>
                      )}

                      {client.tax_id && (
                        <span className="inline-flex items-center gap-1">
                          <FileBadge className="w-3 h-3 text-gray-400" />
                          {client.tax_id}
                        </span>
                      )}

                      {client.default_location && (
                        <span className="inline-flex items-center gap-1 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-orange-500" />
                          {client.default_location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações: Editar e Excluir */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setClientToEdit(client);
                        setIsClientModalOpen(true);
                      }}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 transition-colors"
                      title="Editar dados do cliente"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === client.id}
                      onClick={() => handleDelete(client)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 transition-colors"
                      title="Excluir cliente"
                    >
                      {deletingId === client.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de Adicionar / Editar Cliente */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        clientToEdit={clientToEdit}
        onSaved={() => {
          onClientsChanged();
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
      />
    </div>
  );
};
