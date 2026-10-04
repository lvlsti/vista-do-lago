/* ============================================================
   groups.js — Amazon Group Trips page
   Option details modal (pricing + dates) and image lightbox.
   Derives all content from the DOM so no per-button markup is needed.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Option details modal ---------- */
  const modal = document.getElementById("optModal");
  if (modal) {
    const titleEl = document.getElementById("optTitle");
    const nightsEl = document.getElementById("optNights");
    const priceEl = document.getElementById("optPrice");
    const listEl = document.getElementById("optList");
    const actsEl = document.getElementById("optActs");
    const waEl = document.getElementById("optWa");
    const dialog = modal.querySelector(".opt-dialog");
    const viewPkg = document.getElementById("optViewPkg");
    const viewAct = document.getElementById("optViewAct");
    const actTitleEl = document.getElementById("optActTitle");
    const actDescEl = document.getElementById("optActDesc");
    const actLinkEl = document.getElementById("optActLink");
    const backBtn = document.getElementById("optBack");

    function dict() {
      let lang = "en";
      try { lang = localStorage.getItem("vdl_lang") || "en"; } catch (e) {}
      if (typeof I18N !== "undefined") return I18N[lang] || I18N.en || {};
      return {};
    }

    function priceCardByNights(n) {
      const cards = document.querySelectorAll(".price-card");
      for (const c of cards) {
        const dur = c.querySelector(".dur");
        if (dur && parseInt(dur.textContent, 10) === n) return c;
      }
      return null;
    }

    function showPackage() {
      viewAct.hidden = true;
      viewPkg.hidden = false;
      if (dialog) dialog.scrollTop = 0;
    }

    function showActivity(slug, name) {
      const d = dict();
      actTitleEl.textContent = d["ac." + slug + ".title"] || name;
      actDescEl.textContent = d["ac." + slug + ".lead"] || "";
      actLinkEl.setAttribute("href", "activities/" + slug + ".html");
      viewPkg.hidden = true;
      viewAct.hidden = false;
      if (dialog) dialog.scrollTop = 0;
    }

    function fillFromCard(card) {
      if (!card) return;
      const amt = card.querySelector(".amount").cloneNode(true);
      const sm = amt.querySelector("small");
      if (sm) sm.remove();
      priceEl.textContent = amt.textContent.trim();

      // inclusions = the plain <ul> (not the activities list)
      listEl.innerHTML = "";
      const inc = card.querySelector("ul:not(.pkg-acts)");
      if (inc) inc.querySelectorAll("li").forEach(li => listEl.appendChild(li.cloneNode(true)));

      // activities = clickable items from the hidden .pkg-acts list
      actsEl.innerHTML = "";
      const acts = card.querySelector("ul.pkg-acts");
      if (acts) acts.querySelectorAll("li").forEach(li => {
        const slug = li.getAttribute("data-act") || "";
        const name = li.textContent.trim();
        const item = document.createElement("li");
        item.className = "opt-act";
        item.innerHTML = '<span></span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
        item.querySelector("span").textContent = name;
        item.addEventListener("click", () => showActivity(slug, name));
        actsEl.appendChild(item);
      });
    }

    function openModal(opts) {
      titleEl.textContent = opts.title;
      if (opts.nights) {
        nightsEl.textContent = opts.nights;
        nightsEl.style.display = "";
      } else {
        nightsEl.style.display = "none";
      }
      fillFromCard(opts.card);
      waEl.setAttribute("href", opts.waHref);
      showPackage();
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (backBtn) backBtn.addEventListener("click", showPackage);

    // Pricing cards -> popup (title = duration, price/list from the same card)
    document.querySelectorAll(".price-card .btn").forEach(btn => {
      const card = btn.closest(".price-card");
      btn.addEventListener("click", e => {
        e.preventDefault();
        openModal({
          title: card.querySelector(".dur").textContent.trim(),
          nights: null,
          card: card,
          waHref: btn.getAttribute("href")
        });
      });
    });

    // Date cards -> popup (title = date range, price/list from matching pricing card)
    document.querySelectorAll(".date-card .dc-btn").forEach(btn => {
      const dc = btn.closest(".date-card");
      btn.addEventListener("click", e => {
        e.preventDefault();
        const range = dc.querySelector(".dc-range").textContent.trim();
        const nightsTxt = dc.querySelector(".dc-nights").textContent.trim();
        const n = parseInt(nightsTxt, 10);
        openModal({
          title: range,
          nights: nightsTxt,
          card: priceCardByNights(n),
          waHref: btn.getAttribute("href")
        });
      });
    });

    modal.querySelector(".opt-close").addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ---------- Image lightbox ---------- */
  const lb = document.getElementById("lightbox");
  if (lb) {
    const lbImg = lb.querySelector("img");

    function openLb(src, alt) {
      lbImg.setAttribute("src", src);
      lbImg.setAttribute("alt", alt || "");
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function closeLb() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lbImg.setAttribute("src", "");
    }

    // Clicks land on the cell (its ::after overlay sits above the img).
    // Skip the video trigger cell (handled by app.js).
    document.querySelectorAll(".g-cell:not(#videoTrigger), .rooming .photo").forEach(cell => {
      const img = cell.querySelector("img");
      if (!img) return;
      cell.addEventListener("click", () => openLb(img.currentSrc || img.src, img.alt));
    });

    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && lb.classList.contains("open")) closeLb();
    });
  }
})();
