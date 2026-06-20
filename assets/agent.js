/* ============================================================
   Vista do Lago — Chat Agent Widget v3
   Mobile-first, Boto SVG icon, Toast hint
   ============================================================ */
(function () {
  // --- Google Tag Manager ---
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-T6FWSBNT');
  // GTM noscript (body fallback)
  if (!document.getElementById('gtm-ns-T6FWSBNT')) {
    var _gtmNs = document.createElement('noscript');
    _gtmNs.id = 'gtm-ns-T6FWSBNT';
    _gtmNs.innerHTML = '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T6FWSBNT" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
    document.body ? document.body.insertBefore(_gtmNs, document.body.firstChild) : document.addEventListener('DOMContentLoaded', function(){ document.body.insertBefore(_gtmNs, document.body.firstChild); });
  }
  // --- End Google Tag Manager ---

  const N8N_WEBHOOK = "https://n8n.lvl-solucoesti.com/webhook/agente-vista";
  const N8N_WEBHOOK_FIM = "https://n8n.lvl-solucoesti.com/webhook/agente-vista-fim";
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
  let lastSummaryCount = 0;
  let lastSummaryAt = 0;

  function sendConversationSummary(reason) {
    try {
      if (!history || history.length === 0) return;
      var now = Date.now();
      if (reason === "fechou_chat") {
        // Fechamento explícito: sempre envia (ignora throttle e contagem)
        // Único bloqueio: evita duplo disparo em menos de 3s
        if (now - lastSummaryAt < 3000) return;
      } else {
        // Eventos passivos (pagehide, beforeunload, visibilitychange):
        // só envia se houver mensagens novas E não disparou nos últimos 15s
        if (history.length <= lastSummaryCount) return;
        if (now - lastSummaryAt < 15000) return;
      }
      lastSummaryCount = history.length;
      lastSummaryAt = now;
      lastSummaryCount = history.length;
      lastSummaryAt = now;
      var payload = JSON.stringify({ sessionId: sessionId, lang: LANG, reason: reason, history: history });
      var sent = false;
      if (navigator.sendBeacon) {
        try {
          var blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
          sent = navigator.sendBeacon(N8N_WEBHOOK_FIM, blob);
        } catch (e2) { sent = false; }
      }
      if (!sent) {
        fetch(N8N_WEBHOOK_FIM, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(function(){});
      }
    } catch (e) { /* silencioso — não deve afetar a experiência do usuário */ }
  }
  let isOpen = false;
  let isTyping = false;
  let toastStarted = false;

  const BOTO_IMG = '<img src="https://raw.githubusercontent.com/lvlsti/vista-do-lago/main/assets/boto-icon.png" width="58" height="58" style="object-fit:cover;border-radius:50%;" alt="Boto">';
  const LOGO_IMG = '<img src="https://raw.githubusercontent.com/lvlsti/vista-do-lago/main/assets/logo-vdl.png" style="width:100%;height:100%;object-fit:contain;display:block;" alt="Vista do Lago Jungle Lodge">';
  const FAB_IMG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" style="width:30px;height:30px;display:block;" aria-hidden="true"><path d="M20.5 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.5A8 8 0 1 1 20.5 11.5z"/><circle cx="8.5" cy="11.7" r="1.1" fill="#fff" stroke="none"/><circle cx="12" cy="11.7" r="1.1" fill="#fff" stroke="none"/><circle cx="15.5" cy="11.7" r="1.1" fill="#fff" stroke="none"/></svg>';

  // --- CSS ---
  const style = document.createElement("style");
  style.textContent = `
    @keyframes vdlGlow {
      0%   { box-shadow:0 4px 16px rgba(0,0,0,.35), 0 0 0 0 rgba(37,211,102,.55); }
      70%  { box-shadow:0 4px 16px rgba(0,0,0,.35), 0 0 0 14px rgba(37,211,102,0); }
      100% { box-shadow:0 4px 16px rgba(0,0,0,.35), 0 0 0 0 rgba(37,211,102,0); }
    }
    #vdl-fab {
      position:fixed;bottom:28px;right:28px;z-index:9999;
      width:58px;height:58px;border-radius:50%;
      background:#25D366;
      border:2px solid #1faa54;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 4px 20px rgba(0,0,0,.4);
      transition:transform .3s ease,opacity .4s ease;
      opacity:0;pointer-events:none;
    }
    #vdl-fab:hover{transform:scale(1.08);}
    #vdl-fab.visible{opacity:1;pointer-events:auto;}
    #vdl-fab.visible:not(.open){ animation:vdlGlow 2.2s ease-out infinite; }
    #vdl-fab.open { background:linear-gradient(135deg,#8b1a2a 0%,#c0392b 100%); border-color:#e8849a; animation:none; }
    #vdl-fab.open svg { display:none; }
    #vdl-fab.open #vdl-fab-img { display:none !important; }
    #vdl-fab-close-icon { display:none; font-size:22px; color:#fff; line-height:1; }
    #vdl-fab.open #vdl-fab-close-icon { display:block; }
    #vdl-fab-badge {
      position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;
      padding:0 4px;box-sizing:border-box;border-radius:9px;
      background:#e24b4a;color:#fff;font:700 11px/1 'Montserrat',sans-serif;
      display:flex;align-items:center;justify-content:center;border:2px solid #fff;
    }
    #vdl-fab.open #vdl-fab-badge, #vdl-fab.seen #vdl-fab-badge { display:none; }

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
      #vdl-fab.open{opacity:0 !important;pointer-events:none !important;}
      #vdl-toast{bottom:26px;right:88px;font-size:11px;padding:8px 12px;}
    }

    #vdl-chat-header{
      background:linear-gradient(135deg,#1a1218 0%,#2d1f26 100%);
      padding:14px 16px;display:flex;align-items:center;gap:12px;
      flex-shrink:0;
    }
    #vdl-chat-header-boto { width:44px;height:44px;background:transparent;border:none;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
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

    /* Foto card */
    .vdl-photo-card{
      align-self:flex-start;max-width:220px;border-radius:12px;overflow:hidden;
      box-shadow:0 2px 12px rgba(0,0,0,.15);cursor:pointer;position:relative;
      margin-top:4px;transition:transform .2s ease;
    }
    .vdl-photo-card:hover{transform:scale(1.02);}
    .vdl-photo-card img{width:100%;height:140px;object-fit:cover;display:block;}
    .vdl-photo-card-footer{
      padding:8px 10px;background:#fff;
      display:flex;align-items:center;justify-content:space-between;
    }
    .vdl-photo-card-name{font-size:11px;font-weight:700;color:#1a1218;letter-spacing:.5px;}
    .vdl-photo-card-expand{font-size:10px;color:#c9a96e;font-weight:600;letter-spacing:.5px;}

    /* Lightbox */
    #vdl-lightbox{
      position:fixed;inset:0;z-index:99999;
      background:rgba(0,0,0,.88);
      display:flex;align-items:center;justify-content:center;
      opacity:0;pointer-events:none;transition:opacity .25s ease;
    }
    #vdl-lightbox.show{opacity:1;pointer-events:auto;}
    #vdl-lightbox img{
      max-width:92vw;max-height:85vh;border-radius:10px;
      box-shadow:0 8px 40px rgba(0,0,0,.5);
      transform:scale(.92);transition:transform .25s ease;
    }
    #vdl-lightbox.show img{transform:scale(1);}
    #vdl-lightbox-close{
      position:absolute;top:20px;right:24px;
      color:#fff;font-size:28px;cursor:pointer;
      background:none;border:none;line-height:1;opacity:.8;
    }
    #vdl-lightbox-close:hover{opacity:1;}
    #vdl-lightbox-name{
      position:absolute;bottom:24px;left:50%;transform:translateX(-50%);
      color:#fff;font-size:13px;font-weight:600;letter-spacing:1px;
      background:rgba(0,0,0,.45);padding:6px 16px;border-radius:20px;
      white-space:nowrap;
    }
    .vdl-lb-nav{
      position:absolute;top:50%;transform:translateY(-50%);
      background:rgba(0,0,0,.45);border:none;color:#fff;
      font-size:36px;line-height:1;cursor:pointer;
      padding:10px 16px;border-radius:8px;
      opacity:.8;transition:opacity .15s,background .15s;
      user-select:none;-webkit-user-select:none;
    }
    .vdl-lb-nav:hover{opacity:1;background:rgba(0,0,0,.72);}
    #vdl-lb-prev{left:16px;}
    #vdl-lb-next{right:16px;}
    .vdl-lb-nav.hidden{display:none;}
  `;
  document.head.appendChild(style);

  // FAB
  const fab = document.createElement("button");
  fab.id = "vdl-fab";
  fab.setAttribute("aria-label", "Chat com assistente");
  fab.innerHTML = FAB_IMG + '<span id="vdl-fab-close-icon">✕</span><span id="vdl-fab-badge">1</span>';
  if (localStorage.getItem("vdl_chat_seen")) fab.classList.add("seen");

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
      <div id="vdl-chat-header-boto">${LOGO_IMG}</div>
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

  // Lightbox
  var lightbox = document.createElement('div');
  lightbox.id = 'vdl-lightbox';
  lightbox.innerHTML = '<button id="vdl-lightbox-close">✕</button><button class="vdl-lb-nav hidden" id="vdl-lb-prev">&#8249;</button><img id="vdl-lightbox-img" src="" alt=""><button class="vdl-lb-nav hidden" id="vdl-lb-next">&#8250;</button><div id="vdl-lightbox-name"></div>';
  document.body.appendChild(lightbox);
  document.getElementById('vdl-lightbox-close').addEventListener('click', function(e){ e.stopPropagation(); lightbox.classList.remove('show'); });
  lightbox.addEventListener('click', function(e){ if(e.target === lightbox) lightbox.classList.remove('show'); e.stopPropagation(); });

  var lbUrls = [], lbIdx = 0, lbName = '';
  function openLightbox(url, name, urls, idx) {
    lbUrls = urls || [url]; lbIdx = idx || 0;
    if (name) lbName = name; // preserva o nome durante navegação
    document.getElementById('vdl-lightbox-img').src = lbUrls[lbIdx].replace(/ /g,'%20');
    document.getElementById('vdl-lightbox-name').textContent = lbName + (lbUrls.length > 1 ? ' (' + (lbIdx+1) + '/' + lbUrls.length + ')' : '');
    var hasMany = lbUrls.length > 1;
    document.getElementById('vdl-lb-prev')[hasMany ? 'classList' : 'classList'].toggle('hidden', !hasMany);
    document.getElementById('vdl-lb-next').classList.toggle('hidden', !hasMany);
    lightbox.classList.add('show');
  }
  document.addEventListener('keydown', function(e){
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'ArrowRight' && lbUrls.length > 1){ lbIdx=(lbIdx+1)%lbUrls.length; openLightbox(lbUrls[lbIdx],'',lbUrls,lbIdx); }
    if (e.key === 'ArrowLeft' && lbUrls.length > 1){ lbIdx=(lbIdx-1+lbUrls.length)%lbUrls.length; openLightbox(lbUrls[lbIdx],'',lbUrls,lbIdx); }
    if (e.key === 'Escape') lightbox.classList.remove('show');
  });
  // Setas clicáveis no lightbox
  document.getElementById('vdl-lb-prev').addEventListener('click', function(e){
    e.stopPropagation();
    if (lbUrls.length < 2) return;
    lbIdx = (lbIdx - 1 + lbUrls.length) % lbUrls.length;
    openLightbox(lbUrls[lbIdx], '', lbUrls, lbIdx);
  });
  document.getElementById('vdl-lb-next').addEventListener('click', function(e){
    e.stopPropagation();
    if (lbUrls.length < 2) return;
    lbIdx = (lbIdx + 1) % lbUrls.length;
    openLightbox(lbUrls[lbIdx], '', lbUrls, lbIdx);
  });
  // Swipe touch (mobile)
  var lbTouchX = null;
  lightbox.addEventListener('touchstart', function(e){ lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function(e){
    if (lbTouchX === null || lbUrls.length < 2) return;
    var dx = e.changedTouches[0].clientX - lbTouchX;
    lbTouchX = null;
    if (Math.abs(dx) < 40) return; // ignora toques muito curtos
    if (dx < 0) { lbIdx = (lbIdx + 1) % lbUrls.length; }       // swipe esquerda → próxima
    else        { lbIdx = (lbIdx - 1 + lbUrls.length) % lbUrls.length; } // swipe direita → anterior
    openLightbox(lbUrls[lbIdx], '', lbUrls, lbIdx);
  }, { passive: true });

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
        ${c.image ? '<img src="'+c.image+'" alt="'+c.name+'" loading="lazy" referrerpolicy="no-referrer">' : ''}
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

  function startToastCycle() {
    if (toastStarted) return;
    toastStarted = true;
    setTimeout(showToast, 800);
    setInterval(function() {
      if (!isOpen && fab.classList.contains("visible")) showToast();
    }, 30000);
  }

  function showToast() {
    if (isOpen) return;
    toast.classList.add("show");
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    toast.classList.remove("show");
  }

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    chat.classList.add("open");
    fab.classList.add("open");
    fab.classList.add("seen");
    try { localStorage.setItem("vdl_chat_seen", "1"); } catch (e) {}
    hideToast();
    // Mobile: esconder FAB para não sobrepor o input
    if (window.innerWidth <= 520) {
      document.body.style.overflow = "hidden";
      fab.style.display = "none";
    }
    if (history.length === 0) {
      setTimeout(function() { addMsg(L.welcome, "bot"); }, 300);
    }
  }

  function closeChat() {
    if (history.length > 0) sendConversationSummary("fechou_chat");
    isOpen = false;
    chat.classList.remove("open");
    fab.classList.remove("open");
    document.body.style.overflow = "";
    // Restaurar FAB no mobile
    fab.style.display = "";
  }

  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;
    addMsg(text, "user");
    history.push({ role: "user", content: text });
    document.getElementById("vdl-input").value = "";
    isTyping = true;
    showTyping();
    var typingStart = Date.now();
    // Timeout de 42s — evita travar infinitamente em celular com sinal fraco
    var abortCtrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var abortTimer = abortCtrl ? setTimeout(function() { abortCtrl.abort(); }, 42000) : null;
    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortCtrl ? abortCtrl.signal : undefined,
        body: JSON.stringify({
          sessionId,
          message: text,
          history,
          lang: LANG,
          cachedRoomsData: JSON.parse(sessionStorage.getItem("vdl_rooms_" + sessionId) || "[]"),
          startDate: sessionStorage.getItem("vdl_sd_" + sessionId) || "",
          endDate: sessionStorage.getItem("vdl_ed_" + sessionId) || "",
          adults: sessionStorage.getItem("vdl_adults_" + sessionId) || "2",
          guestEmail: sessionStorage.getItem("vdl_email_" + sessionId) || ""
        })
      });
      if (abortTimer) clearTimeout(abortTimer);
      const raw = await res.json();
      var prev_lang = LANG;
      let data;
      if (Array.isArray(raw) && raw[0] && raw[0].json) { data = raw[0].json; }
      else if (raw && raw.json) { data = raw.json; }
      else { data = raw; }
      if (data.roomsData && data.roomsData.length) {
        sessionStorage.setItem("vdl_rooms_" + sessionId, JSON.stringify(data.roomsData));
      }
      if (data.startDate) sessionStorage.setItem("vdl_sd_" + sessionId, data.startDate);
      if (data.endDate)   sessionStorage.setItem("vdl_ed_" + sessionId, data.endDate);
      if (data.adults && data.adults !== '2') sessionStorage.setItem("vdl_adults_" + sessionId, data.adults);
      if (data.guestEmail) sessionStorage.setItem("vdl_email_" + sessionId, data.guestEmail);
      // Espera mínima de 1.4s para o indicador de digitação — sensação mais humana
      var minTyping = 1400;
      var elapsed = Date.now() - typingStart;
      if (elapsed < minTyping) await new Promise(function(r){ setTimeout(r, minTyping - elapsed); });
      hideTyping();
      const reply = data.reply || data.message || "...";
      addMsg(reply, "bot");
      console.log('[VDL] single_image:', JSON.stringify(data.single_image), '| keys:', Object.keys(data).join(','));
      if (data.cards && data.cards.length) { addCards(data.cards); }
      if (data.single_image && data.single_image.noPhoto) {
        var noPhotoMsgs = {
          pt: '📸 Ainda não temos fotos do ' + data.single_image.name + ' cadastradas, mas posso te contar tudo sobre ele! Quer saber mais detalhes?',
          en: 'We don\'t have photos of ' + data.single_image.name + ' yet, but I can tell you all about it! Want to know more?',
          es: 'Aún no tenemos fotos del ' + data.single_image.name + ', pero puedo contarte todo sobre él. ¿Quieres saber más?'
        };
        addMsg(noPhotoMsgs[prev_lang] || noPhotoMsgs['pt'], 'bot');
      } else if (data.single_image && (data.single_image.url || (data.single_image.urls && data.single_image.urls.length))) {
        var imgName = data.single_image.name || 'Bangalô';
        // Suporte a array de URLs (carrossel) ou URL única
        var imgUrls = data.single_image.urls || (data.single_image.url ? [data.single_image.url] : []);
        imgUrls = imgUrls.map(function(u){ var s = (typeof u === 'string') ? u : (u && u.image ? u.image : (u && u.url ? u.url : '')); return s.replace(/ /g, '%20'); }).filter(Boolean);
        if (imgUrls.length === 0) return;

        if (imgUrls.length === 1) {
          // Foto única — card simples
          var photoCard = document.createElement('div');
          photoCard.style.cssText = 'flex-shrink:0;align-self:flex-start;max-width:220px;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.15);cursor:pointer;margin-top:4px;';
          var imgEl = document.createElement('img');
          imgEl.alt = imgName; imgEl.loading = 'lazy'; imgEl.referrerPolicy = 'no-referrer';
          imgEl.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;background:#ece6df;';
          imgEl.onload = function(){ msgContainer.scrollTop = msgContainer.scrollHeight; };
          imgEl.onerror = function(){
            var fb = document.createElement('a');
            fb.href = imgUrls[0]; fb.target = '_blank'; fb.rel = 'noopener';
            fb.textContent = '🖼️ ' + imgName + ' — ver foto ↗';
            fb.style.cssText = 'display:block;padding:14px;font:600 12px Montserrat,sans-serif;color:#1a1218;background:#fff;text-decoration:none;';
            photoCard.replaceChildren(fb);
          };
          imgEl.src = imgUrls[0];
          var footer = document.createElement('div');
          footer.style.cssText = 'padding:8px 10px;background:#fff;display:flex;align-items:center;justify-content:space-between;';
          var nameSpan = document.createElement('span');
          nameSpan.style.cssText = 'font-size:11px;font-weight:700;color:#1a1218;font-family:Montserrat,sans-serif;';
          nameSpan.textContent = imgName;
          var expandSpan = document.createElement('span');
          expandSpan.style.cssText = 'font-size:10px;color:#c9a96e;font-weight:600;font-family:Montserrat,sans-serif;';
          expandSpan.textContent = '🔍 Ampliar';
          footer.appendChild(nameSpan); footer.appendChild(expandSpan);
          photoCard.appendChild(imgEl); photoCard.appendChild(footer);
          photoCard.addEventListener('click', function(e){ e.stopPropagation(); openLightbox(imgUrls[0], imgName, imgUrls, 0); });
          msgContainer.appendChild(photoCard);
        } else {
          // Carrossel
          var carousel = document.createElement('div');
          carousel.style.cssText = 'flex-shrink:0;align-self:flex-start;max-width:220px;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.15);margin-top:4px;background:#1a1218;';
          var carIdx = 0;
          var carImg = document.createElement('img');
          carImg.referrerPolicy = 'no-referrer'; carImg.loading = 'lazy';
          carImg.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;background:#ece6df;';
          carImg.src = imgUrls[0];
          // Setas
          var carNav = document.createElement('div');
          carNav.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#fff;';
          var btnPrev = document.createElement('button');
          btnPrev.style.cssText = 'background:none;border:none;cursor:pointer;font-size:16px;color:#1a1218;padding:0 4px;';
          btnPrev.textContent = '‹';
          var carCounter = document.createElement('span');
          carCounter.style.cssText = 'font-size:11px;font-weight:700;color:#1a1218;font-family:Montserrat,sans-serif;';
          carCounter.textContent = imgName + ' (1/' + imgUrls.length + ')';
          var btnNext = document.createElement('button');
          btnNext.style.cssText = 'background:none;border:none;cursor:pointer;font-size:16px;color:#1a1218;padding:0 4px;';
          btnNext.textContent = '›';
          var expandBtn = document.createElement('span');
          expandBtn.style.cssText = 'font-size:10px;color:#c9a96e;font-weight:600;font-family:Montserrat,sans-serif;cursor:pointer;';
          expandBtn.textContent = '🔍';
          function updateCar(){ carImg.src = imgUrls[carIdx]; carCounter.textContent = imgName + ' (' + (carIdx+1) + '/' + imgUrls.length + ')'; }
          btnPrev.addEventListener('click', function(e){ e.stopPropagation(); carIdx = (carIdx - 1 + imgUrls.length) % imgUrls.length; updateCar(); });
          btnNext.addEventListener('click', function(e){ e.stopPropagation(); carIdx = (carIdx + 1) % imgUrls.length; updateCar(); });
          expandBtn.addEventListener('click', function(e){ e.stopPropagation(); openLightbox(imgUrls[carIdx], imgName, imgUrls, carIdx); });
          carNav.appendChild(btnPrev); carNav.appendChild(carCounter); carNav.appendChild(expandBtn); carNav.appendChild(btnNext);
          carousel.appendChild(carImg); carousel.appendChild(carNav);
          carousel.addEventListener('click', function(e){ e.stopPropagation(); openLightbox(imgUrls[carIdx], imgName, imgUrls, carIdx); });
          msgContainer.appendChild(carousel);
        }
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }

      // ── Múltiplos bangalôs: comparação lado a lado ─────────────────────
      if (data.multi_images && data.multi_images.length >= 2) {
        var strip = document.createElement('div');
        strip.style.cssText = 'align-self:stretch;display:flex;gap:8px;padding:4px 0 8px 0;width:100%;';
        data.multi_images.forEach(function(mi) {
          var card = document.createElement('div');
          card.style.cssText = 'flex:1 1 0;min-width:0;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.15);background:#fff;cursor:pointer;';
          var imgEl2 = document.createElement('img');
          imgEl2.loading = 'lazy'; imgEl2.referrerPolicy = 'no-referrer';
          imgEl2.style.cssText = 'width:100%;height:110px;object-fit:cover;display:block;background:#ece6df;';
          var urls2 = (mi.urls || []).map(function(u){ var s = (typeof u === 'string') ? u : (u && u.image ? u.image : (u && u.url ? u.url : '')); return s.replace(/ /g,'%20'); }).filter(Boolean);
          if (mi.noPhoto || urls2.length === 0) {
            imgEl2.style.cssText += 'display:none;';
            var noImg = document.createElement('div');
            noImg.style.cssText = 'width:100%;height:110px;display:flex;align-items:center;justify-content:center;background:#f0ebe4;font-size:28px;';
            noImg.textContent = '🌿';
            card.appendChild(noImg);
          } else {
            imgEl2.src = urls2[0];
            imgEl2.onload = function(){ msgContainer.scrollTop = msgContainer.scrollHeight; };
            card.appendChild(imgEl2);
          }
          var footer2 = document.createElement('div');
          footer2.style.cssText = 'padding:6px 8px;';
          var nameEl = document.createElement('div');
          nameEl.style.cssText = 'font-size:11px;font-weight:700;color:#1a1218;font-family:Montserrat,sans-serif;margin-bottom:4px;';
          nameEl.textContent = mi.name;
          var verBtn = document.createElement('div');
          verBtn.style.cssText = 'font-size:10px;color:#c9a96e;font-weight:600;font-family:Montserrat,sans-serif;';
          verBtn.textContent = urls2.length > 1 ? '🔍 ' + urls2.length + ' fotos' : (urls2.length === 1 ? '🔍 Ver foto' : '📸 Sem foto');
          footer2.appendChild(nameEl); footer2.appendChild(verBtn);
          card.appendChild(footer2);
          if (urls2.length > 0) {
            (function(u, n){ card.addEventListener('click', function(e){ e.stopPropagation(); openLightbox(u[0], n, u, 0); }); })(urls2, mi.name);
          }
          strip.appendChild(card);
        });
        msgContainer.appendChild(strip);
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }

      history.push({ role: "assistant", content: reply });
    } catch (e) {
      if (abortTimer) clearTimeout(abortTimer);
      hideTyping();
      var isTimeout = (e && e.name === "AbortError") || (e && e.name === "TimeoutError");
      var errMsgs = {
        pt: isTimeout
          ? "⏱ A resposta demorou mais que o esperado. Por favor, tente novamente ou fale pelo WhatsApp: +55 92 98454-5630"
          : "Ocorreu um erro de conexão. Tente novamente ou use o WhatsApp: +55 92 98454-5630",
        en: isTimeout
          ? "⏱ The response took too long. Please try again or contact us on WhatsApp: +55 92 98454-5630"
          : "A connection error occurred. Try again or reach us on WhatsApp.",
        es: isTimeout
          ? "⏱ La respuesta tardó demasiado. Inténtalo de nuevo o escríbenos por WhatsApp: +55 92 98454-5630"
          : "Error de conexión. Inténtalo de nuevo o usa WhatsApp."
      };
      addMsg(errMsgs[LANG] || errMsgs.pt, "bot");
      // Remove a última mensagem do histórico se não recebemos resposta
      if (history.length > 0 && history[history.length - 1].role === "user") {
        history.pop();
      }
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
        startToastCycle();
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

  // Envia o resumo da conversa quando o visitante sai do site (fecha aba, navega para fora, etc.)
  window.addEventListener("pagehide", function() { sendConversationSummary("saiu_do_site"); });
  window.addEventListener("beforeunload", function() { sendConversationSummary("saiu_do_site"); });
})();
