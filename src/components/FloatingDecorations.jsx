
// src/components/FloatingDecorations.jsx
import React from 'react';
import '../styles/floating.css';

const CHARACTERS = [
  { src: '/mickey-astronaut.png',            alt: 'Mickey Astronauta', cls: 'char-1' },
  { src: '/astronaut-donald-duck-star.png',  alt: 'Donald Astronauta', cls: 'char-2' },
  { src: '/goofy11.png',                     alt: 'Pateta',            cls: 'char-3' },
  { src: '/minnie-astronaut.png',            alt: 'Minnie',            cls: 'char-4' },
  { src: '/pluto-astronaut.png',             alt: 'Pluto',             cls: 'char-5' },
  { src: '/daisy-astronaut.png',             alt: 'Margarida',         cls: 'char-6' },
  { src: '/stitch-astronaut.png',            alt: 'Stitch',            cls: 'char-7' },
  { src: '/buzz.png',                        alt: 'Buzz Lightyear',    cls: 'char-8' },
];

export default function FloatingDecorations() {
  return (
    <div className="floating-container" aria-hidden="true">
      {CHARACTERS.map((c) => (
        <img key={c.cls} src={c.src} alt={c.alt} className={`float-img ${c.cls}`} />
      ))}
    </div>
  );
}
