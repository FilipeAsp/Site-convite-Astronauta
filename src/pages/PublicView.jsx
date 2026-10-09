// src/pages/PublicView.jsx
import React, { useState, useRef } from "react";
import SpaceBackground from "../components/SpaceBackground";
import Splash from "../components/Splash";
import ConviteContent from "../components/ConviteContent";

export default function PublicView() {
  const [hasLaunched, setHasLaunched] = useState(false);
  const audioRef = useRef(null);

  const iniciarSite = () => {
    setHasLaunched(true);
    if (audioRef.current) {
      audioRef.current.play().catch(() => console.log("Áudio bloqueado"));
    }
  };

  return (
    <>
      <audio ref={audioRef} loop src="/musica.mp3" />

      {/* As estrelas ficam de fundo o tempo todo */}
      <SpaceBackground />

      {/* Splash carrega o Lucca, Mickey, Donald e o Foguete */}
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