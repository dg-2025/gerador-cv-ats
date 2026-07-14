// src/components/sections/AcoesGerador/index.tsx
"use client";
import React from 'react';
import { Bot, Download } from 'lucide-react';
import { CurriculoData } from '@/types/cv';
import styles from "./style.module.css";

interface AcoesGeradorProps {
  onGerar: () => Promise<void> | void;
  loading: boolean;
  disabled: boolean;
  hasCv: boolean;
  cvParaExportar: CurriculoData | null;
  template: string;
}

const AcoesGerador: React.FC<AcoesGeradorProps> = ({
  onGerar,
  loading,
  disabled,
  hasCv,
  cvParaExportar,
  template
}) => {

  const handleExportPDF = () => {
    if (!cvParaExportar) return;

    // Captura estritamente o componente de conteúdo real do currículo
    const cvDocumento = document.querySelector('.cv-documento');

    if (!cvDocumento) {
      alert("Componente do currículo não encontrado para exportação.");
      return;
    }

    // Cria o iframe invisível para processar a impressão limpa
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.open();
    // Injetamos o .cv-documento diretamente no body do iframe
    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Currículo - ${cvParaExportar.dadosPessoais?.nome || 'Profissional'}</title>
          <style>
            /* Define o tamanho físico da folha A4 na saída e remove margens padrão da janela de impressão */
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                width: 210mm !important;
                height: 297mm !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* Garante que o componente de currículo se comporte como bloco de tamanho real A4 */
              .cv-documento, [class*="cvDocumento"] {
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 20mm !important; /* Margem interna precisa do currículo */
                margin: 0 auto !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
              }
            }
          </style>
        </head>
        <body class="template-${template}">
          ${cvDocumento.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Copia todas as regras de estilo e fontes para o novo documento isolado do iframe
    const documentHead = document.head;
    const iframeHead = doc.head;

    // 1. Clona folhas de estilo em link (fontes do Google, etc)
    Array.from(documentHead.querySelectorAll('link[rel="stylesheet"]')).forEach((link) => {
      iframeHead.appendChild(link.cloneNode(true));
    });

    // 2. Clona tags de estilo geradas dinamicamente
    Array.from(documentHead.querySelectorAll('style')).forEach((style) => {
      iframeHead.appendChild(style.cloneNode(true));
    });

    // 3. Importa de forma segura as regras compiladas de CSS Modules
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          const newStyle = doc.createElement('style');
          Array.from(sheet.cssRules).forEach((rule) => {
            newStyle.appendChild(doc.createTextNode(rule.cssText));
          });
          iframeHead.appendChild(newStyle);
        }
      } catch (e) {
        // Ignora erros de CORS de fontes externas, se houver
      }
    });

    iframe.contentWindow?.focus();

    const triggerPrint = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };

    // Pequena pausa para garantir que o navegador processe o CSS injetado e carregue as fontes
    if (iframe.contentWindow?.navigator) {
      setTimeout(triggerPrint, 150);
    } else {
      setTimeout(triggerPrint, 500);
    }
  };

  return (
    <div className={styles["acoes-modulo"]}>
      <button onClick={onGerar} disabled={loading || disabled} className={styles["btn-gerar"]}>
        {loading ? (
          <span className={styles["btn-content"]}>Processando IA (Aguarde)...</span>
        ) : (
          <span className={styles["btn-content"]}><Bot size={20} /> Gerar Currículo Otimizado</span>
        )}
      </button>

      {hasCv && (
        <button onClick={handleExportPDF} className={styles["btn-baixar"]}>
          <Download size={20} /> Exportar PDF
        </button>
      )}
    </div>
  );
};

export default AcoesGerador;