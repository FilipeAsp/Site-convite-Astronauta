// src/pages/PublicView.jsx
import React, { useState } from "react";
import SpaceBackground from "../components/SpaceBackground";
import Splash from "../components/Splash";
import ConviteContent from "../components/ConviteContent";

export default function PublicView() {
  const [hasLaunched, setHasLaunched] = useState(false);

  const iniciarSite = () => {
    // Muda a tela para mostrar o conteúdo do convite
    setHasLaunched(true);

    // Dispara a turbina de áudio!
    // Substitua 'turbina.mp3' pelo nome exato do seu arquivo que está na pasta public
    const audio = new Audio('/turbina.mp3');
    
    // Opcional: ajustar o volume se for muito alto (0.0 a 1.0)
    audio.volume = 0.5; 

    audio.play().catch(err => {
      console.error("Erro de reprodução de áudio:", err);
    });
  };

  return (
    <>
      {/* As estrelas ficam de fundo o tempo todo */}
      <SpaceBackground />

      {/* Splash carrega o Aniversariante, Mickey, Donald e o Foguete */}
      {!hasLaunched && (
        <Splash onAnimationEnd={iniciarSite} />
      )}

      {/* Os Cards Glassmorphism (Aparecem depois que a fumaça sobe) */}
      {hasLaunched && (
        <ConviteContent />
      )}
    </>
  );
}