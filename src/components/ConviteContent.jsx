import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import '../styles/cards.css';

/* ---------- DADOS DA FESTA ---------- */
const nomeAniversariante = import.meta.env.VITE_NOME_CRIANCA || "Lucca";
const dataConfig = import.meta.env.VITE_DATA_FESTA || "2026-12-23"; 
const horaConfig = import.meta.env.VITE_HORA_FESTA || "19h30";
const horaLimpa = horaConfig.replace(/h/i, ':');

const EVENT_DATE = new Date(`${dataConfig}T${horaLimpa}:00-03:00`);

const formatarDataCard = (dateObj) => {
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${dateObj.getDate()} de ${meses[dateObj.getMonth()]} de ${dateObj.getFullYear()}`;
};
const dataExibicao = formatarDataCard(EVENT_DATE);

const EVENT_LOCAL = { address: import.meta.env.VITE_LOCAL_FESTA || "Endereço a definir" };

const formatarParaAgenda = (dataISO, horasAdicionais = 0) => {
  const d = new Date(dataISO);
  if (horasAdicionais > 0) d.setHours(d.getHours() + horasAdicionais);
  
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const seg = String(d.getSeconds()).padStart(2, '0');
  
  return `${ano}${mes}${dia}T${hora}${min}${seg}`;
};

const dateStartAgenda = formatarParaAgenda(EVENT_DATE);
const dateEndAgenda = formatarParaAgenda(EVENT_DATE, 4); 

const CALENDAR_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  `&text=${encodeURIComponent(`1º Aninho do ${nomeAniversariante} 🚀`)}` +
  `&dates=${dateStartAgenda}/${dateEndAgenda}` +
  `&ctz=America/Sao_Paulo` + 
  `&location=${encodeURIComponent(EVENT_LOCAL.address)}` +
  `&details=${encodeURIComponent(`Venha celebrar o 1º aninho do ${nomeAniversariante}! Esperamos por você com muito amor.`)}`;

const MAP_URL = import.meta.env.VITE_LINK_MAPA || `https://maps.google.com/?q=${encodeURIComponent(EVENT_LOCAL.address)}`;

/* ---------- Contagem regressiva ---------- */
function useCountdown(target) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      dias: Math.floor(diff / 86400000),
      horas: Math.floor((diff / 3600000) % 24),
      min: Math.floor((diff / 60000) % 60),
      seg: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const pad = (n) => String(n).padStart(2, '0');

export default function ConviteContent() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  
  const [isMuted, setIsMuted] = useState(false);
  
  const toggleMute = () => {
    if (window.conviteMusic) {
      window.conviteMusic.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const [nomePrincipal, setNomePrincipal] = useState("");
  const [adultos, setAdultos] = useState([]);
  const [criancas, setCriancas] = useState([]);

  const countdown = useCountdown(EVENT_DATE);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = height > 0 ? Math.max(0, Math.min(1, total / height)) : 0;
      setScrollProgress(scroll);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sucesso]);

  const changeAdultos = (n) => {
    const val = Math.max(0, Math.min(4, n));
    setAdultos((prev) => {
      const l = [...prev];
      while (l.length < val) l.push({ nome: "", parentesco: "" });
      while (l.length > val) l.pop();
      return l;
    });
  };

  const changeCriancas = (n) => {
    const val = Math.max(0, Math.min(5, n));
    setCriancas((prev) => {
      const l = [...prev];
      while (l.length < val) l.push({ nome: "", parentesco: "", idade: "" });
      while (l.length > val) l.pop();
      return l;
    });
  };

  const updateItem = (setter, idx, field, value) => {
    setter((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const fireConfetti = () => {
    const colors = ['#38B6FF', '#FFD166', '#FFFFFF', '#9D5CE6'];
    const end = Date.now() + 2000;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors });
  };

  const confirmarPresenca = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nomePrincipal.trim()) return setErro("Precisamos do nome do Capitão da família! 👨‍🚀");
    if (criancas.some((c) => !c.idade)) return setErro("Informe a idade de todos os pequenos astronautas. 🧒");

    setLoading(true);
    try {
      await addDoc(collection(db, "convidados"), {
        nomePrincipal: nomePrincipal.trim(),
        acompanhantes: [
          ...adultos.map((a) => ({ ...a, tipo: "Adulto" })),
          ...criancas.map((c) => ({ ...c, tipo: "Criança" })),
        ],
        totalPessoas: 1 + adultos.length + criancas.length,
        dataConfirmacao: serverTimestamp(),
      });

      setSucesso(true);
      fireConfetti();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErro("Houve um problema de comunicação com a base. Tente novamente! 🛰️");
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn-mute" onClick={toggleMute} aria-label="Mutar música">
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div className="scroll-tracker">
         <div className="scroll-rocket" style={{ top: `${scrollProgress * 100}%` }}>🚀</div>
      </div>

      <div className="cards-container">
        <div className="hero-photo-wrap reveal">
          <div className="hero-photo-frame">
            <img src="/crianca2.png" alt={nomeAniversariante} className="hero-photo" />
          </div>
          <h1 className="hero-name">{nomeAniversariante}</h1>
          <span className="hero-badge">👨‍🚀 1 Aninho</span>

          <div className="countdown-wrapper">
            <p className="countdown-title">Tempo para o lançamento 🚀</p>
            <div className="countdown" aria-label="Contagem regressiva para a festa">
              {countdown ? (
                <>
                  <div className="count-box"><strong>{pad(countdown.dias)}</strong><span>dias</span></div>
                  <div className="count-box"><strong>{pad(countdown.horas)}</strong><span>horas</span></div>
                  <div className="count-box"><strong>{pad(countdown.min)}</strong><span>min</span></div>
                  <div className="count-box"><strong>{pad(countdown.seg)}</strong><span>seg</span></div>
                </>
              ) : (
                <div className="count-done">🎉 Lançamento autorizado! A festa chegou!</div>
              )}
            </div>
          </div>

          {sucesso && (
            <div className="success-msg">
              <h3>Voo Confirmado! 🌌</h3>
              <p>Obrigado por confirmar presença! O {nomeAniversariante} e sua família estão muito felizes em compartilhar esse momento mágico com vocês.</p>
            </div>
          )}
        </div>

        <div className="space-card reveal">
          <img src="/mickey-astronaut2.png" alt="" className="deco-char pos-top-right float-alt-1" />
          <span className="card-icon" style={{ marginTop: '10px' }}>✨</span>
          <h2 className="card-title">Um Ano de Magia</h2>
          <p className="card-text">
            Com muita alegria, convidamos você para celebrar um dos momentos mais especiais de nossas vidas: o 1º aninho do nosso pequeno!
            <br /><br />
            Há um ano, nossos dias ganharam mais amor, sorrisos e felicidade. E essa comemoração só estará completa com a presença de pessoas tão importantes como você.
            <br /><br />
            Venha compartilhar esse dia inesquecível conosco, repleto de carinho, diversão e muitas lembranças especiais.
            <br /><br />
            <strong>Esperamos por você com muito amor!</strong>
          </p>
        </div>

        <div className="space-card reveal">
          <img src="/goofy11.png" alt="" className="deco-char pos-top-left float-alt-2" />
          <span className="card-icon">📍</span>
          <h2 className="card-title">Base de Lançamento</h2>
          <div className="info-row">
            <span className="info-icon">🗓️</span>
            <div><p className="info-label">Data</p><p className="info-value">{dataExibicao}</p></div>
          </div>
          <div className="info-row">
            <span className="info-icon">⏰</span>
            <div><p className="info-label">Horário</p><p className="info-value">{horaConfig}</p></div>
          </div>
          <div className="info-row">
            <span className="info-icon">🗺️</span>
            <div><p className="info-label">Local</p><p className="info-value">{EVENT_LOCAL.address}</p></div>
          </div>
          <div className="btn-group">
            <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="btn-map">📍 Ver no Mapa</a>
            <a href={CALENDAR_URL} target="_blank" rel="noopener noreferrer" className="btn-calendar">📅 Adicionar à agenda</a>
          </div>
        </div>

        <div className="space-card reveal">
          <img src="/june217.png" alt="" className="deco-char pos-bottom-right float-alt-3" />
          <span className="card-icon">🎁</span>
          <h2 className="card-title">Dicas de Presente</h2>
          <p className="card-text">Sua presença é o mais importante, mas caso queira me dar uma lembrancinha:</p>
          <div className="gift-grid">
            <div className="gift-item"><span className="gift-emoji">👕</span><span className="gift-label">Roupa: Tamanho 2 anos</span></div>
            <div className="gift-item"><span className="gift-emoji">👟</span><span className="gift-label">Calçado: 20/21</span></div>
            <div className="gift-item"><span className="gift-emoji">🧸</span><span className="gift-label">Brinquedos macios, sonoros ou interativos</span></div>
          </div>
        </div>

        {!sucesso && (
          <div className="space-card reveal">
            <img src="/mickey-mouse-astronaut.png" alt="" className="deco-char pos-top-left float-alt-2" />
            <span className="card-icon">✅</span>
            <h2 className="card-title">Confirme sua Presença</h2>
            <p className="rsvp-alert">⚠️ Confirmação até dia 15/12</p>

            <form onSubmit={confirmarPresenca} noValidate>
              <input
                type="text"
                className="input-field"
                placeholder="Nome do Responsável Principal"
                required
                value={nomePrincipal}
                onChange={(e) => setNomePrincipal(e.target.value)}
              />

              <div className="acomp-box">
                <p className="info-label" style={{ marginBottom: '10px', color: '#38B6FF' }}>Acompanhantes Adultos</p>
                <div className="counter-row">
                  <button type="button" className="counter-btn" aria-label="Remover adulto" onClick={() => changeAdultos(adultos.length - 1)}>−</button>
                  <span className="counter-val">{adultos.length}</span>
                  <button type="button" className="counter-btn" aria-label="Adicionar adulto" onClick={() => changeAdultos(adultos.length + 1)}>+</button>
                  <span className="counter-label">adulto(s)</span>
                </div>
                {adultos.map((a, idx) => (
                  <div key={idx} className="acomp-grid">
                    <input className="input-field" type="text" placeholder="Nome" required value={a.nome}
                      onChange={(e) => updateItem(setAdultos, idx, 'nome', e.target.value)} />
                    <input className="input-field" type="text" placeholder="Parentesco (Ex: Tia)" required value={a.parentesco}
                      onChange={(e) => updateItem(setAdultos, idx, 'parentesco', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="acomp-box">
                <p className="info-label" style={{ marginBottom: '10px', color: '#FFD166' }}>Crianças</p>
                <div className="counter-row">
                  <button type="button" className="counter-btn" aria-label="Remover criança" onClick={() => changeCriancas(criancas.length - 1)}>−</button>
                  <span className="counter-val">{criancas.length}</span>
                  <button type="button" className="counter-btn" aria-label="Adicionar criança" onClick={() => changeCriancas(criancas.length + 1)}>+</button>
                  <span className="counter-label">criança(s)</span>
                </div>
                {criancas.map((c, idx) => (
                  <div key={idx} className="acomp-grid acomp-grid-kid">
                    <div className="acomp-grid">
                      <input className="input-field" type="text" placeholder="Nome" required value={c.nome}
                        onChange={(e) => updateItem(setCriancas, idx, 'nome', e.target.value)} />
                      <input className="input-field" type="text" placeholder="Parentesco (Ex: Primo)" required value={c.parentesco}
                        onChange={(e) => updateItem(setCriancas, idx, 'parentesco', e.target.value)} />
                    </div>
                    <select className="input-field" required value={c.idade}
                      onChange={(e) => updateItem(setCriancas, idx, 'idade', e.target.value)}>
                      <option value="">Selecione a Idade</option>
                      <option value="Menos de 1 ano">Menos de 1 ano</option>
                      {[1,2,3,4,5,6,7,8,9,10,11].map((n) => (
                        <option key={n} value={`${n} anos`}>{n} anos</option>
                      ))}
                      <option value="12 anos ou mais">12 anos ou mais</option>
                    </select>
                  </div>
                ))}
              </div>

              {erro && <p className="form-error" role="alert" style={{color: '#FF6B6B', marginBottom: '15px'}}>{erro}</p>}

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Registrando... 🚀" : "Confirmar Voo 🚀"}
              </button>
            </form>
          </div>
        )}

        <footer className="footer reveal">
          Feito com <em>🚀 amor</em> para o <em>{nomeAniversariante}</em><br />
          <a href="/admin" className="footer-admin-link">⚙ área restrita</a>
          <div className="footer-asp-wrapper">
            <p className="footer-asp-label">Feito e desenvolvido por</p>
            <a href="https://www.instagram.com/asp_code/" target="_blank" rel="noopener noreferrer">
              <img src="/assinatura.png" alt="ASP Code" className="footer-asp-logo" />
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}