// src/components/ConviteContent.jsx
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import '../styles/cards.css';

export default function ConviteContent() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados do Formulário
  const [nomePrincipal, setNomePrincipal] = useState("");
  const [adultos, setAdultos] = useState([]);
  const [criancas, setCriancas] = useState([]);

  // --- Efeito do Foguete Pousando ---
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      // Garante que o valor fique entre 0 (topo) e 1 (fim da página)
      const scroll = Math.max(0, Math.min(1, totalScroll / windowHeight));
      setScrollProgress(scroll);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Lógica de Acompanhantes ---
  const changeAdultos = (n) => {
    const val = Math.max(0, Math.min(4, n)); // Máx 4 adultos extras
    setAdultos(prev => {
      const l = [...prev];
      while (l.length < val) l.push({ nome: "", parentesco: "" });
      while (l.length > val) l.pop();
      return l;
    });
  };

  const changeCriancas = (n) => {
    const val = Math.max(0, Math.min(5, n)); // Máx 5 crianças extras
    setCriancas(prev => {
      const l = [...prev];
      while (l.length < val) l.push({ nome: "", parentesco: "", idade: "" });
      while (l.length > val) l.pop();
      return l;
    });
  };

  // --- Envio para o Banco de Dados (Firebase) ---
  const confirmarPresenca = async (e) => {
    e.preventDefault();
    if (!nomePrincipal.trim()) return alert("Precisamos do nome do Capitão da família!");
    if (criancas.some(c => !c.idade)) return alert("Por favor, informe a idade de todos os pequenos astronautas.");
    
    setLoading(true);
    try {
      await addDoc(collection(db, "convidados"), {
        nomePrincipal: nomePrincipal.trim(),
        acompanhantes: [
          ...adultos.map(a => ({ ...a, tipo: "Adulto" })),
          ...criancas.map(c => ({ ...c, tipo: "Criança" })),
        ],
        totalPessoas: 1 + adultos.length + criancas.length,
        dataConfirmacao: serverTimestamp(),
      });

      // 1. Sucesso no banco!
      setSucesso(true);
      
      // 2. Dispara os fogos de artifício
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#38B6FF', '#FFD166', '#FFFFFF'] });
      
      // 3. O Foguete de rolagem volta pro topo suavemente
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error(err);
      alert("Houve um problema de comunicação com a base. Tente novamente!");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Barra de Progresso Lateral (Foguete Pousando) */}
      <div className="scroll-tracker">
        {/* Usando o mesmo ícone do foguete do splash, descendo a pista! */}
        <div className="scroll-rocket" style={{ top: `${scrollProgress * 100}%` }}>
          🚀
        </div>
      </div>

      <div className="cards-container">
        
        {/* FOTO E NOME (Aparecem logo após a fumaça) */}
        <div className="hero-photo-wrap">
          <img src="/crianca2.png" alt={import.meta.env.VITE_NOME_CRIANCA || "Lucca"} className="hero-photo" />
          <h1 className="hero-name">{import.meta.env.VITE_NOME_CRIANCA || "Nome do Aniversariante"}</h1>
          <span className="hero-badge">👨‍🚀 1 Aninho</span>
          
          {/* Mensagem de agradecimento (Só aparece DEPOIS de confirmar) */}
          {sucesso && (
            <div className="success-msg">
              <h3>Voo Confirmado! 🌌</h3>
              <p>Obrigado por confirmar presença! O {import.meta.env.VITE_NOME_CRIANCA || "Lucca"} e sua família estão muito felizes em compartilhar esse momento mágico com vocês.</p>
            </div>
          )}
        </div>

        {/* 1. MENSAGEM ESPECIAL */}
        <div className="space-card">
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

        {/* 2. DADOS DA FESTA */}
        <div className="space-card">
          <img src="/goofy11.png" alt="" className="deco-char pos-top-left float-alt-2" />
          <span className="card-icon">📍</span>
          <h2 className="card-title">Base de Lançamento</h2>
          <div className="info-row"><span className="info-icon">🗓️</span><div><p className="info-label">Data</p><p className="info-value">{import.meta.env.VITE_DATA_FESTA || "Data da Festa"}</p></div></div>
          <div className="info-row"><span className="info-icon">⏰</span><div><p className="info-label">Horário</p><p className="info-value">{import.meta.env.VITE_HORA_FESTA || "Horário da Festa"}</p></div></div>
          <div className="info-row"><span className="info-icon">🗺️</span><div><p className="info-label">Local</p><p className="info-value">{import.meta.env.VITE_LOCAL_FESTA || "Local da Festa"}</p></div></div>
          <a href={import.meta.env.VITE_LINK_MAPA || "#"} target="_blank" rel="noopener noreferrer" className="btn-map">📍 Ver no Mapa</a>
        </div>

        {/* 3. DICAS DE PRESENTE */}
        <div className="space-card">
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

        {/* 4. RSVP */}
        {!sucesso && (
          <div className="space-card">
            <img src="/mickey-mouse-astronaut.png" alt="" className="deco-char pos-top-left float-alt-2" />
            <span className="card-icon">✅</span>
            <h2 className="card-title">Confirme sua Presença</h2>
            <p className="rsvp-alert">⚠️ Confirmação até dia 15/12</p>
            
            <form onSubmit={confirmarPresenca}>
              <input type="text" className="input-field" placeholder="Nome do Responsável Principal" required value={nomePrincipal} onChange={e => setNomePrincipal(e.target.value)} />
              
              {/* Box Adultos */}
              <div className="acomp-box">
                <p className="info-label" style={{marginBottom: '10px', color: '#38B6FF'}}>Acompanhantes Adultos</p>
                <div className="counter-row">
                  <button type="button" className="counter-btn" onClick={() => changeAdultos(adultos.length - 1)}>-</button>
                  <span className="counter-val">{adultos.length}</span>
                  <button type="button" className="counter-btn" onClick={() => changeAdultos(adultos.length + 1)}>+</button>
                  <span className="counter-label">adulto(s)</span>
                </div>
                {adultos.map((a, idx) => (
                  <div key={idx} className="acomp-grid">
                    <input className="input-field" type="text" placeholder="Nome" required value={a.nome} onChange={e => { const l=[...adultos]; l[idx].nome=e.target.value; setAdultos(l); }} />
                    <input className="input-field" type="text" placeholder="Parentesco (Ex: Tia)" required value={a.parentesco} onChange={e => { const l=[...adultos]; l[idx].parentesco=e.target.value; setAdultos(l); }} />
                  </div>
                ))}
              </div>

              {/* Box Crianças */}
              <div className="acomp-box">
                <p className="info-label" style={{marginBottom: '10px', color: '#FFD166'}}>Crianças</p>
                <div className="counter-row">
                  <button type="button" className="counter-btn" onClick={() => changeCriancas(criancas.length - 1)}>-</button>
                  <span className="counter-val">{criancas.length}</span>
                  <button type="button" className="counter-btn" onClick={() => changeCriancas(criancas.length + 1)}>+</button>
                  <span className="counter-label">criança(s)</span>
                </div>
                {criancas.map((c, idx) => (
                  <div key={idx} className="acomp-grid" style={{gridTemplateColumns: '1fr', gap: '5px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                      <input className="input-field" type="text" placeholder="Nome" required value={c.nome} onChange={e => { const l=[...criancas]; l[idx].nome=e.target.value; setCriancas(l); }} />
                      <input className="input-field" type="text" placeholder="Parentesco (Ex: Primo)" required value={c.parentesco} onChange={e => { const l=[...criancas]; l[idx].parentesco=e.target.value; setCriancas(l); }} />
                    </div>
                    <select className="input-field" required value={c.idade} onChange={e => { const l=[...criancas]; l[idx].idade=e.target.value; setCriancas(l); }}>
                      <option value="">Selecione a Idade</option>
                      <option value="Menos de 1 ano">Menos de 1 ano</option>
                      {[1,2,3,4,5,6,7,8,9,10,11].map(n => (<option key={n} value={`${n} anos`}>{n} anos</option>))}
                      <option value="12 anos ou mais">12 anos ou mais</option>
                    </select>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Registrando... 🚀" : "Confirmar Voo 🚀"}
              </button>
            </form>
          </div>
        )}

        {/* 🚀 FOOTER E ASSINATURA */}
        <footer className="footer">
          Feito com <em>🚀 amor</em> para o <em>Lucca</em><br />
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