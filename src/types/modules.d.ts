declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

/// <reference types="@react-three/fiber" />

// ADICIONE ESTA LINHA:
declare module "maath/random/dist/maath-random.esm";

// ADICIONE ESTA NOVA DECLARAÇÃO AQUI:
declare module "html-to-pdfmake" {
  function htmlToPdfmake(html: string, options?: any): any;
  export default htmlToPdfmake;
}