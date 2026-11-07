-- ==============================================================================
-- SISTEMA AVI ALUMÍNIOS E VIDROS - ESQUEMA DO BANCO DE DADOS (SUPABASE POSTGRES)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIL DA EMPRESA (Vinculado ao usuário autenticado)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Lucas Eduardo Avi',
    company_name TEXT NOT NULL DEFAULT 'AVI — Alumínios e Vidros',
    slogan TEXT NOT NULL DEFAULT 'Manutenções em vidros e alumínios • Instalações de esquadrias em geral • Telhados',
    verse TEXT NOT NULL DEFAULT 'Seja forte e corajoso — Josué 1:9',
    pix_key TEXT NOT NULL DEFAULT '47 99659-4199',
    phone TEXT NOT NULL DEFAULT '(47) 99659-4199',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    tax_id VARCHAR(30), -- CPF ou CNPJ opcional
    default_location VARCHAR(255), -- Endereço ou condomínio padrão (opcional)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE DOCUMENTOS (ORÇAMENTOS E RECIBOS)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('ORCAMENTO', 'RECIBO')),
    code VARCHAR(30) NOT NULL, -- Ex: ORC-001/26 ou REC-001/26
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location TEXT, -- Local do imóvel / condomínio / apto (opcional)
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO', 'PAGO', 'CANCELADO')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('PIX', 'DINHEIRO')),
    pix_key_snapshot VARCHAR(100),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    origin_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE ITENS DO DOCUMENTO
CREATE TABLE IF NOT EXISTS public.document_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL, -- Ex: SERVIÇO 01 — TROCA ROLO PERSIANA
    object_description TEXT,     -- Ex: 45X DE PALHETA PERSIANA PRETA + TERMINAL + PRESILHAS
    material_cost NUMERIC(10, 2) DEFAULT 0.00,
    labor_cost NUMERIC(10, 2) DEFAULT 0.00,
    total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- 6. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(user_id, name);
CREATE INDEX IF NOT EXISTS idx_documents_user_type_date ON public.documents(user_id, document_type, issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_document_items_doc_order ON public.document_items(document_id, order_index ASC);

-- 7. ATIVAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS DE SEGURANÇA (RLS)
-- Cada usuário só enxerga e manipula seus próprios registros

-- Profiles
CREATE POLICY "Usuários gerenciam seu próprio perfil"
    ON public.profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Clients
CREATE POLICY "Usuários gerenciam seus clientes"
    ON public.clients FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Documents
CREATE POLICY "Usuários gerenciam seus documentos"
    ON public.documents FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Document Items (Verifica posse pelo documento pai)
CREATE POLICY "Usuários gerenciam itens de seus documentos"
    ON public.document_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE public.documents.id = public.document_items.document_id
            AND public.documents.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents
            WHERE public.documents.id = public.document_items.document_id
            AND public.documents.user_id = auth.uid()
        )
    );

-- 9. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO NO SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Lucas Eduardo Avi'))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. FUNÇÃO PARA GERAR O PRÓXIMO CÓDIGO SEQUENCIAL DO ANO (Ex: ORC-001/26 ou REC-001/26)
CREATE OR REPLACE FUNCTION public.get_next_document_code(
    p_user_id UUID,
    p_type VARCHAR(20)
)
RETURNS TEXT AS $$
DECLARE
    v_year_short TEXT;
    v_prefix TEXT;
    v_next_num INTEGER;
    v_result TEXT;
BEGIN
    v_year_short := to_char(CURRENT_DATE, 'YY');
    v_prefix := CASE WHEN p_type = 'RECIBO' THEN 'REC' ELSE 'ORC' END;

    SELECT COALESCE(COUNT(*), 0) + 1
    INTO v_next_num
    FROM public.documents
    WHERE user_id = p_user_id
      AND document_type = p_type
      AND EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE);

    v_result := v_prefix || '-' || LPAD(v_next_num::TEXT, 3, '0') || '/' || v_year_short;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
