'use client';

import React, { useState, useEffect } from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { OrcamentoPDF } from './OrcamentoPDF';
import { ReciboPDF } from './ReciboPDF';
import { Document as DocumentType, Profile } from '@/types/database';
import { X, Download, Share2, Printer, Loader2, AlertCircle } from 'lucide-react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentType;
  profile?: Profile | null;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  profile,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const isOrcamento = document.document_type === 'ORCAMENTO';
  const fileName = `${isOrcamento ? 'Orcamento' : 'Recibo'}_${document.code.replace('/', '-')}_${(
    document.client?.name || 'Cliente'
  )
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 20)}.pdf`;

  const pdfDocument = isOrcamento ? (
    <OrcamentoPDF document={document} profile={profile} />
  ) : (
    <ReciboPDF document={document} profile={profile} />
  );

  const handleShareWhatsApp = async (blob: Blob | null) => {
    if (!blob) return;
    setIsSharing(true);

    try {
      const file = new File([blob], fileName, { type: 'application/pdf' });
      const clientPhone = document.client?.phone?.replace(/\D/g, '') || '';

      const shareText = `Olá! Segue em anexo o ${
        isOrcamento ? 'Orçamento' : 'Recibo'
      } (${document.code}) referente aos serviços da AVI Alumínios e Vidros. Qualquer dúvida estou à disposição!`;

      // 1. Tenta compartilhamento nativo móvel (Web Share API com arquivo anexado)
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: fileName,
          text: shareText,
        });
      } else {
        // 2. Fallback: Baixa o PDF e abre a conversa do WhatsApp
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

        const waUrl = clientPhone
          ? `https://wa.me/55${clientPhone}?text=${encodeURIComponent(shareText)}`
          : `https://wa.me/?text=${encodeURIComponent(shareText)}`;

        window.open(waUrl, '_blank');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Barra Superior do Modal */}
        <div className="flex items-center justify-between px-4 py-3 bg-avi-green text-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              Visualizar {isOrcamento ? 'Orçamento' : 'Recibo'} — {document.code}
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provedor de Blob do React-PDF */}
        <BlobProvider document={pdfDocument}>
          {({ blob, url, loading, error }) => {
            if (loading) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin text-avi-green" />
                  <p className="text-sm font-medium">Gerando visualização do documento...</p>
                </div>
              );
            }

            if (error) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-red-500">
                  <AlertCircle className="w-8 h-8" />
                  <p className="text-sm font-medium">Erro ao compilar o PDF</p>
                  <p className="text-xs text-gray-400">{error.message}</p>
                </div>
              );
            }

            return (
              <>
                {/* Visualizador do PDF (Iframe responsivo com o Blob gerado) */}
                <div className="flex-1 bg-gray-100 p-2 md:p-4 overflow-hidden">
                  {url && (
                    <iframe
                      src={`${url}#toolbar=0`}
                      className="w-full h-full rounded-xl border border-gray-300 shadow-inner bg-white"
                      title={fileName}
                    />
                  )}
                </div>

                {/* Barra de Ações Inferior */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border-t border-gray-200">
                  <span className="text-xs text-gray-500 hidden sm:inline truncate max-w-xs">
                    {fileName}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Botão WhatsApp */}
                    <button
                      type="button"
                      disabled={isSharing}
                      onClick={() => handleShareWhatsApp(blob)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs shadow-sm transition-all"
                    >
                      {isSharing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      <span>Enviar no WhatsApp</span>
                    </button>

                    {/* Botão Baixar PDF */}
                    <a
                      href={url || '#'}
                      download={fileName}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-avi-green hover:bg-avi-green-light active:scale-95 text-white font-medium text-xs shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Baixar</span>
                    </a>

                    {/* Botão Imprimir */}
                    {url && (
                      <button
                        type="button"
                        onClick={() => {
                          const printWindow = window.open(url, '_blank');
                          printWindow?.focus();
                        }}
                        className="flex items-center justify-center p-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs transition-colors"
                        title="Imprimir"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          }}
        </BlobProvider>
      </div>
    </div>
  );
};
