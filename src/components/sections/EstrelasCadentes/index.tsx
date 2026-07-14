"use client";
import React, { useEffect, useState } from "react";
import styles from "./style.module.css";

interface Estrela {
  id: number;
  angulo: number;
  style: React.CSSProperties;
}

const EstrelasCadentes: React.FC = () => {
  const [estrelas, setEstrelas] = useState<Estrela[]>([]);

  useEffect(() => {
    const gerarEstrelas = () => {
      const novasEstrelas = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        angulo: Math.random() * 360,
        style: {
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
          zIndex: Math.random() > 0.5 ? 10 : 1,
        } as React.CSSProperties,
      }));
      setEstrelas(novasEstrelas);
    };
    gerarEstrelas();
  }, []);

  return (
    <div className={styles["container-estrelas-cadentes"]}>
      <div className={styles["centro-gravitacional"]}>
        {estrelas.map((estrela) => (
          <div 
            key={estrela.id} 
            className={styles["trilho-estrela"]} 
            style={{ transform: `rotate(${estrela.angulo}deg)`, zIndex: estrela.style.zIndex }}
          >
            <div className={styles["estrela-corpo"]} style={estrela.style}>
              <div className={styles.rastro}></div>
              <div className={styles.nucleo}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstrelasCadentes;