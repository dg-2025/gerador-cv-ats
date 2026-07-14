// src/components/sections/CvPreview/index.tsx
"use client";
import React, { useRef, useEffect, useState } from 'react';
import { CurriculoData } from '@/types/cv';
import styles from "./style.module.css";

interface CvPreviewProps {
  cv: CurriculoData | null;
  onCvChange: (updatedCv: CurriculoData) => void;
  template: string;
}

const CvPreview: React.FC<CvPreviewProps> = ({ cv, onCvChange, template }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Garante que o componente está montado no cliente antes de renderizar ou calcular
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;

    const handleResize = () => {
      const containerWidth = container?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 794);
      
      // Largura exata de um A4 em pixels no desktop
      const targetWidth = 794; 
      
      // Margem de segurança de 32px para o preview não colar nas bordas do celular
      const availableWidth = containerWidth - 32;

      if (availableWidth < targetWidth && availableWidth > 0) {
        setScale(availableWidth / targetWidth);
      } else {
        setScale(1);
      }
    };

    // Executa imediatamente no carregamento
    handleResize();

    // Executa após um micro-delay para garantir que o DOM se assentou após o load
    const timeoutId = setTimeout(handleResize, 50);

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (container) {
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted]);

  if (!mounted || !cv) return null;

  // Altura base proporcional da folha A4 em pixels (1123px) multiplicada pela escala atual
  const scaledHeight = 1123 * scale;

  const handleTextChange = (path: string, value: string) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    const keys = path.split('.');
    let obj = newCv;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onCvChange(newCv);
  };

  const handleArrayItemChange = (arrayPath: string, index: number, field: string, value: string) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    const arr = arrayPath.split('.').reduce((o: any, k: string) => o[k], newCv);
    arr[index][field] = value;
    onCvChange(newCv);
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    newCv.experiencias[expIndex].bullets[bulletIndex] = value;
    onCvChange(newCv);
  };

  const handleSimpleArrayChange = (field: string, index: number, value: string) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    newCv[field][index] = value;
    onCvChange(newCv);
  };

  return (
    <div 
      ref={containerRef} 
      className={`${styles.folhaPreview} template-${template}`}
    >
      <div 
        className={styles.cvWrapper}
        style={{ 
          "--scale": `${scale}`,
          height: `${scaledHeight}px`
        } as React.CSSProperties}
      >
        <div className={`${styles.cvDocumento} cv-documento`}>
          <div className="cv-header">
            <h1 contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('dadosPessoais.nome', e.currentTarget.innerText)}>
              {cv.dadosPessoais?.nome || "Nome Omitido"}
            </h1>
            <p className="cv-contatos" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('dadosPessoais.email', e.currentTarget.innerText)}>
              {cv.dadosPessoais?.email} • {cv.dadosPessoais?.telefone} 
              {cv.dadosPessoais?.linkedin && ` • ${cv.dadosPessoais.linkedin}`}
              {cv.dadosPessoais?.portfolio && ` • ${cv.dadosPessoais.portfolio}`}
            </p>
          </div>

          <div className="cv-body">
            <div className="cv-coluna-principal">
              <div className="cv-secao">
                <h3>Resumo Profissional</h3>
                <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('resumo', e.currentTarget.innerText)}>
                  {cv.resumo}
                </p>
              </div>

              <div className="cv-secao">
                <h3>Experiência Profissional</h3>
                {cv.experiencias && cv.experiencias.map((exp, i) => (
                  <div key={i} className="cv-item">
                    <div className="cv-item-header">
                      <strong contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('experiencias', i, 'empresa', e.currentTarget.innerText)}>
                        {exp.empresa}
                      </strong>
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('experiencias', i, 'periodo', e.currentTarget.innerText)}>
                        {exp.periodo}
                      </span>
                    </div>
                    <div className="cv-cargo" contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('experiencias', i, 'cargo', e.currentTarget.innerText)}>
                      <em>{exp.cargo}</em>
                    </div>
                    <ul>
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleBulletChange(i, j, e.currentTarget.innerText)}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {cv.projetos && cv.projetos.length > 0 && (
                <div className="cv-secao">
                  <h3>Projetos em Destaque</h3>
                  {cv.projetos.map((p, i) => (
                    <div key={i} className="cv-item">
                      <div className="cv-item-header">
                        <strong contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('projetos', i, 'nome', e.currentTarget.innerText)}>
                          {p.nome}
                        </strong>
                        <span contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('projetos', i, 'tech', e.currentTarget.innerText)}>
                          <em>{p.tech}</em>
                        </span>
                      </div>
                      <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('projetos', i, 'descricao', e.currentTarget.innerText)}>
                        {p.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cv-coluna-lateral">
              <div className="cv-secao">
                <h3>Habilidades Técnicas</h3>
                <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('habilidades', e.currentTarget.innerText)}>
                  {cv.habilidades}
                </p>
              </div>

              <div className="cv-secao">
                <h3>Formação e Certificações</h3>
                <ul>
                  {cv.formacao && cv.formacao.map((f, i) => (
                    <li key={`f-${i}`} className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleSimpleArrayChange('formacao', i, e.currentTarget.innerText)}>
                      {f}
                    </li>
                  ))}
                  {cv.certificacoes && cv.certificacoes.map((c, i) => (
                    <li key={`c-${i}`} className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleSimpleArrayChange('certificacoes', i, e.currentTarget.innerText)}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              
              {cv.idiomas && (
                <div className="cv-secao">
                  <h3>Idiomas</h3>
                  <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('idiomas', e.currentTarget.innerText)}>
                    {cv.idiomas}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CvPreview;