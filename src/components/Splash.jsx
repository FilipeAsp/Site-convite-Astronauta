// src/components/Splash.jsx
import React, { useState } from 'react';
import '../styles/splash.css';
import SmokeEffect from './SmokeEffect';

export default function Splash({ onAnimationEnd }) {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = () => {
    setIsLaunching(true);
    
    // Aumentamos o tempo para 2.8s: 
    // 1.2s pro foguete subir e encher de fumaça + 1.6s pra fumaça dissipar!
    setTimeout(() => {
      onAnimationEnd();
    }, 2800); 
  };

  return (
    <div className={`splash-wrapper ${isLaunching ? 'launching' : ''}`}>
      
      <SmokeEffect isLaunching={isLaunching} />

      <img src="/mickey-astronaut.png" alt="Mickey" className="splash-char char-mickey" />
      <img src="/astronaut-donald-duck-star.png" alt="Donald" className="splash-char char-donald" />

      <div className="splash-content">
        <img src="/crianca.png" alt={import.meta.env.VITE_NOME_CRIANCA || "Lucca"} className="splash-photo" />
        <h1 className="splash-title">
          <span className="splash-name">{import.meta.env.VITE_NOME_CRIANCA || "Nome do Aniversariante"} faz 1!</span>
        </h1>
        <button className="btn-launch" onClick={handleLaunch}>
          Iniciar Aventura 🚀
        </button>
      </div>

      <div className="rocket-takeoff" id="rocket-ship">
        <img src="/rocket.png" alt="Foguete Decolando" className="rocket-img" />
      </div>

    </div>
  );
}