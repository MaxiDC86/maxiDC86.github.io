// ===== Galería de trabajos (grilla profesional + lightbox con navegación) =====
// Diseño limpio: grilla responsive, hover sutil (zoom + lupa), y visor a pantalla
// completa con flechas, contador y teclado. Compartido por todas las páginas.

(function () {
  const cfg = window.GALLERY || {};
  const floor = document.getElementById("collageFloor");

  // ----- Generar las fotos (slots de la grilla) -----
  if (floor && cfg.count) {
    const n = cfg.count;
    const folder = cfg.folder || "";
    const alt = cfg.alt || "Trabajo";

    for (let i = 0; i < n; i++) {
      const num = String(i + 1).padStart(2, "0");

      const fig = document.createElement("figure");
      fig.className = "tile";

      const card = document.createElement("div");
      card.className = "tile-card";
      card.setAttribute("data-label", "Foto " + (i + 1));

      const img = document.createElement("img");
      img.src = folder + num + ".jpg";
      img.alt = alt + " " + (i + 1);
      img.loading = "lazy";
      img.onerror = function () {
        this.remove();
      };

      card.appendChild(img);
      fig.appendChild(card);
      floor.appendChild(fig);
    }
  }

  // ----- Lightbox con navegación (‹ ›, contador, teclado) -----
  (function () {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    const lbImg = lb.querySelector("img");

    // Botones y contador (se crean por JS para no tocar cada HTML).
    let closeBtn = lb.querySelector(".lightbox-close");
    if (!closeBtn) {
      closeBtn = document.createElement("button");
      closeBtn.className = "lightbox-close";
      closeBtn.setAttribute("aria-label", "Cerrar");
      closeBtn.innerHTML = "&times;";
      lb.appendChild(closeBtn);
    }
    const prevBtn = document.createElement("button");
    prevBtn.className = "lightbox-nav lightbox-prev";
    prevBtn.setAttribute("aria-label", "Anterior");
    prevBtn.innerHTML = "&#8249;";
    const nextBtn = document.createElement("button");
    nextBtn.className = "lightbox-nav lightbox-next";
    nextBtn.setAttribute("aria-label", "Siguiente");
    nextBtn.innerHTML = "&#8250;";
    const counter = document.createElement("div");
    counter.className = "lightbox-counter";
    lb.appendChild(prevBtn);
    lb.appendChild(nextBtn);
    lb.appendChild(counter);

    let imgs = [];
    let idx = 0;

    function refresh() {
      imgs = Array.from(document.querySelectorAll(".tile img"));
    }
    function render() {
      if (!imgs[idx]) return;
      lbImg.src = imgs[idx].src;
      lbImg.alt = imgs[idx].alt;
      counter.textContent = idx + 1 + " / " + imgs.length;
      const many = imgs.length > 1;
      prevBtn.style.display = many ? "flex" : "none";
      nextBtn.style.display = many ? "flex" : "none";
    }
    function openAt(el) {
      refresh();
      idx = imgs.indexOf(el);
      if (idx < 0) idx = 0;
      render();
      lb.classList.add("open");
    }
    function close() {
      lb.classList.remove("open");
      lbImg.src = "";
    }
    function step(d) {
      if (!imgs.length) return;
      idx = (idx + d + imgs.length) % imgs.length;
      render();
    }

    // Abrir al clickear una foto (delegación).
    document.addEventListener("click", (e) => {
      const tile = e.target.closest(".tile");
      if (!tile) return;
      const img = tile.querySelector("img");
      if (img) openAt(img);
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      step(-1);
    });
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      step(1);
    });
    // Click en el fondo (no en la imagen ni en los botones) cierra.
    lb.addEventListener("click", (e) => {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  })();

  // ----- Traducción ES <-> EN (misma lógica que el inicio) -----
  (function () {
    const STORE_KEY = "dcm-lang";
    const nodes = document.querySelectorAll("[data-en]");
    nodes.forEach((el) => {
      el.dataset.es = el.textContent.trim();
    });
    const toggles = document.querySelectorAll(".lang-toggle");

    function applyLang(lang) {
      const isEn = lang === "en";
      nodes.forEach((el) => {
        el.textContent = isEn ? el.getAttribute("data-en") : el.dataset.es;
      });
      document.documentElement.lang = isEn ? "en" : "es";
      // La banderita refleja el idioma ACTUAL: ES -> Argentina/España, EN -> UK/USA
      const flagRef = isEn ? "#flag-uk-us" : "#flag-ar-es";
      document.querySelectorAll(".lang-flag use").forEach((u) => {
        u.setAttribute("href", flagRef);
      });
      toggles.forEach((btn) => {
        btn.classList.toggle("is-en", isEn);
        btn.setAttribute("aria-pressed", String(isEn));
        btn.title = isEn ? "Ver en Español" : "View in English";
      });
      try {
        localStorage.setItem(STORE_KEY, lang);
      } catch (e) {}
    }

    let current = "es";
    try {
      current = localStorage.getItem(STORE_KEY) || "es";
    } catch (e) {}
    applyLang(current);

    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        applyLang(document.documentElement.lang === "en" ? "es" : "en");
      });
    });
  })();
})();
