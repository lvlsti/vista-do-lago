/* ============================================================
   app.js — Vista do Lago Jungle Lodge
   ============================================================ */
(function(){
  "use strict";
  const RES_URL = "https://hotels.cloudbeds.com/pt-br/reservas/o94fsy/?currency=brl";

  /* ---------- header scroll state ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 60);
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---------- TrustIndex fallback auto-hide ---------- */
  (function(){
    const wrap = document.querySelector(".ti-widget");
    const fb = document.getElementById("tiFallback");
    if(!wrap || !fb) return;
    const check = () => {
      const loaded = wrap.querySelector('[class*="trustindex"],[class*="ti-widget-container"],iframe');
      if(loaded){ fb.style.display = "none"; return true; }
      return false;
    };
    if(check()) return;
    const obs = new MutationObserver(() => { if(check()) obs.disconnect(); });
    obs.observe(wrap, {childList:true, subtree:true});
    setTimeout(() => obs.disconnect(), 12000);
  })();

  /* ---------- mobile menu ---------- */
  const mobile = document.getElementById("mobileMenu");
  document.getElementById("hamburger").addEventListener("click", ()=>mobile.classList.add("open"));
  mobile.querySelector(".close").addEventListener("click", ()=>mobile.classList.remove("open"));
  mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click", ()=>mobile.classList.remove("open")));

  /* ---------- hero background video (YouTube IFrame API) ---------- */
  // Loops the 47s–100s segment. The static facade image stays visible until the
  // video actually starts PLAYING; on any error/block it remains as the backdrop.
  const fb = document.querySelector(".hero-fallback");
  const VID = "vD71_gPdCGg", START = 47, END = 100;
  let ytPlayer = null;
  window.onYouTubeIframeAPIReady = function(){
    if(!document.getElementById("ytPlayer")) return;
    ytPlayer = new YT.Player("ytPlayer", {
      videoId: VID,
      playerVars: {
        autoplay:1, mute:1, controls:0, showinfo:0, rel:0, modestbranding:1,
        playsinline:1, start:START, end:END, fs:0, disablekb:1, iv_load_policy:3
      },
      events: {
        onReady: e => { try{ e.target.mute(); e.target.seekTo(START,true); e.target.playVideo(); }catch(_){} },
        onStateChange: e => {
          if(e.data === YT.PlayerState.PLAYING && fb) fb.classList.add("hide");
          if(e.data === YT.PlayerState.ENDED){ e.target.seekTo(START,true); e.target.playVideo(); }
        },
        onError: () => { if(fb) fb.classList.remove("hide"); }
      }
    });
  };
  (function loadYT(){
    if(window.YT && window.YT.Player){ window.onYouTubeIframeAPIReady(); return; }
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => { if(fb) fb.classList.remove("hide"); };
    document.head.appendChild(s);
  })();

  /* ---------- i18n ---------- */
  // International-first: English is the default. We honor a stored choice,
  // but do NOT auto-switch from the browser locale on first visit.
  let lang = localStorage.getItem("vdl_lang") || "en";
  if(!["en","es","pt"].includes(lang)) lang = "en";
  let rotTimer = null, rotIdx = 0;

  function applyLang(l){
    lang = l;
    localStorage.setItem("vdl_lang", l);
    document.documentElement.lang = l;
    const dict = I18N[l];
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const v = dict[el.getAttribute("data-i18n")];
      if(typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el=>{
      const v = dict[el.getAttribute("data-i18n-html")];
      if(typeof v === "string") el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(el=>{
      const spec = el.getAttribute("data-i18n-attr"); // "attr:key"
      spec.split(",").forEach(pair=>{
        const [attr,key] = pair.split(":");
        if(dict[key]!=null) el.setAttribute(attr, dict[key]);
      });
    });
    // active states on switchers
    document.querySelectorAll("[data-lang]").forEach(b=>{
      b.classList.toggle("active", b.getAttribute("data-lang")===l);
    });
    startRotator();
  }

  function startRotator(){
    const el = document.getElementById("rotword");
    if(!el) return;
    const words = I18N[lang]["hero.rot"];
    if(rotTimer) clearInterval(rotTimer);
    rotIdx = 0;
    el.textContent = words[0];
    rotTimer = setInterval(()=>{
      el.classList.add("out");          // current word fades out toward the right
      setTimeout(()=>{
        rotIdx = (rotIdx+1)%words.length;
        el.textContent = words[rotIdx];
        el.classList.add("enter");      // jump to start position (right, hidden), no transition
        el.classList.remove("out");
        void el.offsetWidth;            // force reflow
        el.classList.remove("enter");   // animate in: right -> left
      }, 480);
    }, 2800);
  }

  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.addEventListener("click", ()=>applyLang(btn.getAttribute("data-lang")));
  });

  /* ---------- booking bar ---------- */
  const ci = document.getElementById("checkin");
  const co = document.getElementById("checkout");
  if(ci && co){
    const today = new Date();
    const tmrw = new Date(Date.now()+864e5);
    const day3 = new Date(Date.now()+3*864e5);
    const fmt = d=>d.toISOString().slice(0,10);
    ci.min = fmt(today); ci.value = fmt(tmrw);
    co.min = fmt(tmrw);  co.value = fmt(day3);
    ci.addEventListener("change", ()=>{ co.min = ci.value; if(co.value<=ci.value){ const n=new Date(new Date(ci.value).getTime()+864e5); co.value=fmt(n);} });
  }
  const bform = document.getElementById("bookingForm");
  if(bform){
    bform.addEventListener("submit", e=>{
      e.preventDefault();
      let url = RES_URL;
      if(ci && co) url += `&checkin=${ci.value}&checkout=${co.value}`;
      window.open(url, "_blank", "noopener");
    });
  }

  /* ---------- CloudBeds widget: show styled fallback ONLY if it fails to render ---------- */
  const bbar = document.querySelector(".booking-bar");
  if(bbar && bform){
    // .booking-form is hidden by default in CSS — no flash before CloudBeds loads
    const detect = () => !!bbar.querySelector('iframe,[class*="cloudbeds" i],[id*="cloudbeds" i],[class*="cb-widget" i],[id*="cb-widget" i]');
    const mo = new MutationObserver(()=>{ if(detect()){ bform.classList.remove("show"); mo.disconnect(); } });
    mo.observe(bbar, {childList:true, subtree:true});
    // if CloudBeds hasn't rendered after 4.5s, reveal the on-brand fallback form
    setTimeout(()=>{ if(!detect()) bform.classList.add("show"); mo.disconnect(); }, 4500);
  }

  /* ---------- TrustIndex: hide the fallback badge once the widget renders ---------- */
  const tiHost = document.querySelector(".reviews-strip .ti-host");
  const tiFb = tiHost ? tiHost.querySelector(".ti-fallback") : null;
  if(tiHost && tiFb){
    const tiDetect = () => {
      const others = [...tiHost.children].filter(c => c !== tiFb && c.tagName !== "SCRIPT");
      const rendered = others.some(c => c.children.length > 0 || c.offsetHeight > 60
        || c.querySelector('iframe,[class*="ti-" i],[class*="trustindex" i]'));
      if(rendered){ tiFb.style.display = "none"; return true; }
      return false;
    };
    const tmo = new MutationObserver(()=>{ tiDetect(); });
    tmo.observe(tiHost, {childList:true, subtree:true});
    setTimeout(()=>{ tiDetect(); tmo.disconnect(); }, 12000);
  }

  /* ---------- video modal ---------- */
  const modal = document.getElementById("videoModal");
  const frameWrap = modal ? modal.querySelector(".frame") : null;
  const VID_ID = "YR2YocPH2Wg";
  let modalPlayer = null;
  function buildModalPlayer(){
    modalPlayer = new YT.Player(frameWrap.querySelector("#modalPlayer"), {
      videoId: VID_ID,
      host: "https://www.youtube-nocookie.com",
      playerVars: {autoplay:1, rel:0, playsinline:1, modestbranding:1},
      events: { onReady: e => { try{ e.target.playVideo(); }catch(_){ } } }
    });
  }
  function openModal(){
    if(!frameWrap) return;
    frameWrap.innerHTML = '<div id="modalPlayer"></div>';
    modal.classList.add("open");
    if(window.YT && window.YT.Player){ buildModalPlayer(); }
    else {
      const t = setInterval(()=>{ if(window.YT && window.YT.Player){ clearInterval(t); buildModalPlayer(); } }, 120);
      setTimeout(()=>clearInterval(t), 6000);
    }
  }
  function closeModal(){
    try{ if(modalPlayer && modalPlayer.destroy) modalPlayer.destroy(); }catch(_){}
    modalPlayer = null;
    if(modal) modal.classList.remove("open");
    if(frameWrap) frameWrap.innerHTML = "";
  }
  const trigger = document.getElementById("videoTrigger");
  if(trigger) trigger.addEventListener("click", openModal);
  if(modal){
    modal.querySelector(".x").addEventListener("click", closeModal);
    modal.addEventListener("click", e=>{ if(e.target===modal) closeModal(); });
    document.addEventListener("keydown", e=>{ if(e.key==="Escape" && modal.classList.contains("open")) closeModal(); });
  }

  /* ---------- back to top ---------- */
  const totop = document.getElementById("toTop");
  if(totop) totop.addEventListener("click", ()=>window.scrollTo({top:0,behavior:"smooth"}));

  /* ---------- fade-up observer ---------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
  }, {threshold:0.12, rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".fade-up").forEach(el=>io.observe(el));

  /* ---------- init ---------- */
  applyLang(lang);
})();
