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

document.addEventListener("DOMContentLoaded", function () {
  let slider = document.querySelector(".swiffy-slider");
  if (!slider) return;

  let slides = slider.querySelectorAll(".slider-container li");
  let nextButton = slider.querySelector(".slider-nav-next");
  let indicators = slider.querySelectorAll(".slider-indicators button");

  let index = 0; // Índice de la diapositiva actual

  setInterval(() => {
    index++;

    // Si llega al final, vuelve a la primera diapositiva
    if (index >= slides.length) {
      index = 0;
      //slides[0].scrollIntoView({ behavior: "smooth" });
      sliderContainer.scrollLeft = 0; // Reinicia el scroll sin mover la página
    } else {
      nextButton.click();
    }

    // Actualizar los indicadores activos (opcional)
    indicators.forEach((btn) => btn.classList.remove("active"));
    if (indicators[index]) indicators[index].classList.add("active");
  }, 4500); // Cambia cada 2 segundos
});
