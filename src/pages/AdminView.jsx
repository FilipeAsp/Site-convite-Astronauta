// src/pages/AdminView.jsx
import React, { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/admin.css";

export default function AdminView() {
  const [auth, setAuth] = useState(sessionStorage.getItem("admin_auth") === "true");
  const [senhaInput, setSenhaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [erroAuth, setErroAuth] = useState("");

  const [convidados, setConvidados] = useState([]);
  const [stats, setStats] = useState({ familias: 0, totalPessoas: 0, adultos: 0, criancas: 0, pagantes: 0, gratuitas: 0 });
  const [novaSenha, setNovaSenha] = useState("");

  // Puxa a idade limite do .env (Se não achar, usa 5 como padrão de segurança)
  const IDADE_PAGANTE = parseInt(import.meta.env.VITE_FREE_AGE_LIMIT) || 5;

  // Carrega a biblioteca do Excel (SheetJS)
  useEffect(() => {
    if (!document.getElementById("sheetjs-script")) {
      const script = document.createElement("script");
      script.id = "sheetjs-script";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true); setErroAuth("");
    try {
      const ref = doc(db, "config", "admin");
      const snap = await getDoc(ref);
      let senhaCorreta = "Lucca01"; 
      if (snap.exists()) { senhaCorreta = snap.data().senha; } 
      else { await setDoc(ref, { senha: "Lucca01" }); }
      
      if (senhaInput === senhaCorreta) {
        sessionStorage.setItem("admin_auth", "true"); setAuth(true);
      } else { setErroAuth("Senha incorreta. Tente novamente."); }
    } catch { setErroAuth("Erro ao conectar ao banco de dados."); }
    setLoading(false);
  };

  const carregarConvidados = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "convidados"));
      const lista = []; 
      let fam = 0, pessoas = 0, adult = 0, cri = 0, pagantes = 0, gratuitas = 0;

      snap.forEach(d => {
        const data = d.data();
        lista.push({ id: d.id, ...data });
        fam++;
        pessoas += data.totalPessoas || 1;
        adult++; // O titular (Responsável) conta como adulto
        
        if (data.acompanhantes) {
          data.acompanhantes.forEach(a => {
            if (a.tipo === "Criança") {
              cri++;
              // Lógica de idade
              let anos = null;
              const str = a.idade || "";
              if (str.toLowerCase().includes("menos")) anos = 0;
              else if (str.includes("12 anos ou mais")) anos = 12;
              else { const n = parseInt(str); if (!isNaN(n)) anos = n; }

              // Compara com a variável do .env
              if (anos !== null && anos > IDADE_PAGANTE) pagantes++;
              else gratuitas++;
            } else {
              adult++;
            }
          });
        }
      });
      
      setConvidados(lista);
      setStats({ familias: fam, totalPessoas: pessoas, adultos: adult, criancas: cri, pagantes, gratuitas });
    } catch (e) {
      console.log(e);
      alert("Erro ao puxar dados do Firebase.");
    }
  }, [IDADE_PAGANTE]);

  useEffect(() => { if (auth) carregarConvidados(); }, [auth, carregarConvidados]);

  const excluir = async (id) => {
    if (!window.confirm("Remover este convidado da lista espacial?")) return;
    try { await deleteDoc(doc(db, "convidados", id)); await carregarConvidados(); }
    catch { alert("Erro ao remover."); }
  };

  const trocarSenha = async (e) => {
    e.preventDefault();
    if (!novaSenha.trim()) return;
    try { await updateDoc(doc(db, "config", "admin"), { senha: novaSenha }); alert("Senha alterada com sucesso!"); setNovaSenha(""); }
    catch { alert("Erro ao alterar senha."); }
  };

  const logout = () => { sessionStorage.removeItem("admin_auth"); setAuth(false); };

  // --- GERAR EXCEL ---
  const baixarExcel = () => {
    if (!window.XLSX) return alert("Aguarde a biblioteca carregar e tente novamente.");
    const XLSX = window.XLSX;
    const rows = [];

    convidados.forEach(conv => {
      rows.push({
        "Tipo": "Responsável", "Nome": conv.nomePrincipal, "Parentesco": "—", "Idade": "—", "Pagante?": "Sim (Adulto)",
      });
      (conv.acompanhantes || []).forEach(a => {
        if (a.tipo === "Adulto") {
          rows.push({ "Tipo": "Acompanhante", "Nome": a.nome, "Parentesco": a.parentesco || "—", "Idade": "—", "Pagante?": "Sim (Adulto)" });
        } else {
          let anos = null;
          const str = a.idade || "";
          if (str.toLowerCase().includes("menos")) anos = 0;
          else if (str.includes("12 anos ou mais")) anos = 12;
          else { const n = parseInt(str); if (!isNaN(n)) anos = n; }

          const pagante = anos === null ? "Verificar" : (anos >= IDADE_PAGANTE ? "Sim" : "Não");
          rows.push({ "Tipo": "Criança", "Nome": a.nome, "Parentesco": a.parentesco || "—", "Idade": a.idade || "—", "Pagante?": pagante === "Sim" ? `Sim (${IDADE_PAGANTE}+ anos)` : pagante === "Não" ? `Não (< ${IDADE_PAGANTE} anos)` : "Verificar" });
        }
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{wch: 15}, {wch: 25}, {wch: 20}, {wch: 15}, {wch: 20}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Convidados");
    XLSX.writeFile(wb, `Lista_Lucca_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // --- TELA DE LOGIN ---
  if (!auth) {
    return (
      <div className="admin-page">
        <div className="admin-card-wide" style={{ maxWidth: '400px' }}>
          <div className="admin-header">
            <h2 className="admin-title">Área Restrita</h2>
            <p className="admin-sub">Controle de Comando</p>
          </div>
          {erroAuth && <div style={{ background: '#FDEDED', color: '#D9534F', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{erroAuth}</div>}
          <form onSubmit={login}>
            <input type="password" placeholder="Digite a senha..." value={senhaInput} onChange={e => setSenhaInput(e.target.value)} autoFocus className="admin-input" />
            <button type="submit" disabled={loading} className="admin-btn" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #0047A8, #38B6FF)', color: 'white' }}>
              {loading ? "Verificando..." : "Acessar Painel"}
            </button>
          </form>
          <a href="/" style={{ display: 'block', marginTop: '30px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', textAlign: 'center' }}>← Voltar à Página Inicial</a>
        </div>
      </div>
    );
  }

  // --- TELA DO PAINEL ---
  return (
    <div className="admin-page">
      <div className="admin-card-wide">
        <div className="admin-header">
          <h2 className="admin-title">Painel de Convidados</h2>
          <p className="admin-sub">Relatório da Missão Lucca</p>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-box"><span className="admin-stat-num" style={{color: '#fff'}}>{stats.familias}</span><span className="admin-stat-label">Famílias</span></div>
          <div className="admin-stat-box"><span className="admin-stat-num" style={{color: '#38B6FF'}}>{stats.adultos}</span><span className="admin-stat-label">Total de Adultos</span></div>
          <div className="admin-stat-box"><span className="admin-stat-num" style={{color: '#FFD166'}}>{stats.criancas}</span><span className="admin-stat-label">Total de Crianças</span></div>
          <div className="admin-stat-box" style={{borderColor: 'rgba(5, 150, 105, 0.4)'}}><span className="admin-stat-num" style={{color: '#059669'}}>{stats.pagantes}</span><span className="admin-stat-label">Crianças Pagantes ({IDADE_PAGANTE}+)</span></div>
          <div className="admin-stat-box" style={{borderColor: 'rgba(255, 107, 107, 0.4)'}}><span className="admin-stat-num" style={{color: '#FF6B6B'}}>{stats.gratuitas}</span><span className="admin-stat-label">Crianças Gratuitas (&lt;{IDADE_PAGANTE})</span></div>
          <div className="admin-stat-box" style={{background: 'rgba(56, 182, 255, 0.1)', borderColor: '#38B6FF'}}><span className="admin-stat-num" style={{color: '#fff'}}>{stats.totalPessoas}</span><span className="admin-stat-label">Total Geral</span></div>
        </div>

        <div className="admin-actions">
          <button className="admin-btn btn-refresh" onClick={carregarConvidados}>🔄 Atualizar Tabela</button>
          <button className="admin-btn btn-excel" onClick={baixarExcel} disabled={convidados.length === 0}>📊 Baixar Planilha Excel</button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Convidado Principal</th><th>Acompanhantes</th><th style={{textAlign:'center'}}>Qtd Total</th><th style={{textAlign:'center'}}>Ação</th></tr>
            </thead>
            <tbody>
              {convidados.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign:"center", padding:"40px", color:"#94a3b8"}}>Nenhum astronauta confirmado ainda.</td></tr>
              ) : (
                convidados.map((conv) => (
                  <tr key={conv.id}>
                    <td style={{fontWeight: 'bold'}}>{conv.nomePrincipal}</td>
                    <td>
                      {(conv.acompanhantes || []).length > 0 ? conv.acompanhantes.map((a, i) => (
                        <div key={i} className="guest-tag">
                          {a.nome}
                          <span style={{ opacity:0.8, fontSize:'0.7rem' }}>
                            ({a.parentesco} • <span className={a.tipo === 'Criança' ? 'tag-child' : 'tag-adult'}>{a.tipo}</span> {a.tipo === 'Criança' && a.idade ? ` • ${a.idade}` : ''})
                          </span>
                        </div>
                      )) : <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>Sem acompanhantes</span>}
                    </td>
                    <td style={{textAlign:'center'}}><span className="badge">{conv.totalPessoas}</span></td>
                    <td style={{textAlign:'center'}}><button className="btn-remove" onClick={() => excluir(conv.id)}>✕ Remover</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <hr className="admin-divider" />
        <p className="admin-sub" style={{ marginBottom: 15 }}>🔑 Alterar Senha de Acesso</p>
        <form onSubmit={trocarSenha} style={{ display:'flex', gap:10, flexWrap: 'wrap' }}>
          <input className="admin-input" style={{ marginBottom:0, flex:1, minWidth: '200px' }} type="text" placeholder="Digite a nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required />
          <button className="admin-btn" style={{ background: 'linear-gradient(135deg, #0047A8, #38B6FF)', color: '#fff' }} type="submit">Salvar Senha</button>
        </form>

        <hr className="admin-divider" />
        <div style={{ display:'flex', justifyContent:'center' }}>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.2s' }}>Desconectar do Painel</button>
        </div>
      </div>
    </div>
  );
}