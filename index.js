const openMenuButton = document.querySelector("#open-menu-button");

const closeMenuButton = document.querySelector("#close-menu-button");

const menu = document.querySelector("#aside-menu");

openMenuButton.addEventListener("click", () => {
  menu.style.display = "flex";
});

closeMenuButton.addEventListener("click", () => {
  menu.style.display = "none";
});

window.onscroll = function (e) {
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  }
};

// ===== Traducción ES <-> EN (toggle con la banderita del nav) =====
(function () {
  const STORE_KEY = "dcm-lang";
  const nodes = document.querySelectorAll("[data-en]");

  // Guardamos el texto original en español la primera vez.
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
    toggles.forEach((btn) => {
      btn.classList.toggle("is-en", isEn);
      btn.setAttribute("aria-pressed", String(isEn));
      btn.title = isEn ? "Ver en Español" : "View in English";
      btn.setAttribute(
        "aria-label",
        isEn ? "Cambiar idioma a Español" : "Switch language to English",
      );
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
      const next = document.documentElement.lang === "en" ? "es" : "en";
      applyLang(next);
    });
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".swiffy-slider");
  if (!slider) return;

  const container = slider.querySelector(".slider-container");
  const slides = slider.querySelectorAll(".slider-container > li");
  const indicators = slider.querySelectorAll(".slider-indicators button");
  if (!container || slides.length === 0) return;

  // Reemplazamos las flechas por clones para quitarles los listeners de swiffy
  // y manejar nosotros el loop infinito en ambos sentidos.
  let prevButton = slider.querySelector(".slider-nav:not(.slider-nav-next)");
  let nextButton = slider.querySelector(".slider-nav-next");
  if (prevButton) {
    prevButton.replaceWith(prevButton.cloneNode(true));
    prevButton = slider.querySelector(".slider-nav:not(.slider-nav-next)");
  }
  if (nextButton) {
    nextButton.replaceWith(nextButton.cloneNode(true));
    nextButton = slider.querySelector(".slider-nav-next");
  }

  let index = 0;
  let timer = null;

  function updateDots() {
    indicators.forEach((b, k) => b.classList.toggle("active", k === index));
  }

  function goTo(i, smooth) {
    // Módulo -> loop infinito hacia adelante y hacia atrás.
    index = ((i % slides.length) + slides.length) % slides.length;
    const left =
      slides[index].getBoundingClientRect().left -
      container.getBoundingClientRect().left +
      container.scrollLeft;
    container.scrollTo({ left, behavior: smooth === false ? "auto" : "smooth" });
    updateDots();
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(index + 1), 4500);
  }
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  if (prevButton) {
    prevButton.addEventListener("click", (e) => {
      e.preventDefault();
      goTo(index - 1);
      start(); // reinicia el temporizador tras interactuar
    });
  }
  if (nextButton) {
    nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      goTo(index + 1);
      start();
    });
  }
  indicators.forEach((b, k) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      goTo(k);
      start();
    });
  });

  // Se mueve solo; se pausa al pasar el mouse y retoma al salir.
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  updateDots();
  start();
});

// ===== Tarjetas de servicio que abren su propia página =====
document.querySelectorAll(".service-card[data-href]").forEach((card) => {
  card.style.cursor = "pointer";
  card.addEventListener("click", (e) => {
    // Si el click fue sobre un enlace (ej: "Contactanos"), lo dejamos pasar.
    if (e.target.closest("a")) return;
    window.location.href = card.getAttribute("data-href");
  });
});

// ===== Carrusel infinito de clientes (estilo GitHub) =====
// Se mueve solo, se pausa al pasar el mouse y se puede arrastrar.
(function () {
  const viewport = document.querySelector(".clients-marquee");
  if (!viewport) return;
  const track = viewport.querySelector(".client-list");
  if (!track) return;

  const SPEED = 40; // px por segundo
  let oneSetWidth = 0;
  let offset = 0;
  let paused = false;
  let dragging = false;
  let lastPointerX = 0;
  let lastTime = null;
  let moved = 0;

  // Evita el "fantasma" al arrastrar imágenes.
  track.querySelectorAll("img").forEach((img) => {
    img.setAttribute("draggable", "false");
  });

  function build() {
    // Quitamos clones previos (por si recalculamos en resize).
    track.querySelectorAll("[data-clone]").forEach((n) => n.remove());

    const originals = Array.from(track.children);
    const n = originals.length;
    if (!n) return;

    const cloneSet = () => {
      originals.forEach((node) => {
        const c = node.cloneNode(true);
        c.setAttribute("data-clone", "");
        c.setAttribute("aria-hidden", "true");
        track.appendChild(c);
      });
    };

    // Primer set clonado para medir el período exacto (incluye márgenes).
    cloneSet();
    oneSetWidth = track.children[n].offsetLeft - track.children[0].offsetLeft;

    // Agregamos sets hasta cubrir el viewport y poder hacer loop sin saltos.
    let guard = 0;
    while (
      track.scrollWidth < oneSetWidth + viewport.clientWidth + 50 &&
      guard < 30
    ) {
      cloneSet();
      guard++;
    }
  }

  function wrap(v) {
    if (oneSetWidth <= 0) return 0;
    return ((v % oneSetWidth) + oneSetWidth) % oneSetWidth;
  }

  function apply() {
    track.style.transform = "translateX(" + -offset + "px)";
  }

  function frame(t) {
    if (lastTime == null) lastTime = t;
    const dt = t - lastTime;
    lastTime = t;
    if (!paused && !dragging) {
      offset = wrap(offset + (SPEED * dt) / 1000);
      apply();
    }
    requestAnimationFrame(frame);
  }

  function setup() {
    offset = 0;
    build();
    apply();
  }

  // Pausa al pasar el mouse por encima.
  viewport.addEventListener("mouseenter", () => {
    paused = true;
  });
  viewport.addEventListener("mouseleave", () => {
    paused = false;
  });

  // Arrastre con el mouse / touch.
  viewport.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = 0;
    lastPointerX = e.clientX;
    viewport.classList.add("dragging");
    try {
      viewport.setPointerCapture(e.pointerId);
    } catch (_) {}
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPointerX;
    lastPointerX = e.clientX;
    moved += Math.abs(dx);
    offset = wrap(offset - dx);
    apply();
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("dragging");
    try {
      viewport.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  // Evita que un arrastre dispare el click/navegación de un logo.
  viewport.addEventListener("click", (e) => {
    if (moved > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  viewport.addEventListener("dragstart", (e) => e.preventDefault());

  // Recalcula en resize (con debounce) para mantener el loop perfecto.
  let rz;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(setup, 200);
  });

  setup();
  // Reajusta cuando todo (imágenes) terminó de cargar.
  window.addEventListener("load", setup);
  requestAnimationFrame(frame);
})();
