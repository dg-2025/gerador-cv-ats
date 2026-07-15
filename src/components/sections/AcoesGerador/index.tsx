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

  const handleExportPDF = async () => {
    if (!cvParaExportar) return;
    setIsExporting(true);

    try {
      const cvDocumento = document.querySelector('.cv-documento');
      if (!cvDocumento) {
        alert("Componente do currículo não encontrado.");
        setIsExporting(false);
        return;
      }

      // 1. Captura os estilos da página (Fontes e CSS) para enviar ao servidor
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
        } catch (e) { /* Ignora erros de CORS */ }
      });

      // 2. Clona o CV e limpa os atributos de edição
      const cloneDocumento = cvDocumento.cloneNode(true) as HTMLElement;
      cloneDocumento.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
      });

      // 3. Monta o HTML completo
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            ${links}
            ${stylesTags}
            <style>
              ${estilosCSS}
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .cv-documento {
                width: 210mm !important;
                min-height: 297mm !important;
                padding: 20mm !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
              }
            </style>
          </head>
          <body class="template-${template}">
            ${cloneDocumento.outerHTML}
          </body>
        </html>
      `;

      // 4. Envia o HTML para a API converter em PDF com texto real
      const nomeArquivo = cvParaExportar.dadosPessoais?.nome 
        ? `Curriculo_${cvParaExportar.dadosPessoais.nome.replace(/\s+/g, '_')}.pdf` 
        : 'Curriculo_ATS.pdf';

      const response = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml, filename: nomeArquivo }),
      });

      if (!response.ok) throw new Error("Erro na geração do PDF");

      // 5. Baixa o arquivo diretamente no navegador do usuário
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao exportar PDF. Verifique sua conexão.");
    } finally {
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
            <><Loader2 size={20} className="animate-spin" /> Gerando PDF...</>
          ) : (
            <><Download size={20} /> Baixar PDF</>
          )}
        </button>
      )}
    </div>
  );
};

export default AcoesGerador;