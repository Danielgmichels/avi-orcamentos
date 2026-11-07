import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    // Retorna perfil padrão caso ainda não tenha sido populado
    return {
      id: user.id,
      full_name: 'Lucas Eduardo Avi',
      company_name: 'AVI — ALUMÍNIOS E VIDROS',
      slogan: 'Manutenções em vidros e alumínios • Instalações de esquadrias em geral • Telhados',
      verse: 'Seja forte e corajoso — Josué 1:9',
      pix_key: '47 99659-4199',
      phone: '(47) 99659-4199',
      updated_at: new Date().toISOString(),
    };
  }

  return data as Profile;
}
