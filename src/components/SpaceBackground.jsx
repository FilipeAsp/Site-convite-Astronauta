// src/components/SpaceBackground.jsx
import React from 'react';
import '../styles/space.css';

export default function SpaceBackground() {
  // 1. Poeira estelar (distantes, redondinhas e pequenas)
  const tinyStars = Array.from({ length: 40 }).map((_, i) => ({
    id: `tiny-${i}`,
    size: Math.random() * 2 + 1,      
    top: Math.random() * 100,         
    left: Math.random() * 100,        
    duration: Math.random() * 3 + 2,  
    delay: Math.random() * 5,         
  }));

  // 2. Estrelas pontudinhas (brilho maior na frente)
  const pointyStars = Array.from({ length: 15 }).map((_, i) => ({
    id: `pointy-${i}`,
    size: Math.random() * 12 + 8,     // Elas precisam ser maiores para vermos as pontas (8px a 20px)
    top: Math.random() * 100,         
    left: Math.random() * 100,        
    duration: Math.random() * 2 + 2,  // Piscam um pouco mais rápido
    delay: Math.random() * 5,         
  }));

  // 3. Estrelas cadentes
  const shootingStars = Array.from({ length: 4 }).map((_, i) => ({
    id: `shooting-${i}`,
    top: Math.random() * 50,          
    left: Math.random() * 50 + 50,    
    duration: Math.random() * 5 + 4,  
    delay: Math.random() * 10,        
  }));

  return (
    <div className="stars-container">
      {/* Renderiza poeira estelar */}
      {tinyStars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            width: `${star.size}px`, height: `${star.size}px`,
            top: `${star.top}%`, left: `${star.left}%`,
            '--duration': `${star.duration}s`, '--delay': `${star.delay}s`,
          }}
        />
      ))}

      {/* Renderiza estrelas pontudinhas mágicas */}
      {pointyStars.map((star) => (
        <div
          key={star.id}
          className="pointy-star"
          style={{
            width: `${star.size}px`, height: `${star.size}px`,
            top: `${star.top}%`, left: `${star.left}%`,
            '--duration': `${star.duration}s`, '--delay': `${star.delay}s`,
          }}
        />
      ))}

      {/* Renderiza estrelas cadentes */}
      {shootingStars.map((shooting) => (
        <div
          key={shooting.id}
          className="shooting-star"
          style={{
            top: `${shooting.top}%`, left: `${shooting.left}%`,
            '--duration': `${shooting.duration}s`, '--delay': `${shooting.delay}s`,
          }}
        />
      ))}
    </div>
  );
}