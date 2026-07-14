declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

/// <reference types="@react-three/fiber" />

// ADICIONE ESTA LINHA:
declare module "maath/random/dist/maath-random.esm";