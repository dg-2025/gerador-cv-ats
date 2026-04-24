import "./estilo.css";

const CvPreview = ({ cv, onCvChange, template }) => {
  if (!cv) return null;

  const handleTextChange = (path, value) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    const keys = path.split('.');
    let obj = newCv;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onCvChange(newCv);
  };

  const handleArrayItemChange = (arrayPath, index, field, value) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    const arr = arrayPath.split('.').reduce((o, k) => o[k], newCv);
    arr[index][field] = value;
    onCvChange(newCv);
  };

  const handleBulletChange = (expIndex, bulletIndex, value) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    newCv.experiencias[expIndex].bullets[bulletIndex] = value;
    onCvChange(newCv);
  };

  const handleSimpleArrayChange = (field, index, value) => {
    const newCv = JSON.parse(JSON.stringify(cv));
    newCv[field][index] = value;
    onCvChange(newCv);
  };

  return (
    <div className={`folha-preview painel-vidro template-${template}`}>
      <div className="cv-documento">
        <div className="cv-header">
          <h1 contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('dadosPessoais.nome', e.target.innerText)}>
            {cv.dadosPessoais?.nome || "Nome Omitido"}
          </h1>
          <p className="cv-contatos" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('dadosPessoais.email', e.target.innerText)}>
            {cv.dadosPessoais?.email} • {cv.dadosPessoais?.telefone} 
            {cv.dadosPessoais?.linkedin && ` • ${cv.dadosPessoais.linkedin}`}
            {cv.dadosPessoais?.portfolio && ` • ${cv.dadosPessoais.portfolio}`}
          </p>
        </div>

        <div className="cv-body">
          <div className="cv-coluna-principal">
            <div className="cv-secao">
              <h3>Resumo Profissional</h3>
              <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('resumo', e.target.innerText)}>
                {cv.resumo}
              </p>
            </div>

            <div className="cv-secao">
              <h3>Experiência Profissional</h3>
              {cv.experiencias && cv.experiencias.map((exp, i) => (
                <div key={i} className="cv-item">
                  <div className="cv-item-header">
                    <strong contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('experiencias', i, 'empresa', e.target.innerText)}>
                      {exp.empresa}
                    </strong>
                    <span contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('experiencias', i, 'periodo', e.target.innerText)}>
                      {exp.periodo}
                    </span>
                  </div>
                  <div className="cv-cargo" contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('experiencias', i, 'cargo', e.target.innerText)}>
                    <em>{exp.cargo}</em>
                  </div>
                  <ul>
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleBulletChange(i, j, e.target.innerText)}>
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
                      <strong contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('projetos', i, 'nome', e.target.innerText)}>
                        {p.nome}
                      </strong>
                      <span contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('projetos', i, 'tech', e.target.innerText)}>
                        <em>{p.tech}</em>
                      </span>
                    </div>
                    <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleArrayItemChange('projetos', i, 'descricao', e.target.innerText)}>
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
              <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('habilidades', e.target.innerText)}>
                {cv.habilidades}
              </p>
            </div>

            <div className="cv-secao">
              <h3>Formação e Certificações</h3>
              <ul>
                {cv.formacao && cv.formacao.map((f, i) => (
                  <li key={`f-${i}`} className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleSimpleArrayChange('formacao', i, e.target.innerText)}>
                    {f}
                  </li>
                ))}
                {cv.certificacoes && cv.certificacoes.map((c, i) => (
                  <li key={`c-${i}`} className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleSimpleArrayChange('certificacoes', i, e.target.innerText)}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            
            {cv.idiomas && (
              <div className="cv-secao">
                <h3>Idiomas</h3>
                <p className="cv-texto" contentEditable suppressContentEditableWarning onBlur={(e) => handleTextChange('idiomas', e.target.innerText)}>
                  {cv.idiomas}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CvPreview;