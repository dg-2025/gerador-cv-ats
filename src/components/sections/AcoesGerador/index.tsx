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
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    if (!cvParaExportar) return;
    setIsExporting(true);

    try {
      const cvDocumento = document.querySelector('.cv-documento');
      if (!cvDocumento) {
        alert("Componente do currículo não encontrado.");
        setIsExporting(false);
        return;
      }

      // 1. Captura os estilos e fontes da página atual
      let estilosCSS = '';
      const documentHead = document.head;
      
      const links = Array.from(documentHead.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.outerHTML).join('\n');
        
      const stylesTags = Array.from(documentHead.querySelectorAll('style'))
        .map(style => style.outerHTML).join('\n');

      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach((rule) => {
              estilosCSS += rule.cssText + '\n';
            });
          }
        } catch (e) { /* Ignora erros de CORS de fontes externas */ }
      });

      // 2. Clona o currículo e remove os atributos de edição
      const cloneDocumento = cvDocumento.cloneNode(true) as HTMLElement;
      cloneDocumento.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
      });

      // 3. Cria um iframe invisível para processar a impressão isolada
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '-9999px';
      iframe.style.bottom = '-9999px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) throw new Error("Não foi possível criar o ambiente de impressão.");

      // 4. Injeta o HTML forçando as proporções do A4 (A MÁGICA PARA O MOBILE AQUI)
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <!-- Força o celular a renderizar na largura do A4 (aprox 794px) -->
            <meta name="viewport" content="width=794, initial-scale=1.0, maximum-scale=1.0">
            <title>Curriculo_${cvParaExportar.dadosPessoais?.nome?.replace(/\s+/g, '_') || 'ATS'}</title>
            ${links}
            ${stylesTags}
            <style>
              ${estilosCSS}
              
              /* Regras rígidas para forçar o tamanho do papel, independente da tela */
              @page {
                size: A4 portrait;
                margin: 0 !important;
              }
              
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                /* As medidas abaixo impedem que o texto esprema no celular */
                width: 210mm !important;
                min-height: 297mm !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .cv-documento {
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 15mm !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
                box-shadow: none !important;
                transform: none !important;
              }
            </style>
          </head>
          <body class="template-${template}">
            ${cloneDocumento.outerHTML}
            <script>
              // Aguarda as fontes carregarem e chama a impressão nativa
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                }, 500); // Meio segundo para o navegador estabilizar o CSS
              };
            </script>
          </body>
        </html>
      `);
      doc.close();

      // 5. Foca no iframe para a tela de impressão abrir corretamente no iOS/Android
      iframe.contentWindow?.focus();

      // 6. Limpa o iframe após um tempo (para não poluir a memória)
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        setIsExporting(false);
      }, 5000);

    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao preparar a impressão.");
      setIsExporting(false);
    }
  };

  return (
    <div className={styles["acoes-modulo"]}>
      <button onClick={onGerar} disabled={loading || disabled || isExporting} className={styles["btn-gerar"]}>
        {loading ? (
          <span className={styles["btn-content"]}><Loader2 size={20} className="animate-spin" style={{marginRight: '8px'}} /> Processando IA...</span>
        ) : (
          <span className={styles["btn-content"]}><Bot size={20} style={{marginRight: '8px'}} /> Gerar Currículo Otimizado</span>
        )}
      </button>

      {hasCv && (
        <button onClick={handleExportPDF} disabled={isExporting} className={styles["btn-baixar"]}>
          {isExporting ? (
            <><Loader2 size={20} className="animate-spin" /> Preparando...</>
          ) : (
            <><Download size={20} /> Salvar PDF</>
          )}
        </button>
      )}
    </div>
  );
};

export default AcoesGerador;