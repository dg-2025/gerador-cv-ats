// src/components/sections/AcoesGerador/index.tsx
"use client";
import React, { useState } from 'react';
import { Bot, Download, Loader2 } from 'lucide-react';
import { CurriculoData } from '@/types/cv';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
      // 1. Aguarda as fontes carregarem perfeitamente
      if (document.fonts) {
        await document.fonts.ready;
      }

      const cvDocumento = document.querySelector('.cv-documento') as HTMLElement;
      if (!cvDocumento) {
        alert("Componente do currículo não encontrado.");
        setIsExporting(false);
        return;
      }

      // 2. Cria um container temporário e invisível forçado no tamanho A4
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '794px'; // Largura exata A4 em px (96dpi)
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.className = `template-${template}`;

      // 3. Clona o currículo para dentro desse container
      const clone = cvDocumento.cloneNode(true) as HTMLElement;
      
      // Remove atributos editáveis para não interferir na captura
      clone.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
      });

      // Força estilos no clone para garantir o layout A4 perfeito
      clone.style.width = '100%';
      clone.style.minHeight = '1123px';
      clone.style.margin = '0';
      clone.style.padding = '40px'; // Margem interna do PDF
      clone.style.boxShadow = 'none';
      clone.style.transform = 'none';

      printContainer.appendChild(clone);
      document.body.appendChild(printContainer);

      // 4. Tira um "print" de alta resolução do elemento clonado
      const canvas = await html2canvas(clone, {
        scale: 2, // Aumenta a qualidade/resolução
        useCORS: true, // Permite carregar fontes e imagens externas
        backgroundColor: '#ffffff',
        logging: false
      });

      // 5. Remove o container temporário
      document.body.removeChild(printContainer);

      // 6. Converte o canvas para PDF e baixa
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Adiciona a imagem. Se o currículo tiver mais de uma página (for mais longo), ele quebra a página
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = 297; // 297mm (Altura do A4)

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      // 7. Salva o arquivo diretamente no dispositivo
      const nomeArquivo = cvParaExportar.dadosPessoais?.nome 
        ? `Curriculo_${cvParaExportar.dadosPessoais.nome.replace(/\s+/g, '_')}.pdf` 
        : 'Curriculo_ATS.pdf';
        
      pdf.save(nomeArquivo);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
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