// src/pages/PublicView.jsx
import React, { useState } from "react";
import SpaceBackground from "../components/SpaceBackground";
import Splash from "../components/Splash";
import ConviteContent from "../components/ConviteContent";

export default function PublicView() {
  const [hasLaunched, setHasLaunched] = useState(false);

  // Agora a função apenas muda a tela, sem tentar tocar música de novo!
  const iniciarSite = () => {
    setHasLaunched(true);
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