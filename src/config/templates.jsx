import React from 'react';

export const templatesConfig = [
  { 
    id: 'padrao', 
    nome: 'Clássico (Harvard)', 
    desc: 'Estrutura tradicional linear. Foco 100% na leitura por robôs ATS.',
    wireframe: (
      <div className="wireframe">
        <div className="linha centro w-60 bg-escuro"></div>
        <div className="linha separator"></div>
        <div className="linha w-80"></div>
        <div className="linha w-60"></div>
      </div>
    )
  },
  { 
    id: 'moderno', 
    nome: 'Moderno Clean', 
    desc: 'Design minimalista com hierarquia clara e toques de cor sutil.',
    wireframe: (
      <div className="wireframe">
        <div className="linha destaque grossa w-70"></div>
        <div className="linha w-40 mb"></div>
        <div className="linha w-100 mt"></div>
        <div className="linha w-80"></div>
      </div>
    )
  },
  { 
    id: 'colunas', 
    nome: 'Design Estratégico', 
    desc: 'Layout em grid (colunas) para facilitar a leitura humana.',
    wireframe: (
      <div className="wireframe">
        <div className="linha centro w-50 h-6"></div>
        <div className="wf-body mt">
          <div className="wf-col-esq">
            <div className="linha destaque w-60"></div>
            <div className="linha w-100"></div>
          </div>
          <div className="wf-col-dir">
            <div className="linha destaque w-80"></div>
            <div className="linha w-100"></div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'executivo', 
    nome: 'Executivo Sênior', 
    desc: 'Tipografia serifada, bordas marcantes, foco em liderança.',
    wireframe: (
      <div className="wireframe">
        <div className="linha separator-thick"></div>
        <div className="linha centro w-50 h-8"></div>
        <div className="linha separator-thick mb"></div>
        <div className="linha w-90"></div>
      </div>
    )
  },
  { 
    id: 'tecnico', 
    nome: 'Perfil Tech', 
    desc: 'Design compacto, divisores técnicos, ideal para TI e Devs.',
    wireframe: (
      <div className="wireframe">
        <div className="linha w-40 h-6 bg-escuro"></div>
        <div className="linha w-30 border-dashed mb"></div>
        <div className="linha w-100"></div>
        <div className="linha w-80"></div>
      </div>
    )
  },
  { 
    id: 'minimalista', 
    nome: 'Minimalista Puro', 
    desc: 'Espaços amplos, sem bordas pesadas, sem distrações.',
    wireframe: (
      <div className="wireframe">
        <div className="linha w-60 h-4"></div>
        <div className="linha w-30 mt-large mb"></div>
        <div className="linha w-80"></div>
      </div>
    )
  },
  { 
    id: 'corporativo', 
    nome: 'Corporativo', 
    desc: 'Títulos com fundo destacado para leitura visual rápida.',
    wireframe: (
      <div className="wireframe">
        <div className="linha w-50 h-6"></div>
        <div className="linha w-100 block-bg mt">
          <div className="linha w-40 bg-branco"></div>
        </div>
        <div className="linha w-80 mt"></div>
      </div>
    )
  },
  { 
    id: 'criativo', 
    nome: 'Agência Criativa', 
    desc: 'Layout com foco em alinhamentos marcados e cor vibrante.',
    wireframe: (
      <div className="wireframe">
        <div className="linha w-40 h-8"></div>
        <div className="wf-body mt">
          <div className="wf-col-borda">
            <div className="linha w-80 destaque"></div>
            <div className="linha w-100"></div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'lateral', 
    nome: 'Lateral Profissional', 
    desc: 'Sidebar com contato e habilidades em destaque.',
    wireframe: (
      <div className="wireframe">
        <div className="wf-body">
          <div className="wf-col-esq w-30">
            <div className="linha bg-escuro w-100"></div>
            <div className="linha w-80"></div>
          </div>
          <div className="wf-col-dir w-70">
            <div className="linha destaque w-60"></div>
            <div className="linha w-100"></div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'elegante', 
    nome: 'Elegante Serifado', 
    desc: 'Tipografia refinada e espaçamento generoso.',
    wireframe: (
      <div className="wireframe">
        <div className="linha centro w-40 h-6" style={{borderRadius:'2px'}}></div>
        <div className="linha centro w-60 mt"></div>
        <div className="linha w-90 mt"></div>
        <div className="linha w-70"></div>
      </div>
    )
  }
];