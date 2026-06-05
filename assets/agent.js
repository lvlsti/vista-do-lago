/* ============================================================
   Vista do Lago — Chat Agent Widget v3
   Mobile-first, Boto SVG icon, Toast hint
   ============================================================ */
(function () {
  const N8N_WEBHOOK = "https://n8n.lvl-solucoesti.com/webhook/agente-vista";
  const WA_URL = "https://api.whatsapp.com/send?phone=5592984545630&text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20a%20Vista%20do%20Lago%20Jungle%20Lodge!";
  const LANG = localStorage.getItem("vdl_lang") || navigator.language.slice(0, 2) || "en";

  const LABELS = {
    pt: { title: "Assistente Vista do Lago", placeholder: "Como posso ajudar?", send: "Enviar", whatsapp: "Falar no WhatsApp", close: "Fechar", typing: "Digitando...", welcome: "Olá! Sou o assistente da Vista do Lago Jungle Lodge. Posso ajudar com disponibilidade, bangalôs, preços, atividades e tudo sobre a pousada. Como posso ajudar?", toast: "Fale com nosso assistente 🌿" },
    en: { title: "Vista do Lago Assistant", placeholder: "How can I help?", send: "Send", whatsapp: "Chat on WhatsApp", close: "Close", typing: "Typing...", welcome: "Hello! I'm the Vista do Lago Jungle Lodge assistant. I can help with availability, bungalows, prices, activities and everything about the lodge. How can I help?", toast: "Chat with our assistant 🌿" },
    es: { title: "Asistente Vista do Lago", placeholder: "¿En qué puedo ayudar?", send: "Enviar", whatsapp: "Hablar por WhatsApp", close: "Cerrar", typing: "Escribiendo...", welcome: "¡Hola! Soy el asistente de Vista do Lago Jungle Lodge. Puedo ayudarte con disponibilidad, bungalows, precios, actividades y todo sobre el lodge. ¿En qué puedo ayudarte?", toast: "Habla con nuestro asistente 🌿" }
  };
  const L = LABELS[LANG] || LABELS.en;

  let sessionId = sessionStorage.getItem("vdl_session");
  if (!sessionId) { sessionId = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8); sessionStorage.setItem("vdl_session", sessionId); }

  let history = [];
  let isOpen = false;
  let isTyping = false;
  let toastShown = false;

  const BOTO_IMG = '<img src="https://raw.githubusercontent.com/lvlsti/vista-do-lago/main/assets/boto-icon.png" width="58" height="58" id="vdl-fab-img" style="object-fit:cover;border-radius:50%;" alt="Boto">';

  // --- CSS ---
  const style = document.createElement("style");
  style.textContent = `
    #vdl-fab {
      position:fixed;bottom:28px;right:28px;z-index:9999;
      width:58px;height:58px;border-radius:50%;
      background:#1a1218;
      border:2px solid #c9a96e;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 20px rgba(0,0,0,.4);
      transition:transform .3s ease,opacity .4s ease;
      opacity:0;pointer-events:none;
    }
    #vdl-fab:hover{transform:scale(1.08);}
    #vdl-fab.visible{opacity:1;pointer-events:auto;}
    #vdl-fab.open { background:linear-gradient(135deg,#8b1a2a 0%,#c0392b 100%); border-color:#e8849a; }
    #vdl-fab.open svg { display:none; }
    #vdl-fab.open #vdl-fab-img { display:none !important; }
    #vdl-fab-close-icon { display:none; font-size:22px; color:#fff; line-height:1; }
    #vdl-fab.open #vdl-fab-close-icon { display:block; }

    /* Toast */
    #vdl-toast {
      position:fixed;bottom:34px;right:96px;z-index:9998;
      background:#1a1218;color:#fff;
      padding:10px 16px;border-radius:24px;
      font-family:'Montserrat',sans-serif;font-size:12px;font-weight:600;
      border:1px solid #c9a96e;
      box-shadow:0 4px 16px rgba(0,0,0,.35);
      white-space:nowrap;
      opacity:0;transform:translateX(12px);
      transition:opacity .35s ease,transform .35s ease;
      pointer-events:none;
    }
    #vdl-toast.show{opacity:1;transform:translateX(0);pointer-events:auto;cursor:pointer;}

    /* Chat container */
    #vdl-chat {
      position:fixed;z-index:9998;
      background:#fff;border-radius:16px;
      box-shadow:0 8px 40px rgba(0,0,0,.22);
      display:flex;flex-direction:column;
      transform:scale(.85) translateY(20px);opacity:0;pointer-events:none;
      transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .25s ease;
      overflow:hidden;font-family:'Montserrat',sans-serif;
      /* Desktop */
      bottom:94px;right:28px;width:380px;max-height:600px;
    }
    #vdl-chat.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto;}

    /* Mobile: ocupa tela toda */
    @media(max-width:520px){
      #vdl-chat{
        bottom:0;right:0;left:0;top:0;
        width:100%;max-height:100%;
        border-radius:0;
      }
      #vdl-fab{bottom:20px;right:20px;}
      #vdl-toast{bottom:26px;right:88px;font-size:11px;padding:8px 12px;}
    }

    #vdl-chat-header{
      background:linear-gradient(135deg,#1a1218 0%,#2d1f26 100%);
      padding:14px 16px;display:flex;align-items:center;gap:12px;
      flex-shrink:0;
    }
    #vdl-chat-header-boto { width:38px;height:38px;border-radius:50%;background:rgba(201,169,110,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    #vdl-chat-header-info{flex:1;}
    #vdl-chat-header-title{color:#fff;font-size:13px;font-weight:700;letter-spacing:.5px;}
    #vdl-chat-header-sub{color:rgba(255,255,255,.55);font-size:11px;margin-top:2px;}
    #vdl-chat-close{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.6);font-size:20px;padding:4px 6px;line-height:1;}
    #vdl-chat-close:hover{color:#fff;}

    #vdl-messages{
      flex:1;overflow-y:auto;overflow-x:hidden;padding:16px;
      display:flex;flex-direction:column;gap:10px;
      background:#f8f6f4;
    }
    .vdl-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.55;word-break:break-word;}
    .vdl-msg.bot{background:#fff;color:#1a1218;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 4px rgba(0,0,0,.08);}
    .vdl-msg.user{background:#1a1218;color:#fff;border-bottom-right-radius:4px;align-self:flex-end;}
    .vdl-msg a{color:#c9a96e;text-decoration:underline;}
    .vdl-msg strong{font-weight:700;}

    /* Cards */
    .vdl-card{
      background:#fff;border-radius:12px;overflow:hidden;
      box-shadow:0 2px 8px rgba(0,0,0,.1);align-self:flex-start;
      max-width:260px;min-width:220px;margin-top:4px;flex-shrink:0;
    }
    .vdl-card img{width:100%;height:150px;object-fit:cover;display:block;}
    .vdl-card-body{padding:10px 12px;}
    .vdl-card-title{font-size:13px;font-weight:700;color:#1a1218;margin-bottom:4px;}
    .vdl-card-desc{font-size:11px;color:#666;line-height:1.45;margin-bottom:8px;}
    .vdl-card-price{font-size:13px;font-weight:700;color:#c9a96e;}
    .vdl-card-btn{
      display:block;text-align:center;margin-top:8px;padding:8px;
      background:#1a1218;color:#fff;border-radius:6px;font-size:11px;
      font-weight:700;text-decoration:none;letter-spacing:.5px;
    }
    .vdl-card-btn:hover{background:#2d1f26;color:#fff;}

    /* Carrossel */
    .vdl-carousel{
      display:flex;gap:10px;overflow-x:auto;overflow-y:hidden;
      padding:4px 0 8px;align-self:flex-start;max-width:100%;
      scrollbar-width:none;-webkit-overflow-scrolling:touch;
    }
    .vdl-carousel::-webkit-scrollbar{display:none;}

    .vdl-typing{display:flex;gap:4px;align-items:center;padding:10px 14px;}
    .vdl-typing span{width:7px;height:7px;border-radius:50%;background:#bbb;animation:vdlBounce 1.2s infinite;}
    .vdl-typing span:nth-child(2){animation-delay:.2s;}
    .vdl-typing span:nth-child(3){animation-delay:.4s;}
    @keyframes vdlBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

    #vdl-chat-footer{padding:12px;background:#fff;border-top:1px solid #f0ece8;flex-shrink:0;}
    #vdl-input-row{display:flex;gap:8px;align-items:center;}
    #vdl-input{
      flex:1;padding:10px 14px;border:1px solid #e8e0d8;border-radius:24px;
      font-size:14px;font-family:inherit;outline:none;color:#1a1218;
      background:#faf8f6;transition:border-color .2s;min-width:0;
    }
    #vdl-input:focus{border-color:#c9a96e;}
    #vdl-send{
      width:40px;height:40px;border-radius:50%;border:none;
      background:#c9a96e;color:#fff;cursor:pointer;font-size:16px;
      display:flex;align-items:center;justify-content:center;
      transition:background .2s;flex-shrink:0;
    }
    #vdl-send:hover{background:#b8924a;}
    #vdl-wa-btn{
      display:flex;align-items:center;justify-content:center;gap:6px;
      width:100%;padding:9px;margin-top:8px;
      background:none;border:1px solid #e8e0d8;border-radius:8px;
      color:#25d366;font-size:12px;font-weight:600;cursor:pointer;
      font-family:inherit;transition:background .2s;
    }
    #vdl-wa-btn:hover{background:#f0faf4;}
  `;
  document.head.appendChild(style);

  // FAB
  const fab = document.createElement("button");
  fab.id = "vdl-fab";
  fab.setAttribute("aria-label", "Chat com assistente");
  fab.innerHTML = BOTO_IMG + '<span id="vdl-fab-close-icon">✕</span>';

  // Toast
  const toast = document.createElement("div");
  toast.id = "vdl-toast";
  toast.textContent = L.toast;
  toast.addEventListener("click", function() {
    openChat();
    hideToast();
  });

  // Chat
  const chat = document.createElement("div");
  chat.id = "vdl-chat";
  chat.innerHTML = `
    <div id="vdl-chat-header">
      <div id="vdl-chat-header-boto">${BOTO_IMG}</div>
      <div id="vdl-chat-header-info">
        <div id="vdl-chat-header-title">${L.title}</div>
        <div id="vdl-chat-header-sub">● Online</div>
      </div>
      <button id="vdl-chat-close" aria-label="${L.close}">✕</button>
    </div>
    <div id="vdl-messages"></div>
    <div id="vdl-chat-footer">
      <div id="vdl-input-row">
        <input id="vdl-input" type="text" placeholder="${L.placeholder}" autocomplete="off">
        <button id="vdl-send" aria-label="${L.send}"><i class="fa-solid fa-paper-plane"></i></button>
      </div>
      <button id="vdl-wa-btn" onclick="window.open('${WA_URL}','_blank')">
        <i class="fa-brands fa-whatsapp"></i> ${L.whatsapp}
      </button>
    </div>`;

  document.body.appendChild(fab);
  document.body.appendChild(toast);
  document.body.appendChild(chat);

  const msgContainer = chat.querySelector("#vdl-messages");

  function renderText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
  }

  function addMsg(text, role) {
    const div = document.createElement("div");
    div.className = "vdl-msg " + role;
    div.innerHTML = renderText(text);
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return div;
  }

  function addCards(cards) {
    if (!cards || !cards.length) return;
    const carousel = document.createElement("div");
    carousel.className = "vdl-carousel";
    cards.forEach(function(c) {
      const card = document.createElement("div");
      card.className = "vdl-card";
      card.innerHTML = `
        ${c.image ? '<img src="'+c.image+'" alt="'+c.name+'" loading="lazy">' : ''}
        <div class="vdl-card-body">
          <div class="vdl-card-title">${c.name}</div>
          <div class="vdl-card-desc">${c.desc || ''}</div>
          <div class="vdl-card-price">${c.price || ''}</div>
          ${c.link ? '<a class="vdl-card-btn" href="'+c.link+'" target="_blank" rel="noopener">Reservar</a>' : ''}
        </div>`;
      carousel.appendChild(card);
    });
    msgContainer.appendChild(carousel);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "vdl-msg bot vdl-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    div.id = "vdl-typing-indicator";
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById("vdl-typing-indicator");
    if (t) t.remove();
  }

  function showToast() {
    if (toastShown) return;
    toastShown = true;
    setTimeout(function() {
      toast.classList.add("show");
      setTimeout(function() { hideToast(); }, 5000);
    }, 800);
  }

  function hideToast() {
    toast.classList.remove("show");
  }

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    chat.classList.add("open");
    fab.classList.add("open");
    // Mobile: evitar scroll do body
    if (window.innerWidth <= 520) document.body.style.overflow = "hidden";
    if (history.length === 0) {
      setTimeout(function() { addMsg(L.welcome, "bot"); }, 300);
    }
  }

  function closeChat() {
    isOpen = false;
    chat.classList.remove("open");
    fab.classList.remove("open");
    document.body.style.overflow = "";
  }

  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;
    addMsg(text, "user");
    history.push({ role: "user", content: text });
    document.getElementById("vdl-input").value = "";
    isTyping = true;
    showTyping();
    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          history,
          lang: LANG,
          cachedRoomsData: JSON.parse(sessionStorage.getItem("vdl_rooms_" + sessionId) || "[]")
        })
      });
      const raw = await res.json();
      let data;
      if (Array.isArray(raw) && raw[0] && raw[0].json) { data = raw[0].json; }
      else if (raw && raw.json) { data = raw.json; }
      else { data = raw; }
      if (data.roomsData && data.roomsData.length) {
        sessionStorage.setItem("vdl_rooms_" + sessionId, JSON.stringify(data.roomsData));
      }
      hideTyping();
      const reply = data.reply || data.message || "...";
      addMsg(reply, "bot");
      console.log('[VDL] single_image:', JSON.stringify(data.single_image), '| keys:', Object.keys(data).join(','));
      if (data.cards && data.cards.length) { addCards(data.cards); }
      if (data.single_image && data.single_image.url) {
        var imgDiv = document.createElement('div');
        imgDiv.className = 'vdl-msg bot';
        imgDiv.style.cssText = 'padding:0;overflow:hidden;border-radius:14px;max-width:260px;';
        imgDiv.innerHTML = '<img src="' + data.single_image.url.replace(/ /g, '%20') + '" alt="' + (data.single_image.name||'Bangalô') + '" style="width:100%;display:block;border-radius:14px;" loading="lazy">';
        msgContainer.appendChild(imgDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
      history.push({ role: "assistant", content: reply });
    } catch (e) {
      hideTyping();
      addMsg("Ocorreu um erro. Tente pelo WhatsApp.", "bot");
    }
    isTyping = false;
  }

  fab.addEventListener("click", function() {
    if (isOpen) closeChat(); else openChat();
  });

  document.getElementById("vdl-chat-close").addEventListener("click", closeChat);

  document.getElementById("vdl-send").addEventListener("click", function() {
    sendMessage(document.getElementById("vdl-input").value);
  });

  document.getElementById("vdl-input").addEventListener("keydown", function(e) {
    if (e.key === "Enter") sendMessage(e.target.value);
  });

  // Fechar ao clicar fora (desktop)
  document.addEventListener("click", function(e) {
    if (!isOpen || window.innerWidth <= 520) return;
    if (!chat.contains(e.target) && !fab.contains(e.target)) closeChat();
  });

  let threshold = 0;
  function calcThreshold() {
    const hero = document.querySelector(".about-hero,.blog-hero,.m-hero,.e-hero,.post-hero,.g-hero,.hero");
    threshold = hero ? (hero.offsetTop + hero.offsetHeight) : window.innerHeight;
  }
  function checkFab() {
    if (window.scrollY >= threshold) {
      if (!fab.classList.contains("visible")) {
        fab.classList.add("visible");
        showToast();
      }
    } else {
      fab.classList.remove("visible");
      if (isOpen) closeChat();
    }
  }
  window.addEventListener("load", function() { calcThreshold(); checkFab(); });
  window.addEventListener("scroll", checkFab, { passive: true });
  window.addEventListener("resize", function() { calcThreshold(); checkFab(); });
  if (document.readyState === "complete") { calcThreshold(); checkFab(); }
})();
