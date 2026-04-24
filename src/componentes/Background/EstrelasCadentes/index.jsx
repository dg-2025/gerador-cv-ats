"use client";
import React, { useEffect, useState } from "react";
import "./style.css";

const EstrelasCadentes = () => {
  const [estrelas, setEstrelas] = useState([]);

  useEffect(() => {
    const gerarEstrelas = () => {
      const novasEstrelas = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        angulo: Math.random() * 360,
        style: {
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
          zIndex: Math.random() > 0.5 ? 10 : 1,
        },
      }));
      setEstrelas(novasEstrelas);
    };
    gerarEstrelas();
  }, []);

  return (
    <div className="container-estrelas-cadentes">
      <div className="centro-gravitacional">
        {estrelas.map((estrela) => (
          <div key={estrela.id} className="trilho-estrela" style={{ transform: `rotate(${estrela.angulo}deg)`, zIndex: estrela.style.zIndex }}>
            <div className="estrela-corpo" style={estrela.style}>
              <div className="rastro"></div>
              <div className="nucleo"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstrelasCadentes;