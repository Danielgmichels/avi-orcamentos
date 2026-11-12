import { createClient } from '@/lib/supabase/client';
import { Document as DocumentType, DocumentItem, DocumentType as DocType, PaymentMethod, DocumentStatus } from '@/types/database';

export async function getDocuments(filter?: {
  type?: DocType;
  status?: string;
  search?: string;
}): Promise<DocumentType[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('documents')
    .select(`
      *,
      client:clients(*),
      items:document_items(*)
    `)
    .eq('user_id', user.id)
    .order('issue_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (filter?.type) {
    query = query.eq('document_type', filter.type);
  }

  if (filter?.status && filter.status !== 'TODOS') {
    query = query.eq('status', filter.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar documentos:', error.message);
    return [];
  }

  // Ordena os itens internos pelo order_index
  const docs = (data || []).map((doc: any) => ({
    ...doc,
    items: (doc.items || []).sort((a: any, b: any) => a.order_index - b.order_index),
  }));

  if (filter?.search && filter.search.trim()) {
    const s = filter.search.toLowerCase();
    return docs.filter(
      (d) =>
        d.code.toLowerCase().includes(s) ||
        d.client?.name?.toLowerCase().includes(s) ||
        d.location?.toLowerCase().includes(s)
    );
  }

  return docs as DocumentType[];
}

export async function getNextCode(type: DocType): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return `${type === 'RECIBO' ? 'REC' : 'ORC'}-001/26`;

  // Tenta chamar a função SQL RPC
  const { data, error } = await supabase.rpc('get_next_document_code', {
    p_user_id: user.id,
    p_type: type,
  });

  if (!error && data) {
    return data as string;
  }

  // Fallback: busca quantidade de documentos do tipo no ano atual
  const yearShort = new Date().getFullYear().toString().slice(-2);
  const prefix = type === 'RECIBO' ? 'REC' : 'ORC';

  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('document_type', type);

  const nextNum = (count || 0) + 1;
  return `${prefix}-${String(nextNum).padStart(3, '0')}/${yearShort}`;
}

export async function createDocumentRecord(
  docData: {
    client_id: string;
    document_type: DocType;
    code: string;
    issue_date: string;
    location?: string | null;
    status: DocumentStatus;
    payment_method?: PaymentMethod | null;
    pix_key_snapshot?: string | null;
    total_amount: number;
    notes?: string | null;
    origin_document_id?: string | null;
  },
  items: Array<{
    title: string;
    object_description?: string | null;
    material_cost: number;
    labor_cost: number;
    total_cost: number;
  }>
): Promise<DocumentType> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // 1. Cria o documento principal
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      client_id: docData.client_id,
      document_type: docData.document_type,
      code: docData.code,
      issue_date: docData.issue_date,
      location: docData.location ? docData.location.trim() : null,
      status: docData.status,
      payment_method: docData.payment_method || null,
      pix_key_snapshot: docData.pix_key_snapshot || '47 99659-4199',
      total_amount: docData.total_amount,
      notes: docData.notes ? docData.notes.trim() : null,
      origin_document_id: docData.origin_document_id || null,
    })
    .select(`
      *,
      client:clients(*)
    `)
    .single();

  if (docError || !doc) {
    console.error('Erro ao inserir documento:', docError?.message);
    throw new Error(docError?.message || 'Falha ao salvar documento');
  }

  // 2. Insere os itens
  if (items && items.length > 0) {
    const itemsToInsert = items.map((item, index) => ({
      document_id: doc.id,
      order_index: index,
      title: item.title.trim(),
      object_description: item.object_description ? item.object_description.trim() : null,
      material_cost: Number(item.material_cost) || 0,
      labor_cost: Number(item.labor_cost) || 0,
      total_cost: Number(item.total_cost) || 0,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('document_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error('Erro ao inserir itens:', itemsError.message);
    }

    doc.items = insertedItems || [];
  } else {
    doc.items = [];
  }

  return doc as DocumentType;
}

export async function updateDocumentRecord(
  id: string,
  docData: {
    client_id: string;
    code: string;
    issue_date: string;
    location?: string | null;
    status: DocumentStatus;
    payment_method?: PaymentMethod | null;
    total_amount: number;
    notes?: string | null;
  },
  items: Array<{
    id?: string;
    title: string;
    object_description?: string | null;
    material_cost: number;
    labor_cost: number;
    total_cost: number;
  }>
): Promise<DocumentType> {
  const supabase = createClient();

  // 1. Atualiza documento
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .update({
      client_id: docData.client_id,
      code: docData.code,
      issue_date: docData.issue_date,
      location: docData.location ? docData.location.trim() : null,
      status: docData.status,
      payment_method: docData.payment_method || null,
      total_amount: docData.total_amount,
      notes: docData.notes ? docData.notes.trim() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      client:clients(*)
    `)
    .single();

  if (docError || !doc) {
    throw new Error(docError?.message || 'Falha ao atualizar documento');
  }

  // 2. Remove itens antigos e reinsere atualizados
  await supabase.from('document_items').delete().eq('document_id', id);

  if (items && items.length > 0) {
    const itemsToInsert = items.map((item, index) => ({
      document_id: id,
      order_index: index,
      title: item.title.trim(),
      object_description: item.object_description ? item.object_description.trim() : null,
      material_cost: Number(item.material_cost) || 0,
      labor_cost: Number(item.labor_cost) || 0,
      total_cost: Number(item.total_cost) || 0,
    }));

    const { data: insertedItems } = await supabase
      .from('document_items')
      .insert(itemsToInsert)
      .select();

    doc.items = insertedItems || [];
  } else {
    doc.items = [];
  }

  return doc as DocumentType;
}

export async function deleteDocumentRecord(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir documento:', error.message);
    throw new Error(error.message);
  }
  return true;
}

/**
 * Aprova rapidamente um orçamento (muda status de PENDENTE para APROVADO)
 */
export async function approveOrcamentoRecord(id: string): Promise<DocumentType> {
  const supabase = createClient();

  const { data: doc, error } = await supabase
    .from('documents')
    .update({
      status: 'APROVADO',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(`
      *,
      client:clients(*),
      items:document_items(*)
    `)
    .single();

  if (error || !doc) {
    throw new Error(error?.message || 'Falha ao aprovar orçamento');
  }

  return {
    ...doc,
    items: (doc.items || []).sort((a: any, b: any) => a.order_index - b.order_index),
  } as DocumentType;
}

/**
 * PULO DO GATO: Converte um Orçamento existente em Recibo de quitação em 1 clique
 */
export async function convertOrcamentoToRecibo(
  orcamento: DocumentType,
  paymentMethod: PaymentMethod = 'PIX'
): Promise<DocumentType> {
  const supabase = createClient();

  // 1. Atualiza status do orçamento de origem para APROVADO
  await supabase
    .from('documents')
    .update({ status: 'APROVADO', updated_at: new Date().toISOString() })
    .eq('id', orcamento.id);

  // 2. Obtém próximo código sequencial de Recibo
  const nextRecCode = await getNextCode('RECIBO');

  // 3. Prepara itens do orçamento para o novo recibo
  const items = (orcamento.items || []).map((item) => ({
    title: item.title,
    object_description: item.object_description,
    material_cost: item.material_cost,
    labor_cost: item.labor_cost,
    total_cost: item.total_cost,
  }));

  // 4. Cria o novo recibo com status PAGO
  const novoRecibo = await createDocumentRecord(
    {
      client_id: orcamento.client_id,
      document_type: 'RECIBO',
      code: nextRecCode,
      issue_date: new Date().toISOString().split('T')[0],
      location: orcamento.location,
      status: 'PAGO',
      payment_method: paymentMethod,
      pix_key_snapshot: orcamento.pix_key_snapshot || '47 99659-4199',
      total_amount: orcamento.total_amount,
      notes: orcamento.notes || `Recibo referente ao Orçamento ${orcamento.code}`,
      origin_document_id: orcamento.id,
    },
    items
  );

  return novoRecibo;
}
