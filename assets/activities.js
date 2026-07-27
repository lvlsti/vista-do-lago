/* ============================================================
   Carrossel das paginas de atividade.
   Fotos e videos no mesmo trilho. O iframe do YouTube so e criado
   quando o hospede clica no play, entao a pagina abre leve.
   ============================================================ */
(function () {
  var car = document.getElementById("acCar");
  if (!car) return;

  var track = car.querySelector(".ac-track");
  var slides = [].slice.call(car.querySelectorAll(".ac-slide"));
  var dots = car.querySelector(".ac-dots");
  var agora = car.querySelector(".ac-count .now");
  var i = 0;

  /* botao de play nos slides de video */
  slides.forEach(function (s) {
    var id = s.getAttribute("data-yt");
    if (!id) return;
    s.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    s.style.backgroundSize = "cover";
    s.style.backgroundPosition = "center";
    var b = document.createElement("button");
    b.className = "play";
    b.type = "button";
    b.setAttribute("aria-label", "Play");
    b.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    b.addEventListener("click", function () {
      s.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?rel=0&autoplay=1" title="" allow="accelerometer; autoplay; clipboard-write; ' +
        'encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    });
    s.appendChild(b);
  });

  if (slides.length < 2) return;

  /* bolinhas */
  if (dots) {
    slides.forEach(function (_, n) {
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Slide " + (n + 1));
      d.addEventListener("click", function () { ir(n); });
      dots.appendChild(d);
    });
  }

  function ir(n) {
    i = (n + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-i * 100) + "%)";
    if (agora) agora.textContent = i + 1;
    if (dots) {
      [].forEach.call(dots.children, function (d, k) {
        d.classList.toggle("on", k === i);
      });
    }
  }

  var prev = car.querySelector(".ac-nav.prev");
  var next = car.querySelector(".ac-nav.next");
  if (prev) prev.addEventListener("click", function () { ir(i - 1); });
  if (next) next.addEventListener("click", function () { ir(i + 1); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") ir(i - 1);
    if (e.key === "ArrowRight") ir(i + 1);
  });

  /* arrastar com o dedo */
  var x0 = null;
  car.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  car.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var d = e.changedTouches[0].clientX - x0;
    if (Math.abs(d) > 45) ir(d < 0 ? i + 1 : i - 1);
    x0 = null;
  }, { passive: true });

  ir(0);
})();
