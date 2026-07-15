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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;

    const handleResize = () => {
      const containerWidth = container?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 794);
      const targetWidth = 794;
      const availableWidth = containerWidth - 32;

      if (availableWidth < targetWidth && availableWidth > 0) {
        setScale(availableWidth / targetWidth);
      } else {
        setScale(1);
      }
    };

    handleResize();
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

  // Função segura para renderizar texto com fallback
  const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      // Se for um objeto com text, extrai
      if (value.text && typeof value.text === 'string') return value.text;
      return JSON.stringify(value);
    }
    return String(value);
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
            <h1>{safeText(cv.dadosPessoais?.nome) || "Nome Omitido"}</h1>
            <p className="cv-contatos">
              {safeText(cv.dadosPessoais?.email)}
              {cv.dadosPessoais?.telefone && ` • ${safeText(cv.dadosPessoais.telefone)}`}
              {cv.dadosPessoais?.linkedin && ` • ${safeText(cv.dadosPessoais.linkedin)}`}
              {cv.dadosPessoais?.portfolio && ` • ${safeText(cv.dadosPessoais.portfolio)}`}
            </p>
          </div>

          <div className="cv-body">
            <div className="cv-coluna-principal">
              {/* Resumo */}
              <div className="cv-secao">
                <h3>Resumo Profissional</h3>
                <p className="cv-texto">{safeText(cv.resumo)}</p>
              </div>

              {/* Experiências */}
              {cv.experiencias && cv.experiencias.length > 0 && (
                <div className="cv-secao">
                  <h3>Experiência Profissional</h3>
                  {cv.experiencias.map((exp, i) => (
                    <div key={i} className="cv-item">
                      <div className="cv-item-header">
                        <strong>{safeText(exp.empresa)}</strong>
                        <span>{safeText(exp.periodo)}</span>
                      </div>
                      <div className="cv-cargo">
                        <em>{safeText(exp.cargo)}</em>
                      </div>
                      <ul>
                        {exp.bullets && exp.bullets.map((b, j) => (
                          <li key={j} className="cv-texto">{safeText(b)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projetos */}
              {cv.projetos && cv.projetos.length > 0 && (
                <div className="cv-secao">
                  <h3>Projetos em Destaque</h3>
                  {cv.projetos.map((p, i) => (
                    <div key={i} className="cv-item">
                      <div className="cv-item-header">
                        <strong>{safeText(p.nome)}</strong>
                        <span><em>{safeText(p.tech)}</em></span>
                      </div>
                      <p className="cv-texto">{safeText(p.descricao)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cv-coluna-lateral">
              {/* Habilidades */}
              {cv.habilidades && (
                <div className="cv-secao">
                  <h3>Habilidades Técnicas</h3>
                  <p className="cv-texto">{safeText(cv.habilidades)}</p>
                </div>
              )}

              {/* Formação e Certificações */}
              <div className="cv-secao">
                <h3>Formação e Certificações</h3>
                <ul>
                  {cv.formacao && cv.formacao.map((f, i) => (
                    <li key={`f-${i}`} className="cv-texto">{safeText(f)}</li>
                  ))}
                  {cv.certificacoes && cv.certificacoes.map((c, i) => (
                    <li key={`c-${i}`} className="cv-texto">{safeText(c)}</li>
                  ))}
                </ul>
              </div>
              
              {/* Idiomas */}
              {cv.idiomas && (
                <div className="cv-secao">
                  <h3>Idiomas</h3>
                  <p className="cv-texto">{safeText(cv.idiomas)}</p>
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