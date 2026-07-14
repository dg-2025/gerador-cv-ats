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

  // Detecta se o usuário está em um dispositivo móvel (iOS ou Android)
  const isMobileDevice = (): boolean => {
    if (typeof window === "undefined") return false;
    const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
  };

  const handleExportPDF = () => {
    if (!cvParaExportar) return;

    // Captura estritamente o componente de conteúdo real do currículo
    const cvDocumento = document.querySelector('.cv-documento');

    if (!cvDocumento) {
      alert("Componente do currículo não encontrado para exportação.");
      return;
    }

    // ==========================================
    // ESTRATÉGIA MOBILE (Abertura Direta para Salvamento/Impressão)
    // ==========================================
    if (isMobileDevice()) {
      // Cria uma nova aba temporária onde carregaremos apenas o currículo e chamaremos a impressão do sistema.
      // Isso contorna bloqueios de WebViews do Instagram, Linkedin, Safari e PWA Standalone.
      const win = window.open('', '_blank');
      if (!win) {
        alert("Por favor, permita pop-ups para exportar seu currículo.");
        return;
      }

      // Captura estilos css compilados de forma idêntica ao desktop
      let estilosCSS = '';
      const documentHead = document.head;

      // 1. Clona folhas de estilo em link (fontes do Google, etc)
      const links = Array.from(documentHead.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.cloneNode(true) as HTMLElement)
        .map(el => el.outerHTML)
        .join('\n');

      // 2. Clona tags de estilo geradas dinamicamente
      const stylesTags = Array.from(documentHead.querySelectorAll('style'))
        .map(style => style.cloneNode(true) as HTMLElement)
        .map(el => el.outerHTML)
        .join('\n');

      // 3. Importa regras compiladas de CSS Modules
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach((rule) => {
              estilosCSS += rule.cssText + '\n';
            });
          }
        } catch (e) {
          // Ignora erros de CORS
        }
      });

      // Remove atributos "contenteditable" no clone antes de renderizar
      const cloneDocumento = cvDocumento.cloneNode(true) as HTMLElement;
      cloneDocumento.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
      });

      win.document.open();
      win.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Currículo - ${cvParaExportar.dadosPessoais?.nome || 'Profissional'}</title>
            ${links}
            ${stylesTags}
            <style>
              ${estilosCSS}
              
              @page {
                size: A4 portrait;
                margin: 0 !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                width: 100% !important;
                height: 100% !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .cv-documento, [class*="cvDocumento"] {
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 20mm !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
                box-shadow: none !important;
              }
              @media print {
                html, body {
                  width: 210mm !important;
                  height: 297mm !important;
                }
              }
            </style>
          </head>
          <body class="template-${template}">
            ${cloneDocumento.outerHTML}
            <script>
              // Aguarda as fontes externas estarem prontas para chamar a tela de PDF/Impressão nativa
              window.onload = function() {
                if (document.fonts) {
                  document.fonts.ready.then(function() {
                    setTimeout(function() {
                      window.print();
                    }, 250);
                  });
                } else {
                  setTimeout(function() {
                    window.print();
                  }, 500);
                }
              };
            </script>
          </body>
        </html>
      `);
      win.document.close();
      return;
    }

    // ==========================================
    // ESTRATÉGIA DESKTOP (MANTIDA 100% IDÊNTICA)
    // ==========================================
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
    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Currículo - ${cvParaExportar.dadosPessoais?.nome || 'Profissional'}</title>
          <style>
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
              .cv-documento, [class*="cvDocumento"] {
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 20mm !important;
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

    const documentHead = document.head;
    const iframeHead = doc.head;

    Array.from(documentHead.querySelectorAll('link[rel="stylesheet"]')).forEach((link) => {
      iframeHead.appendChild(link.cloneNode(true));
    });

    Array.from(documentHead.querySelectorAll('style')).forEach((style) => {
      iframeHead.appendChild(style.cloneNode(true));
    });

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