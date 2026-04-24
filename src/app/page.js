"use client"
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';


import InputsCV from '../componentes/UI/InputsCV';
import ListaTemplates from '../componentes/UI/ListaTemplates';
import AcoesGerador from '../componentes/UI/AcoesGerador';
import CvPreview from '../componentes/UI/CvPreview';
import BackgroundWrapper from '../componentes/Background/BackgroundWrapper';

export default function Home() {
  const [baseCv, setBaseCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [cvOriginal, setCvOriginal] = useState(null);
  const [cvEditado, setCvEditado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templateAtivo, setTemplateAtivo] = useState('padrao');

  useEffect(() => {
    if (cvOriginal) setCvEditado(cvOriginal);
  }, [cvOriginal]);

  const handleGerarCurriculo = async () => {
    setLoading(true);
    setCvOriginal(null);
    try {
      const res = await fetch('/api/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseCv, jobDescription }),
      });
      const data = await res.json();
      
      if (data.curriculo) {
        setCvOriginal(data.curriculo);
      } else {
        alert("Erro: Verifique os dados inseridos.");
      }
    } catch (e) {
      alert("Erro de conexão com a IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="gerador-wrapper min-h-screen bg-background">
      
      {}
      <BackgroundWrapper />
      <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="video-fundo-port"
      >
          <source src="/videos/blackhole.webm" type="video/webm" />
      </video>

      {}
      <div className="container-gerador painel-vidro esconder-print">
        
        <header className="gerador-header">
          <div className="badge-pro">
            <Sparkles size={16} /> ALGO-READY ATS
          </div>
          <h1>ATS  <span className="text-destaque">PENETRATION</span></h1>
          <p>Faça seu currículo de acordo com a vaga que você deseja.</p>
        </header>

        <InputsCV 
          baseCv={baseCv} 
          setBaseCv={setBaseCv}
          jobDescription={jobDescription} 
          setJobDescription={setJobDescription}
        />

        <AcoesGerador 
          onGerar={handleGerarCurriculo} 
          loading={loading} 
          disabled={!baseCv || !jobDescription} 
          hasCv={!!cvOriginal} 
          cvParaExportar={cvEditado}
          template={templateAtivo}
        />

        <ListaTemplates 
          templateAtivo={templateAtivo} 
          onSelectTemplate={setTemplateAtivo} 
        />
      </div>

      <CvPreview 
        cv={cvEditado} 
        onCvChange={setCvEditado} 
        template={templateAtivo} 
      />
    </main>
  );
}