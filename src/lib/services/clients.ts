import { createClient } from '@/lib/supabase/client';
import { Client } from '@/types/database';

export async function getClients(): Promise<Client[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar clientes:', error.message);
    return [];
  }

  return (data || []) as Client[];
}

export async function createClientRecord(clientData: {
  name: string;
  phone?: string | null;
  tax_id?: string | null;
  default_location?: string | null;
}): Promise<Client | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('clients')
    .insert({
      user_id: user.id,
      name: clientData.name.trim(),
      phone: clientData.phone ? clientData.phone.trim() : null,
      tax_id: clientData.tax_id ? clientData.tax_id.trim() : null,
      default_location: clientData.default_location ? clientData.default_location.trim() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao cadastrar cliente:', error.message);
    throw new Error(error.message);
  }

  return data as Client;
}

export async function updateClientRecord(
  id: string,
  clientData: {
    name: string;
    phone?: string | null;
    tax_id?: string | null;
    default_location?: string | null;
  }
): Promise<Client | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .update({
      name: clientData.name.trim(),
      phone: clientData.phone ? clientData.phone.trim() : null,
      tax_id: clientData.tax_id ? clientData.tax_id.trim() : null,
      default_location: clientData.default_location ? clientData.default_location.trim() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar cliente:', error.message);
    throw new Error(error.message);
  }

  return data as Client;
}
