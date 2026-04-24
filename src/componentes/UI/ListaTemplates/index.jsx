import { LayoutTemplate } from 'lucide-react';

import { templatesConfig } from '../../../config/templates';
import "./estilo.css";

const ListaTemplates = ({ templateAtivo, onSelectTemplate }) => {
  return (
    <div className="templates-modulo">
      <h3 className="secao-titulo">
        <LayoutTemplate size={20} /> 2. Escolha o Design (ATS-Friendly)
      </h3>
      
      <div className="grid-templates">
        {templatesConfig.map((template) => (
          <div 
            key={template.id}
            className={`card-template ${templateAtivo === template.id ? 'ativo' : ''}`} 
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="card-preview">
              {template.wireframe}
            </div>
            <div className="card-info">
              <h4>{template.nome}</h4>
              <p>{template.desc}</p>
            </div>
            <div className="brilho-ativo"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaTemplates;