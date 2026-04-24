import './globals.css';

export const metadata = {
  title: 'Gerador CV ATS',
  description: 'Gerador de currículos otimizados',
  manifest: '/manifest.json',
  
  icons: {
    icon: '/imagens/lOGO.png?v=1',
    shortcut: '/imagens/lOGO.png?v=1',
    apple: '/imagens/lOGO.png?v=1',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gerador CV ATS',
  },
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        
        {}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registrado com sucesso:', registration.scope);
                    },
                    function(err) {
                      console.log('Falha no registro do SW:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}