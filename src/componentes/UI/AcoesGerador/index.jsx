import { Bot, Download } from 'lucide-react';
import "./estilo.css";

const AcoesGerador = ({ onGerar, loading, disabled, hasCv, cvParaExportar, template }) => {

const handleExportPDF = async () => {
    if (!cvParaExportar) return;

    const element = document.querySelector('.cv-documento');
    if (!element) return;

    const clone = element.cloneNode(true);
    clone.classList.add('pdf-export-mode');

    
    let stylesHtml = '';
    const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');

    for (const node of styleNodes) {
      if (node.tagName.toLowerCase() === 'link') {
        const href = node.getAttribute('href');
        if (href) {
          try {
            const absoluteHref = new URL(href, window.location.origin).href;
            const response = await fetch(absoluteHref);
            const cssText = await response.text();
            stylesHtml += `<style>${cssText}</style>`;
          } catch (err) {
            console.error("Erro ao embutir CSS:", err);
          }
        }
      } else {
        stylesHtml += node.outerHTML;
      }
    }

    
    const fullHtml = `
    <!DOCTYPE html>
    <html lang="pt-PT">
    <head>
      <meta charset="UTF-8">
      <title>Currículo</title>
      
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Roboto:wght@400;700&family=Montserrat:wght@400;700;800;900&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet">
      
      ${stylesHtml} 
      
      <style>
        
        @page {
          size: A4 portrait;
          margin: 0.8cm 0; 
        }
        
        body { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          background: white !important;
          margin: 0;
          padding: 0;
        }
        
        @media print, screen {
          .folha-preview, .painel-vidro {
            box-shadow: none !important;
            transform: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            border: none !important;
          }
          
          .cv-documento {
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            padding: 0 40px !important; 
            margin: 0 auto !important;
            min-height: auto !important; 
          }
          
          .cv-secao {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          
          .cv-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          h3, h1 {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="template-${template}">
        ${clone.outerHTML}
      </div>
    </body>
    </html>
  `;

    try {
      const res = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: fullHtml,
          filename: `curriculo_${cvParaExportar.dadosPessoais?.nome?.replace(/\s+/g, '_') || 'exportado'}.pdf`
        }),
      });

      if (!res.ok) throw new Error('Falha na geração do ficheiro');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculo_${cvParaExportar.dadosPessoais?.nome?.replace(/\s+/g, '_') || 'exportado'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erro ao gerar PDF: " + e.message);
    }
  };
  return (
    <div className="acoes-modulo">
      <button onClick={onGerar} disabled={loading || disabled} className="btn-gerar">
        {loading ? (
          <span className="btn-content">Processando IA (Aguarde)...</span>
        ) : (
          <span className="btn-content"><Bot size={20} /> Gerar Currículo Otimizado</span>
        )}
      </button>

      {hasCv && (
        <button onClick={handleExportPDF} className="btn-baixar">
          <Download size={20} /> Exportar PDF
        </button>
      )}
    </div>
  );
};

export default AcoesGerador;