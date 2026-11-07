'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@/types/database';
import { Building, Plus, Check, ChevronDown, UserPlus } from 'lucide-react';
import { ClientModal } from './ClientModal';

interface ClientAutocompleteProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onClientCreated: (client: Client) => void;
}

export const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  clients,
  selectedClient,
  onSelectClient,
  onClientCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(selectedClient?.name || '');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedClient) {
      setSearch(selectedClient.name);
    }
  }, [selectedClient]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (client: Client) => {
    onSelectClient(client);
    setSearch(client.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        Cliente Contratante <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Building className="w-4 h-4" />
        </div>

        <input
          type="text"
          required
          value={search}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Digite para buscar ou cadastrar..."
          className="w-full pl-9 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsClientModalOpen(true)}
            className="p-1.5 text-xs text-avi-green hover:bg-emerald-50 rounded-lg flex items-center gap-1 font-medium transition-colors"
            title="Novo Cliente"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelect(client)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-gray-800 text-xs">{client.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {client.phone ? client.phone : ''}
                    {client.default_location ? ` • ${client.default_location}` : ''}
                  </p>
                </div>
                {selectedClient?.id === client.id && (
                  <Check className="w-4 h-4 text-avi-green" />
                )}
              </button>
            ))
          ) : (
            <div className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-2">Nenhum cliente com "{search}"</p>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-avi-green rounded-lg hover:bg-avi-green-light"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Cadastrar "{search}"</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Cadastro de Cliente */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaved={(newClient) => {
          onClientCreated(newClient);
          onSelectClient(newClient);
          setSearch(newClient.name);
          setIsOpen(false);
        }}
      />
    </div>
  );
};
