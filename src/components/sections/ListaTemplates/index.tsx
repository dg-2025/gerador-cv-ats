"use client";
import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { templatesConfig } from '@/config/templates';
import styles from "./style.module.css";

interface ListaTemplatesProps {
  templateAtivo: string;
  onSelectTemplate: (id: string) => void;
}

const ListaTemplates: React.FC<ListaTemplatesProps> = ({ templateAtivo, onSelectTemplate }) => {
  return (
    <div className={styles["templates-modulo"]}>
      <h3 className="secao-titulo">
        <LayoutTemplate size={20} /> 2. Escolha o Design (ATS-Friendly)
      </h3>
      
      <div className={styles["grid-templates"]}>
        {templatesConfig.map((template) => (
          <div 
            key={template.id}
            className={`${styles["card-template"]} ${templateAtivo === template.id ? styles.ativo : ''}`} 
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className={styles["card-preview"]}>
              {template.wireframe}
            </div>
            <div className={styles["card-info"]}>
              <h4>{template.nome}</h4>
              <p>{template.desc}</p>
            </div>
            <div className={styles["brilho-ativo"]}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaTemplates;