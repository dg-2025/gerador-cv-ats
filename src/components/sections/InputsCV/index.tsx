"use client";
import React from 'react';
import { FileText, Briefcase } from 'lucide-react';
import styles from "./style.module.css";

interface InputsCVProps {
  baseCv: string;
  setBaseCv: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
}

const InputsCV: React.FC<InputsCVProps> = ({ 
  baseCv, 
  setBaseCv, 
  jobDescription, 
  setJobDescription 
}) => {
  return (
    <div className={styles["inputs-modulo"]}>
      <h3 className="secao-titulo">1. Insira os Dados Base</h3>
      
      <div className={styles["caixas-texto"]}>
        <div className={styles["input-grupo"]}>
          <label><FileText size={16} /> Seu Currículo Atual</label>
          <textarea 
            value={baseCv} 
            onChange={(e) => setBaseCv(e.target.value)} 
            placeholder="Cole suas experiências, formações, contatos bruto aqui..."
            className={styles["input-vidro"]}
          />
        </div>

        <div className={styles["input-grupo"]}>
          <label><Briefcase size={16} /> Descrição da Vaga Alvo</label>
          <textarea 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            placeholder="Cole os requisitos da vaga para a IA otimizar as palavras-chave..."
            className={styles["input-vidro"]}
          />
        </div>
      </div>
    </div>
  );
};

export default InputsCV;