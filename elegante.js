/* =========================================================
   ESTILO ELEGANTE · comportamiento común
   ---------------------------------------------------------
   - Marca la página (curso, tipo) para que el CSS sepa
     qué color de acento usar.
   - Menú: botón ☰ en el móvil y desplegables con un toque.
   - Añade el pie de página en las páginas que no lo tienen.
========================================================= */

(function () {

    var html = document.documentElement;
    var ruta = decodeURIComponent(location.pathname).toLowerCase();
    var script = document.currentScript;
    var raiz = script ? new URL(".", script.src).href : "/";


    /* ---------- 1. ¿Qué página es? ---------- */

    if (/\/ccss1\//.test(ruta)) html.setAttribute("data-curso", "1");
    if (/\/ccss2\//.test(ruta)) html.setAttribute("data-curso", "2");

    var pagina = "interior";
    if (/(\/|index\.html)$/.test(ruta) && !/\/(ccss1|ccss2|calculadoras|juegos)\//.test(ruta)) pagina = "inicio";
    else if (/\/calculadoras\//.test(ruta)) pagina = "calculadora";
    else if (/\/juegos\//.test(ruta)) pagina = "juego";
    else if (/cumpleanos\.html$/.test(ruta)) pagina = "cumpleanos";
    html.setAttribute("data-pagina", pagina);


    /* ---------- 2. Menú ---------- */

    document.addEventListener("click", function (e) {

        var toggle = e.target.closest(".menu-toggle");

        if (toggle) {
            var menu = toggle.closest(".menu");
            var abierto = menu.classList.toggle("abierto");
            toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
            return;
        }

        var boton = e.target.closest(".dropdown-btn");
        var todos = document.querySelectorAll(".menu-dropdown");

        if (boton) {
            var actual = boton.closest(".menu-dropdown");
            todos.forEach(function (d) {
                if (d !== actual) d.classList.remove("abierto");
            });
            actual.classList.toggle("abierto");
            return;
        }

        if (!e.target.closest(".menu-dropdown")) {
            todos.forEach(function (d) { d.classList.remove("abierto"); });
        }

    });

    document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        document.querySelectorAll(".menu.abierto, .menu-dropdown.abierto")
            .forEach(function (el) { el.classList.remove("abierto"); });
    });


    /* ---------- 3. Pie de página siempre abajo ---------- */

    function ajustarPie() {
        var pie = document.getElementById("footer-container");
        if (!pie || !pie.firstElementChild) return;
        pie.style.marginTop = "";
        var hueco = window.innerHeight -
            (pie.getBoundingClientRect().bottom + window.scrollY);
        if (hueco > 0) {
            var base = parseFloat(getComputedStyle(pie).marginTop) || 0;
            pie.style.marginTop = (base + hueco) + "px";
        }
    }

    window.addEventListener("load", ajustarPie);
    window.addEventListener("resize", ajustarPie);
    document.addEventListener("toggle", ajustarPie, true);

    document.addEventListener("DOMContentLoaded", function () {
        if ("ResizeObserver" in window) {
            new ResizeObserver(function () { ajustarPie(); }).observe(document.body);
        }
    });


    /* ---------- 4. Pie de página en todas las páginas ---------- */

    document.addEventListener("DOMContentLoaded", function () {

        if (pagina === "juego") return;
        if (document.getElementById("footer-container")) return;
        if (!document.getElementById("menu-container")) return;

        var contenedor = document.createElement("div");
        contenedor.id = "footer-container";
        document.body.appendChild(contenedor);

        fetch(raiz + "footer.html", { cache: "no-store" })
            .then(function (r) { return r.text(); })
            .then(function (texto) { contenedor.innerHTML = texto; })
            .catch(function () {});

    });

})();
