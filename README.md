# AVI Alumínios e Vidros — Sistema de Orçamentos, Recibos e Gestão

Aplicação Web Progressiva (PWA) desenvolvida para emissão rápida de propostas comerciais (orçamentos) e recibos de prestação de serviços, com foco no uso móvel, conversão em 1-clique, envio direto via WhatsApp e painel financeiro consolidado.

---

## 🛠️ Stack Tecnológica

- **Frontend & Backend:** Next.js (App Router), React, Tailwind CSS, TypeScript
- **Mobile First / PWA:** Suporte a instalação na tela inicial (sem barra de navegador)
- **Banco de Dados & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Geração de PDF:** `@react-pdf/renderer`
- **Compartilhamento:** Web Share API (WhatsApp Direct)
- **Exportação:** Planilhas Excel (.xlsx / .csv)

---

## 📑 Documentação e Especificação

A documentação detalhada de requisitos, arquitetura técnica e modelagem do banco de dados encontra-se em:
- [ESPECIFICACAO_TECNICA_AVI.md](./ESPECIFICACAO_TECNICA_AVI.md)

---

## 🚀 Como Executar o Projeto Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (.env.local)
# NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-supabase

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```
