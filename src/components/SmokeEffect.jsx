// src/components/SmokeEffect.jsx
import React, { useEffect, useRef } from 'react';
import smokemachine from './smoke.js';

export default function SmokeEffect({ isLaunching }) {
  const canvasRef = useRef(null);
  const partyRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const party = smokemachine(ctx, [230, 235, 240]);
    partyRef.current = party;
    party.start();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      party.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isLaunching && partyRef.current) {
      const party = partyRef.current;
      let timeEmitting = 0;
      
      party.setPreDrawCallback((dt) => {
        timeEmitting += dt;
        
        // Gera fumaça pelos primeiros 1.5s (enquanto o foguete sobe)
        if (timeEmitting < 1500) {
          const rocket = document.getElementById('rocket-ship');
          
          if (rocket) {
            // Pega a posição exata do foguete na tela!
            const x = rocket.offsetLeft + rocket.offsetWidth / 2;
            const y = rocket.offsetTop + rocket.offsetHeight; // Fumaça sai da bunda do foguete
            
            // Cospe 15 bolhas de fumaça por quadro exatamente onde o foguete está
            party.addSmoke(x, y, 15);
          }
        }
      });
    }
  }, [isLaunching]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 50 
      }}
    />
  );
}