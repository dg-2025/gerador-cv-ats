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

// Força o cast para 'any' para contornar limitações de tipagem estrita do pacote @types/pdfmake
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
      // 1. Busca cirurgicamente apenas o elemento do currículo na tela
      const cvDocumento = document.querySelector('.cv-documento');
      if (!cvDocumento) {
        alert("Componente do currículo não encontrado.");
        setIsExporting(false);
        return;
      }

      // 2. Clona o elemento e remove o atributo "contenteditable" para evitar sujeira visual no PDF
      const cloneDocumento = cvDocumento.cloneNode(true) as HTMLElement;
      cloneDocumento.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
      });

      // 3. Converte o HTML real clonado em uma árvore de dados compatível com o pdfMake
      const htmlConvertido = htmlToPdfmake(cloneDocumento.innerHTML, {
        window: window,
        tableAutoSize: true
      });

      // 4. Define as configurações de página, margens e o mapeamento estrito das fontes nativas
      const documentoDefinicao: any = {
        content: htmlConvertido,
        pageSize: 'A4',
        pageMargins: [40, 45, 40, 45], // Margens equilibradas para manter o padrão A4 limpo

        // Mapeamento obrigatório para que os pesos de fontes funcionem perfeitamente (bold, italics, etc)
        fonts: {
          Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalic: 'Helvetica-BoldOblique'
          }
        },

        styles: {
          // Garante que as classes de posicionamento e tamanhos mantenham a fidelidade
          'cv-header': {
            alignment: 'center',
            marginBottom: 12
          },
          'cv-contatos': {
            fontSize: 10,
            alignment: 'center',
            marginBottom: 22
          },
          h3: {
            fontSize: 13,
            bold: true,
            marginTop: 14,
            marginBottom: 6,
            color: '#111111'
          },
          p: {
            fontSize: 10,
            lineHeight: 1.3,
            marginBottom: 6
          },
          li: {
            fontSize: 9.5,
            marginBottom: 4
          }
        },
        defaultStyle: {
          // Fonte Helvetica é a mais recomendada e suportada nativamente por leitores ATS
          font: 'Helvetica',
          fontSize: 10,
          color: '#222222'
        }
      };

      // Limpa espaços no nome do arquivo para o download direto
      const nomeLimpo = cvParaExportar.dadosPessoais?.nome
        ? cvParaExportar.dadosPessoais.nome.trim().replace(/\s+/g, '_')
        : 'Curriculo';

      // 5. Gera o PDF vetorial e dispara o download silencioso direto no navegador mobile
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