// src/components/sections/AcoesGerador/index.tsx
"use client";
import React, { useState } from 'react';
import { Bot, Download, Loader2 } from 'lucide-react';
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
  const [exportandoMobile, setExportandoMobile] = useState(false);

  // Função auxiliar para detectar se o acesso vem de um dispositivo móvel (iOS ou Android)
  const isMobileDevice = (): boolean => {
    if (typeof window === "undefined") return false;
    const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
  };

  // Prepara e isola estruturalmente o HTML idêntico ao que é renderizado no preview
  const obterHtmlDoCurriculo = (cvDocumento: Element): string => {
    // Coleta as regras CSS ativas e fontes para injetar no PDF remoto
    let estilosCSS = '';
    
    // 1. Coleta fontes e links externos
    const links = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => link.outerHTML)
      .join('\n');

    // 2. Coleta tags de estilo estáticas
    const stylesTags = Array.from(document.head.querySelectorAll('style'))
      .map(style => style.outerHTML)
      .join('\n');

    // 3. Importa de forma segura as regras dinâmicas compiladas de CSS Modules
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          estilosCSS += Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        }
      } catch (e) {
        // Ignora erros de CORS em stylesheets externos
      }
    });

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Currículo - ${cvParaExportar?.dadosPessoais?.nome || 'Profissional'}</title>
          ${links}
          ${stylesTags}
          <style>
            ${estilosCSS}
            
            /* Overrides cruciais para a folha A4 no servidor Puppeteer */
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
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
              box-shadow: none !important;
            }
          </style>
        </head>
        <body class="template-${template}">
          <div class="cv-documento">
            ${cvDocumento.innerHTML}
          </div>
        </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    if (!cvParaExportar) return;

    // Captura estritamente o componente de conteúdo real do currículo
    const cvDocumento = document.querySelector('.cv-documento');

    if (!cvDocumento) {
      alert("Componente do currículo não encontrado para exportação.");
      return;
    }

    const nomeArquivo = `Curriculo_${(cvParaExportar.dadosPessoais?.nome || 'Profissional').replace(/\s+/g, '_')}.pdf`;

    // ==========================================
    // ESTRATÉGIA MOBILE (iOS, Android, PWA e WebViews)
    // ==========================================
    if (isMobileDevice()) {
      setExportandoMobile(true);
      try {
        const htmlCompleto = obterHtmlDoCurriculo(cvDocumento);

        // Dispara a geração de PDF no nosso microsserviço no backend (Server-side Puppeteer)
        const response = await fetch('/api/gerar-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: htmlCompleto, filename: nomeArquivo }),
        });

        if (!response.ok) throw new Error("Erro na resposta do servidor");

        const pdfBlob = await response.blob();
        
        // Estratégia de Download segura e universal para Mobile
        const blobUrl = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = nomeArquivo;
        
        // Garante suporte a WebViews do iOS e Android adicionando o link ao body temporariamente
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Limpa referências após execução rápida
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
        }, 150);

      } catch (error) {
        console.error("Falha ao exportar PDF no dispositivo móvel:", error);
        alert("Ocorreu um erro ao gerar o PDF. Tentando abrir em nova guia...");
        
        // Fallback rápido se o download direto via Blob for bloqueado pelo WebView
        try {
          const htmlCompleto = obterHtmlDoCurriculo(cvDocumento);
          const response = await fetch('/api/gerar-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: htmlCompleto, filename: nomeArquivo }),
          });
          const pdfBlob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              window.open(reader.result, '_blank');
            }
          };
          reader.readAsDataURL(pdfBlob);
        } catch (fbError) {
          alert("Não foi possível processar o documento neste navegador.");
        }
      } finally {
        setExportandoMobile(false);
      }
      return;
    }

    // ==========================================
    // ESTRATÉGIA DESKTOP (PRESERVADA INTEGRALMENTE)
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
      } catch (e) {}
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
      <button onClick={onGerar} disabled={loading || disabled || exportandoMobile} className={styles["btn-gerar"]}>
        {loading ? (
          <span className={styles["btn-content"]}>Processando IA (Aguarde)...</span>
        ) : (
          <span className={styles["btn-content"]}><Bot size={20} /> Gerar Currículo Otimizado</span>
        )}
      </button>

      {hasCv && (
        <button 
          onClick={handleExportPDF} 
          disabled={exportandoMobile} 
          className={styles["btn-baixar"]}
        >
          {exportandoMobile ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Gerando PDF...
            </>
          ) : (
            <>
              <Download size={20} /> Exportar PDF
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AcoesGerador;