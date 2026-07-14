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

  // Detecta se o usuário está acessando por um dispositivo móvel
  const isMobileDevice = (): boolean => {
    if (typeof window === "undefined") return false;
    const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
    return /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
  };

  // Prepara o HTML limpando qualquer elemento fora da folha de currículo
  const obterHtmlDoCurriculo = (cvDocumento: Element): string => {
    let estilosCSS = '';
    
    // 1. Coleta links externos (como Google Fonts)
    const links = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
      .map(link => link.outerHTML)
      .join('\n');

    // 2. Coleta tags <style> estáticas do documento
    const stylesTags = Array.from(document.head.querySelectorAll('style'))
      .map(style => style.outerHTML)
      .join('\n');

    // 3. Coleta dinamicamente as regras CSS geradas pelo compilador do NextJS (CSS Modules)
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

    // Envelopamos o HTML garantindo que o body possua a classe correta do template
    // e limpando elementos interativos como 'contenteditable' para não irem pro PDF
    const cloneDocumento = cvDocumento.cloneNode(true) as HTMLElement;
    cloneDocumento.querySelectorAll('[contenteditable]').forEach(el => {
      el.removeAttribute('contenteditable');
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
            
            /* Ajustes estritos para o layout A4 no Puppeteer */
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
            /* Garante que o container do currículo ocupe o espaço exato da folha A4 no PDF */
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
          ${cloneDocumento.outerHTML}
        </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    if (!cvParaExportar) return;

    // Captura estritamente o container do currículo gerado
    const cvDocumento = document.querySelector('.cv-documento');

    if (!cvDocumento) {
      alert("Componente do currículo não encontrado para exportação. Certifique-se de que ele foi gerado na tela.");
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

        // Dispara a geração de PDF no backend (Puppeteer remoto)
        const response = await fetch('/api/gerar-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: htmlCompleto, filename: nomeArquivo }),
        });

        if (!response.ok) throw new Error("Erro na geração de PDF via servidor");

        const pdfBlob = await response.blob();
        
        // Cria o link para baixar o arquivo
        const blobUrl = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = nomeArquivo;
        
        // Insere temporariamente no documento para forçar o clique em navegadores mobile
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
        }, 150);

      } catch (error) {
        console.error("Erro na exportação Mobile:", error);
        alert("Ocorreu um erro ao baixar o arquivo. Tentando abrir o PDF em uma nova aba...");
        
        // Fallback alternativo usando File Reader para abrir em nova guia no mobile
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
          alert("Não foi possível gerar o PDF neste navegador.");
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