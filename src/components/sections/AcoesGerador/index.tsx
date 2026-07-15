// src/components/sections/AcoesGerador/index.tsx
"use client";
import React, { useState } from 'react';
import { Bot, Download, Loader2 } from 'lucide-react';
import { CurriculoData } from '@/types/cv';
import styles from "./style.module.css";

// Importações para gerar PDF com texto real (Vetorial / ATS-Friendly)
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";

// Inicializa os fontes do pdfMake para o ambiente do navegador
const pdfMakeAny = pdfMake as any;

if (pdfMakeAny) {
  pdfMakeAny.vfs = pdfFonts && (pdfFonts as any).pdfMake 
    ? (pdfFonts as any).pdfMake.vfs 
    : pdfMakeAny.vfs;
}

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
      // 1. Busca cirurgicamente apenas o elemento do currículo
      const cvDocumento = document.querySelector('.cv-documento');
      if (!cvDocumento) {
        alert("Componente do currículo não encontrado.");
        setIsExporting(false);
        return;
      }

      // 2. Remove temporariamente o atributo contenteditable para evitar sujeira no texto do PDF
      const cloneDocumento = cvDocumento.cloneNode(true) as HTMLElement;
      cloneDocumento.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
      });

      // 3. Converte o HTML real em estrutura de dados nativa do PDF (Vetor de texto)
      // Passamos o window para o html-to-pdfmake interpretar corretamente no cliente
      const htmlConvertido = htmlToPdfmake(cloneDocumento.innerHTML, {
        window: window,
        tableAutoSize: true
      });

      // 4. Define as configurações de página e tipografia do PDF (Padrão A4)
      const documentoDefinicao: any = {
        content: htmlConvertido,
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40], // Margens limpas de 15mm nas bordas do papel
        styles: {
          // Mapeamento de estilos para garantir que preserve a formatação básica
          'cv-header': {
            alignment: 'center',
            marginBottom: 10
          },
          'cv-contatos': {
            fontSize: 10,
            alignment: 'center',
            marginBottom: 20
          },
          h3: {
            fontSize: 14,
            bold: true,
            marginTop: 15,
            marginBottom: 5,
            color: '#111111'
          },
          p: {
            fontSize: 10.5,
            lineHeight: 1.3,
            marginBottom: 8
          },
          li: {
            fontSize: 10,
            marginBottom: 4
          }
        },
        defaultStyle: {
          // Fonte padrão aceita universalmente pelos sistemas ATS
          font: 'Helvetica',
          fontSize: 10,
          color: '#222222'
        }
      };

      // Nome do arquivo baseado no nome do candidato
      const nomeLimpo = cvParaExportar.dadosPessoais?.nome
        ? cvParaExportar.dadosPessoais.nome.trim().replace(/\s+/g, '_')
        : 'Curriculo';

      // 5. Gera o PDF e faz o download direto (Sem abrir tela de impressão e com texto real!)
      pdfMakeAny.createPdf(documentoDefinicao).download(`Curriculo_${nomeLimpo}.pdf`);

    } catch (error) {
      console.error("Erro ao processar PDF nativo:", error);
      alert("Ocorreu um erro ao estruturar o PDF com texto real.");
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