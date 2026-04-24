"use client";
import Link from 'next/link';
import BackgroundWrapper from '../componentes/Background/BackgroundWrapper';

export default function NotFound() {
  return (
    <main className="gerador-wrapper min-h-screen" style={{ justifyContent: 'center' }}>
      
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

      <div className="container-gerador painel-vidro esconder-print" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <header className="gerador-header" style={{ marginBottom: '32px' }}>
          <div className="badge-pro" style={{ background: '#fff', color: '#000', borderColor: '#fff' }}>
            ERRO 404
          </div>
          <h1 style={{ fontSize: '3rem' }}>ROTA NÃO <span className="text-destaque">ENCONTRADA</span></h1>
          <p style={{ marginTop: '20px' }}>O endpoint ou página que você buscou não existe neste servidor.</p>
        </header>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {}
          <Link href="/" className="btn-gerar" style={{ textDecoration: 'none', display: 'inline-flex', width: 'auto' }}>
            <span className="btn-content">VOLTAR PARA A BASE</span>
          </Link>
        </div>
      </div>
    </main>
  );
}