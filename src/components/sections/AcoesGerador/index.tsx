"use client";
import React, { useState } from 'react';
import { Bot, Download, Loader2 } from 'lucide-react';
import { CurriculoData } from '@/types/cv';
import styles from "./style.module.css";
import { exportarPDF } from '@/utils/pdfGenerator'; // Importa a nova engine!

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
      // Delay ínfimo para garantir que o botão atualize visualmente para o modo loading
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Chama o exportador vetorial que traduz o objeto nativamente!
      exportarPDF(cvParaExportar, template);
      
    } catch (error) {
      console.error("Erro crítico ao gerar PDF:", error);
      alert("Ocorreu um erro ao estruturar seu documento. Verifique a conexão.");
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
            <><Loader2 size={20} className="animate-spin" /> Preparando Arquivo...</>
          ) : (
            <><Download size={20} /> Salvar PDF (ATS)</>
          )}
        </button>
      )}
    </div>
  );
};

export default AcoesGerador;