# 🚀 Convite Digital Interativo - Tema Espaço

Um template de convite digital premium, moderno e responsivo, desenvolvido para festas infantis. Este projeto inclui uma experiência interativa para o convidado e um painel administrativo completo para o organizador.

Desenvolvido por [**ASP Code**](https://www.instagram.com/asp_code/).

## ✨ Funcionalidades Principais

* **🌌 Design Premium (Glassmorphism):** Interface moderna com efeito de vidro fosco, partículas flutuantes e fumaça realista na decolagem.
* **📜 Scroll Tracker Dinâmico:** Um foguete acompanha a rolagem da página do usuário.
* **⏳ Contagem Regressiva:** Timer exato para o início da festa.
* **📅 Integração com Google Agenda:** Botão que converte automaticamente o fuso horário e salva o evento no calendário do convidado.
* **🎉 RSVP Mágico com Confetes:** Formulário de confirmação de presença integrado ao Firebase com animação de fogos de artifício ao confirmar.
* **⚙️ Painel Admin Oculto (`/admin`):** Área restrita com senha para visualizar confirmados, com contagem automática de pagantes/gratuitos (baseado na idade) e exportação da lista para **Excel (.xlsx)**.

## 🛠️ Tecnologias Utilizadas

* [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* [Firebase (Firestore)](https://firebase.google.com/) para Banco de Dados
* [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
* [SheetJS (xlsx)](https://sheetjs.com/) para exportação de planilhas
* CSS puro com animações complexas (`@keyframes`)

## 🚀 Como rodar o projeto localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   *Certifique-se de instalar o confete caso não venha no pacote:* `npm install canvas-confetti`

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
   ```env
   VITE_FIREBASE_API_KEY="sua_chave_do_firebase"
   VITE_FREE_AGE_LIMIT="5"
   VITE_NOME_CRIANCA="Nome do Aniversariante"
   VITE_DATA_FESTA="YYYY-MM-DD"
   VITE_HORA_FESTA="HH:MM"
   VITE_LOCAL_FESTA="Endereço Completo"
   VITE_LINK_MAPA="Link do Google Maps"
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🔒 Painel Administrativo

Para acessar a lista de confirmados, acesse a rota `/admin` no seu navegador (ex: `http://localhost:5173/admin`).
* **Senha Padrão Inicial:** `Lucca01` (pode ser alterada dentro do próprio painel).

---
*Template base desenvolvido para escalabilidade e fácil customização para futuros clientes da agência ASP Code.*