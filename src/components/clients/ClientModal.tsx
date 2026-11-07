'use client';

import React, { useState, useEffect } from 'react';
import { Client } from '@/types/database';
import { createClientRecord, updateClientRecord } from '@/lib/services/clients';
import { X, UserPlus, Loader2, Building, Phone, FileBadge, MapPin } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (client: Client) => void;
  clientToEdit?: Client | null;
  initialName?: string;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  clientToEdit,
  initialName = '',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setPhone(clientToEdit.phone || '');
      setTaxId(clientToEdit.tax_id || '');
      setDefaultLocation(clientToEdit.default_location || '');
    } else {
      setName(initialName || '');
      setPhone('');
      setTaxId('');
      setDefaultLocation('');
    }
    setError(null);
  }, [clientToEdit, isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do cliente é obrigatório.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let saved: Client | null;
      if (clientToEdit) {
        saved = await updateClientRecord(clientToEdit.id, {
          name,
          phone,
          tax_id: taxId,
          default_location: defaultLocation,
        });
      } else {
        saved = await createClientRecord({
          name,
          phone,
          tax_id: taxId,
          default_location: defaultLocation,
        });
      }

      if (saved) {
        onSaved(saved);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-x-hidden">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 bg-avi-green text-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">
              {clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nome ou Razão Social <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Imobiliária Prizma ou João Silva"
                className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              WhatsApp / Telefone <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(47) 99659-4199"
                className="w-full min-w-0 pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                CPF ou CNPJ <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FileBadge className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="20.132.177/0001-59"
                  className="w-full min-w-0 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Endereço Padrão <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  placeholder="Ex: Res. Waldgarten"
                  className="w-full min-w-0 pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-avi-green focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-avi-green hover:bg-avi-green-light active:scale-95 rounded-xl shadow-sm transition-all"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{clientToEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
