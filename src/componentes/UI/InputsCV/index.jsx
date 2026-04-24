import { FileText, Briefcase } from 'lucide-react';
import "./estilo.css";

const InputsCV = ({ baseCv, setBaseCv, jobDescription, setJobDescription }) => {
  return (
    <div className="inputs-modulo">
      <h3 className="secao-titulo">1. Insira os Dados Base</h3>
      
      <div className="caixas-texto">
        <div className="input-grupo">
          <label><FileText size={16} /> Seu Currículo Atual</label>
          <textarea 
            value={baseCv} 
            onChange={(e) => setBaseCv(e.target.value)} 
            placeholder="Cole suas experiências, formações, contatos bruto aqui..."
            className="input-vidro"
          />
        </div>

        <div className="input-grupo">
          <label><Briefcase size={16} /> Descrição da Vaga Alvo</label>
          <textarea 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            placeholder="Cole os requisitos da vaga para a IA otimizar as palavras-chave..."
            className="input-vidro"
          />
        </div>
      </div>
    </div>
  );
};

export default InputsCV;