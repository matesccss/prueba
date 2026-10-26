/* =========================================================
   ESTILO ELEGANTE · comportamiento común
   ---------------------------------------------------------
   1. Marca la página (curso, tipo) y el modo claro/noche.
   2. Menú: botón ☰ en el móvil y desplegables con un toque.
   3. Pie de página siempre abajo y en todas las páginas.
   4. Efectos: foco de luz en tarjetas, aparición suave,
      curva de Gauss en la portada, botón "volver arriba".
   5. Próximos exámenes en la portada (lee las fechas que
      ya pone cada tema: "Fecha: 11 de noviembre de 2026…").
   6. Buscador de temas y vídeos (botón 🔍, Ctrl+K o "/").

   No hace falta tocar nada aquí al añadir temas o vídeos:
   todo se lee de menu.html y de las propias páginas.
========================================================= */

(function () {

    var html = document.documentElement;
    var ruta = decodeURIComponent(location.pathname).toLowerCase();
    var script = document.currentScript;
    var raiz = script ? new URL(".", script.src).href : new URL("/", location.href).href;

    function guardar(clave, valor) {
        try { localStorage.setItem(clave, valor); } catch (e) {}
    }

    function leer(clave) {
        try { return localStorage.getItem(clave); } catch (e) { return null; }
    }


    /* =====================================================
       1. TIPO DE PÁGINA Y MODO CLARO / NOCHE
    ===================================================== */

    if (/\/ccss1\//.test(ruta)) html.setAttribute("data-curso", "1");
    if (/\/ccss2\//.test(ruta)) html.setAttribute("data-curso", "2");

    var pagina = "interior";
    if (/(\/|index\.html)$/.test(ruta) && !/\/(ccss1|ccss2|calculadoras|juegos)\//.test(ruta)) pagina = "inicio";
    else if (/\/calculadoras\//.test(ruta)) pagina = "calculadora";
    else if (/\/juegos\//.test(ruta)) pagina = "juego";
    else if (/cumpleanos\.html$/.test(ruta)) pagina = "cumpleanos";
    html.setAttribute("data-pagina", pagina);

    function aplicarTema(tema) {
        html.setAttribute("data-tema", tema);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", tema === "noche" ? "#0b0d17" : "#f4f4f7");
    }

    aplicarTema(leer("tema-web") === "noche" ? "noche" : "claro");

    var movimientoReducido =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* =====================================================
       2. MENÚ Y BOTONES (delegados: funcionan aunque el
          menú se cargue después)
    ===================================================== */

    document.addEventListener("click", function (e) {

        var botonTema = e.target.closest(".menu-tema");
        if (botonTema) {
            var nuevo = html.getAttribute("data-tema") === "noche" ? "claro" : "noche";
            aplicarTema(nuevo);
            guardar("tema-web", nuevo);
            return;
        }

        if (e.target.closest(".menu-buscar")) {
            abrirBuscador();
            return;
        }

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

        var escribiendo = /input|textarea|select/i.test((e.target.tagName || "")) || e.target.isContentEditable;

        if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
            e.preventDefault();
            abrirBuscador();
            return;
        }

        if (e.key === "/" && !escribiendo && pagina !== "juego") {
            e.preventDefault();
            abrirBuscador();
            return;
        }

        if (e.key === "Escape") {
            document.querySelectorAll(".menu.abierto, .menu-dropdown.abierto")
                .forEach(function (el) { el.classList.remove("abierto"); });
        }

    });


    /* =====================================================
       3. PIE DE PÁGINA
    ===================================================== */

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


    /* =====================================================
       4. EFECTOS
    ===================================================== */

    /* Foco de luz que sigue al ratón dentro de las tarjetas */

    var SELECTOR_FOCO =
        ".quick-card, .pau-card, .btn-tema, .board, .news-card, .video-section, " +
        ".aviso-examen, .curiosidades, .game-card, .b-tile, .tema, .recurso";

    document.addEventListener("pointermove", function (e) {
        var t = e.target.closest && e.target.closest(SELECTOR_FOCO);
        if (!t) return;
        var r = t.getBoundingClientRect();
        t.style.setProperty("--mx", (e.clientX - r.left) + "px");
        t.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });


    /* Aparición suave al hacer scroll */

    var SELECTOR_REVELAR =
        ".hero-apple, .titulo-accesos, .titulo-pau, .quick-card, .board-wrapper, .news-card, " +
        ".pau-card, .b-tile, .tema-header, .btn-tema, .aviso-examen, .curiosidades, " +
        ".videos-header, .video-section, .game-card, .tema, .cabecera";

    function prepararAparicion() {

        if (movimientoReducido || !("IntersectionObserver" in window)) return;

        var observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add("visible");
                    observador.unobserve(en.target);
                }
            });
        }, { rootMargin: "0px 0px -6% 0px" });

        var vistos = 0;

        document.querySelectorAll(SELECTOR_REVELAR).forEach(function (el) {
            if (el.classList.contains("revelar")) return;
            var hermanos = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
            el.style.transitionDelay = Math.min(hermanos, 8) * 45 + "ms";
            el.classList.add("revelar");
            observador.observe(el);
            vistos++;
        });

        /* Seguridad: si algo no se ha mostrado en 2,5 s, se muestra igual */
        if (vistos) {
            setTimeout(function () {
                document.querySelectorAll(".revelar:not(.visible)").forEach(function (el) {
                    var r = el.getBoundingClientRect();
                    if (r.top < window.innerHeight) el.classList.add("visible");
                });
            }, 2500);
        }
    }


    /* Curva de Gauss que se dibuja en la cabecera de la portada */

    function dibujarCurva() {

        var hero = document.querySelector(".hero-apple");
        if (!hero || hero.querySelector(".hero-curva")) return;

        var W = 1200, H = 260, base = 230, puntos = [], sombra = [];

        for (var i = 0; i <= 120; i++) {
            var x = i / 120 * W;
            var z = (x - W / 2) / 150;
            var y = base - Math.exp(-z * z / 2) * 190;
            puntos.push((i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1));
            if (x >= W / 2 - 150 && x <= W / 2 + 150) sombra.push(x.toFixed(1) + " " + y.toFixed(1));
        }

        var area = "M" + (W / 2 - 150) + " " + base + " L" + sombra.join(" L") + " L" + (W / 2 + 150) + " " + base + " Z";

        var ns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(ns, "svg");
        svg.setAttribute("class", "hero-curva");
        svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("aria-hidden", "true");
        svg.innerHTML =
            '<defs><linearGradient id="hc-g" x1="0" x2="0" y1="0" y2="1">' +
            '<stop offset="0" stop-color="currentColor" stop-opacity=".28"/>' +
            '<stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>' +
            '<line class="hc-eje" x1="0" y1="' + base + '" x2="' + W + '" y2="' + base + '"/>' +
            '<path class="hc-area" d="' + area + '" fill="url(#hc-g)"/>' +
            '<path class="hc-linea" d="' + puntos.join(" ") + '" pathLength="1"/>' +
            '<line class="hc-media" x1="' + W / 2 + '" y1="' + (base - 190) + '" x2="' + W / 2 + '" y2="' + base + '"/>';

        hero.insertBefore(svg, hero.firstChild);
    }


    /* Botón "volver arriba" */

    function botonArriba() {

        if (pagina === "juego") return;

        var b = document.createElement("button");
        b.type = "button";
        b.className = "volver-arriba";
        b.setAttribute("aria-label", "Volver arriba");
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5l-7 7 1.4 1.4L11 8.8V20h2V8.8l4.6 4.6L19 12z"/></svg>';
        b.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: movimientoReducido ? "auto" : "smooth" });
        });
        document.body.appendChild(b);

        var visible = false;
        window.addEventListener("scroll", function () {
            var debe = window.scrollY > 700;
            if (debe !== visible) {
                visible = debe;
                b.classList.toggle("activo", debe);
            }
        }, { passive: true });
    }


    /* Abrir un apartado concreto al llegar desde el buscador (?abrir=3) */

    function abrirApartado() {
        var n = new URLSearchParams(location.search).get("abrir");
        if (n === null) return;
        var d = document.querySelectorAll("details")[Number(n)];
        if (!d) return;
        d.open = true;
        d.classList.add("destacado");
        setTimeout(function () {
            d.scrollIntoView({ behavior: movimientoReducido ? "auto" : "smooth", block: "start" });
        }, 250);
    }


    /* =====================================================
       5. DATOS: temas, fechas de examen y vídeos
          (se leen de menu.html y de cada página)
    ===================================================== */

    var MESES = {
        enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6,
        agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };

    function limpiar(t) {
        return (t || "").replace(/\s+/g, " ").trim();
    }

    function leerFecha(texto) {
        var m = /(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})(?:[^\d]+(\d{1,2})[:.](\d{2}))?/i.exec(texto || "");
        if (!m) return null;
        var mes = MESES[m[2].toLowerCase()];
        if (mes === undefined) return null;
        return new Date(+m[3], mes, +m[1], +(m[4] || 9), +(m[5] || 0)).getTime();
    }

    function pedir(url) {
        return fetch(url, { cache: "no-cache" })
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
            .then(function (t) { return new DOMParser().parseFromString(t, "text/html"); });
    }

    var promesaTemas = null;

    function cargarTemas() {

        if (promesaTemas) return promesaTemas;

        try {
            var guardado = JSON.parse(sessionStorage.getItem("indice-web") || "null");
            if (guardado && Date.now() - guardado.t < 10 * 60 * 1000) {
                promesaTemas = Promise.resolve(guardado.datos);
                return promesaTemas;
            }
        } catch (e) {}

        promesaTemas = pedir(raiz + "menu.html").then(function (menu) {

            var temas = [];

            menu.querySelectorAll(".menu-dropdown").forEach(function (dd, i) {
                dd.querySelectorAll(".dropdown-content a").forEach(function (a) {
                    if (/display\s*:\s*none/i.test(a.getAttribute("style") || "")) return;
                    temas.push({
                        curso: i + 1,
                        url: new URL(a.getAttribute("href"), raiz).href,
                        nombre: limpiar(a.textContent)
                    });
                });
            });

            return Promise.all(temas.map(function (t) {
                return pedir(t.url).then(function (doc) {
                    var h1 = doc.querySelector(".tema-header h1, h1");
                    var aviso = doc.querySelector(".aviso-examen");
                    t.titulo = limpiar(h1 && h1.textContent) || t.nombre;
                    t.fecha = aviso ? leerFecha(aviso.textContent) : null;
                    t.recursos = [];
                    doc.querySelectorAll("a.btn-tema").forEach(function (a) {
                        var href = a.getAttribute("href") || "";
                        var tit = limpiar((a.querySelector(".titulo") || a).textContent);
                        if (!href || /btn-deshabilitado/.test(a.className)) return;
                        t.recursos.push({ titulo: tit, url: new URL(href, t.url).href });
                    });
                    return t;
                }).catch(function () { t.titulo = t.nombre; t.fecha = null; t.recursos = []; return t; });
            }));

        }).then(function (temas) {

            /* Vídeos: apartados de las páginas de vídeos de cada tema */
            var paginas = [];
            temas.forEach(function (t) {
                t.recursos.forEach(function (r) {
                    if (/videosyoutube|videospropios/.test(r.url)) paginas.push({ tema: t, r: r });
                });
            });

            ["calculadoras/calculadora570.html", "calculadoras/calculadora991.html", "calculadoras/calculadoraclasswiz.html"]
                .forEach(function (c) { paginas.push({ tema: null, r: { titulo: "Calculadora", url: raiz + c } }); });

            return Promise.all(paginas.map(function (p) {
                return pedir(p.r.url).then(function (doc) {
                    var h1 = doc.querySelector("h1");
                    p.titulo = limpiar(h1 && h1.textContent);
                    p.apartados = [];
                    doc.querySelectorAll("details").forEach(function (d, i) {
                        var s = d.querySelector("summary");
                        if (s) p.apartados.push({ texto: limpiar(s.textContent), i: i });
                    });
                    return p;
                }).catch(function () { p.apartados = []; return p; });
            })).then(function (paginasVideo) {

                var datos = { temas: temas, videos: [] };

                paginasVideo.forEach(function (p) {
                    p.apartados.forEach(function (a) {
                        datos.videos.push({
                            texto: a.texto,
                            donde: p.tema
                                ? (p.tema.curso + ".º · " + p.tema.titulo.replace(/^Tema\s+(\d+)\s*:?/i, "T$1 ·") + " · " + p.r.titulo)
                                : (p.titulo || "Calculadora"),
                            url: p.r.url + "?abrir=" + a.i,
                            tipo: p.tema ? "video" : "calc"
                        });
                    });
                });

                try { sessionStorage.setItem("indice-web", JSON.stringify({ t: Date.now(), datos: datos })); } catch (e) {}

                return datos;
            });
        });

        return promesaTemas;
    }


    /* =====================================================
       5b. PRÓXIMOS EXÁMENES (portada)
    ===================================================== */

    var FORMATO_FECHA = { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" };

    function proximosExamenes() {

        var caja = document.getElementById("proximos-examenes");
        if (!caja) return;

        cargarTemas().then(function (datos) {

            var ahora = Date.now();
            var html = "";

            [1, 2].forEach(function (curso) {

                var futuros = datos.temas
                    .filter(function (t) { return t.curso === curso && t.fecha && t.fecha > ahora; })
                    .sort(function (a, b) { return a.fecha - b.fecha; });

                var t = futuros[0];

                html += '<article class="examen-prox" data-curso-card="' + curso + '">' +
                    '<p class="ep-curso">' + curso + '.º Bachillerato · CCSS ' + (curso === 1 ? "I" : "II") + '</p>';

                if (t) {
                    html +=
                        '<h3 class="ep-titulo"><a href="' + t.url + '">' + t.titulo + '</a></h3>' +
                        '<p class="ep-fecha">' + new Date(t.fecha).toLocaleString("es-ES", FORMATO_FECHA) + ' h</p>' +
                        '<div class="ep-cuenta" data-fecha="' + t.fecha + '">' +
                        '<div><strong>--</strong><small>días</small></div>' +
                        '<div><strong>--</strong><small>horas</small></div>' +
                        '<div><strong>--</strong><small>min</small></div>' +
                        '<div><strong>--</strong><small>seg</small></div>' +
                        '</div>' +
                        (futuros[1] ? '<p class="ep-siguiente">Después: ' + futuros[1].titulo.replace(/^Tema\s+\d+\s*:\s*/i, "") + ' · ' +
                            new Date(futuros[1].fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long" }) + '</p>' : "");
                } else {
                    html +=
                        '<h3 class="ep-titulo ep-vacio">Sin exámenes programados</h3>' +
                        '<p class="ep-fecha">Cuando haya una fecha nueva aparecerá aquí automáticamente.</p>';
                }

                html += '</article>';
            });

            caja.innerHTML = html;
            caja.classList.add("cargado");
            actualizarCuentas();

        }).catch(function () {
            caja.closest(".proximos") && (caja.closest(".proximos").style.display = "none");
        });
    }

    function dosCifras(n) { return (n < 10 ? "0" : "") + n; }

    function actualizarCuentas() {
        document.querySelectorAll(".ep-cuenta").forEach(function (c) {
            var falta = Math.max(0, +c.getAttribute("data-fecha") - Date.now());
            var s = Math.floor(falta / 1000);
            var v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
            c.querySelectorAll("strong").forEach(function (el, i) {
                var txt = i === 0 ? String(v[0]) : dosCifras(v[i]);
                if (el.textContent !== txt) el.textContent = txt;
            });
            c.classList.toggle("urgente", falta < 3 * 86400000);
        });
    }

    setInterval(actualizarCuentas, 1000);


    /* =====================================================
       6. BUSCADOR (Ctrl+K)
    ===================================================== */

    var buscador = null;

    function quitarTildes(t) {
        return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    }

    function crearBuscador() {

        buscador = document.createElement("div");
        buscador.className = "buscador";
        buscador.setAttribute("role", "dialog");
        buscador.setAttribute("aria-modal", "true");
        buscador.setAttribute("aria-label", "Buscar en la web");
        buscador.innerHTML =
            '<div class="buscador-fondo"></div>' +
            '<div class="buscador-caja">' +
            '  <div class="buscador-campo">' +
            '    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2a8 8 0 016.32 12.9l5.39 5.4-1.41 1.4-5.4-5.39A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z"/></svg>' +
            '    <input type="search" placeholder="Busca un tema, un vídeo, «derivadas», «Bayes»…" autocomplete="off" spellcheck="false">' +
            '    <kbd>Esc</kbd>' +
            '  </div>' +
            '  <ul class="buscador-lista" role="listbox"></ul>' +
            '  <p class="buscador-pie"><span><kbd>↑</kbd><kbd>↓</kbd> moverse</span><span><kbd>Enter</kbd> abrir</span></p>' +
            '</div>';
        document.body.appendChild(buscador);

        var campo = buscador.querySelector("input");
        var lista = buscador.querySelector(".buscador-lista");
        var seleccion = 0;
        var resultados = [];

        function pintar() {
            if (!resultados.length) {
                lista.innerHTML = '<li class="buscador-nada">' +
                    (campo.value.trim() ? "No hay resultados para «" + campo.value.replace(/</g, "&lt;") + "»" : "Cargando…") + '</li>';
                return;
            }
            lista.innerHTML = resultados.map(function (r, i) {
                return '<li role="option" class="br-' + r.tipo + (i === seleccion ? " activo" : "") + '" data-i="' + i + '">' +
                    '<span class="br-icono"></span>' +
                    '<span class="br-texto"><strong>' + r.texto + '</strong><small>' + r.donde + '</small></span>' +
                    '<span class="br-ir">↵</span></li>';
            }).join("");
            var act = lista.querySelector(".activo");
            if (act) act.scrollIntoView({ block: "nearest" });
        }

        function buscar() {
            cargarTemas().then(function (datos) {

                var q = quitarTildes(campo.value.trim());
                var palabras = q.split(/\s+/).filter(Boolean);

                var todo = [];

                datos.temas.forEach(function (t) {
                    todo.push({ texto: t.titulo, donde: t.curso + ".º Bachillerato · Matemáticas CCSS " + (t.curso === 1 ? "I" : "II"), url: t.url, tipo: "tema" });
                });

                [
                    ["Exámenes del curso", "Pruebas realizadas y soluciones", "examenes.html"],
                    ["Juegos", "Modo juego", "juegos.html"],
                    ["Galería de Reels", "Instagram y TikTok", "reels.html"],
                    ["Cumpleaños", "Calendario de cumpleaños", "cumpleanos.html"]
                ].forEach(function (p) {
                    todo.push({ texto: p[0], donde: p[1], url: raiz + p[2], tipo: "pagina" });
                });

                todo = todo.concat(datos.videos);

                if (!palabras.length) {
                    resultados = todo.filter(function (r) { return r.tipo === "tema" || r.tipo === "pagina"; });
                } else {
                    resultados = todo.map(function (r) {
                        var a = quitarTildes(r.texto), b = quitarTildes(r.donde), puntos = 0;
                        for (var i = 0; i < palabras.length; i++) {
                            var p = palabras[i];
                            if (a.indexOf(p) === 0) puntos += 6;
                            else if (a.indexOf(" " + p) > -1) puntos += 4;
                            else if (a.indexOf(p) > -1) puntos += 3;
                            else if (b.indexOf(p) > -1) puntos += 1;
                            else return null;
                        }
                        if (r.tipo === "tema") puntos += 2;
                        return { r: r, p: puntos };
                    }).filter(Boolean).sort(function (x, y) { return y.p - x.p; })
                      .slice(0, 40).map(function (x) { return x.r; });
                }

                seleccion = 0;
                pintar();
            });
        }

        function ir(i) {
            var r = resultados[i];
            if (r) location.href = r.url;
        }

        campo.addEventListener("input", buscar);

        campo.addEventListener("keydown", function (e) {
            if (e.key === "ArrowDown") { e.preventDefault(); seleccion = Math.min(seleccion + 1, resultados.length - 1); pintar(); }
            else if (e.key === "ArrowUp") { e.preventDefault(); seleccion = Math.max(seleccion - 1, 0); pintar(); }
            else if (e.key === "Enter") { e.preventDefault(); ir(seleccion); }
            else if (e.key === "Escape") { cerrarBuscador(); }
        });

        lista.addEventListener("click", function (e) {
            var li = e.target.closest("li[data-i]");
            if (li) ir(+li.getAttribute("data-i"));
        });

        lista.addEventListener("mousemove", function (e) {
            var li = e.target.closest("li[data-i]");
            if (li && +li.getAttribute("data-i") !== seleccion) {
                seleccion = +li.getAttribute("data-i");
                lista.querySelectorAll(".activo").forEach(function (x) { x.classList.remove("activo"); });
                li.classList.add("activo");
            }
        });

        buscador.querySelector(".buscador-fondo").addEventListener("click", cerrarBuscador);

        buscador.buscar = buscar;
    }

    function abrirBuscador() {
        if (!buscador) crearBuscador();
        buscador.classList.add("abierto");
        document.documentElement.classList.add("sin-scroll");
        var campo = buscador.querySelector("input");
        campo.value = "";
        buscador.buscar();
        setTimeout(function () { campo.focus(); }, 30);
    }

    function cerrarBuscador() {
        if (!buscador) return;
        buscador.classList.remove("abierto");
        document.documentElement.classList.remove("sin-scroll");
    }

    window.abrirBuscador = abrirBuscador;


    /* =====================================================
       7. PORTADA: saludo, racha, próximo examen, reto
          del día y calculadora de nota PAU
    ===================================================== */

    function hoyClave(d) {
        d = d || new Date();
        return d.getFullYear() + "-" + dosCifras(d.getMonth() + 1) + "-" + dosCifras(d.getDate());
    }

    function saludoYRacha() {

        var ahora = new Date();
        var h = ahora.getHours();
        var saludo = h < 6 ? "Buenas noches" : h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
        var fecha = ahora.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

        var el = document.getElementById("saludo");
        if (el) el.textContent = saludo + " · " + fecha;

        /* Racha de días seguidos entrando en la web (solo en este dispositivo) */
        var racha = { dia: "", n: 0 };
        try { racha = JSON.parse(leer("racha-web") || "null") || racha; } catch (e) {}

        var hoy = hoyClave(ahora);
        var ayer = hoyClave(new Date(ahora.getTime() - 86400000));

        if (racha.dia !== hoy) {
            racha.n = racha.dia === ayer ? racha.n + 1 : 1;
            racha.dia = hoy;
            guardar("racha-web", JSON.stringify(racha));
        }

        var r = document.getElementById("racha");
        if (r && racha.n >= 2) {
            r.hidden = false;
            r.textContent = racha.n + " días seguidos";
            r.title = "Días seguidos que has entrado en la web desde este dispositivo";
        }
    }


    /* Próximo examen: solo el más cercano que esté en cuenta atrás */

    function proximoExamen() {

        var caja = document.getElementById("proximo-examen");
        var bento = document.getElementById("bento");
        if (!caja) return;

        cargarTemas().then(function (datos) {

            var ahora = Date.now();
            var futuros = datos.temas
                .filter(function (t) { return t.fecha && t.fecha > ahora; })
                .sort(function (a, b) { return a.fecha - b.fecha; });

            if (!futuros.length) {
                caja.hidden = true;
                if (bento) bento.classList.add("sin-examen");
                return;
            }

            var t = futuros[0];
            var sig = futuros[1];

            caja.setAttribute("data-curso-card", t.curso);
            caja.innerHTML =
                '<p class="b-etiqueta">Próximo examen · ' + t.curso + '.º Bach</p>' +
                '<h2 class="b-examen-titulo"><a href="' + t.url + '">' + t.titulo + '</a></h2>' +
                '<p class="b-examen-fecha">' + new Date(t.fecha).toLocaleString("es-ES", FORMATO_FECHA) + ' h</p>' +
                '<div class="ep-cuenta" data-fecha="' + t.fecha + '">' +
                '<div><strong>--</strong><small>días</small></div>' +
                '<div><strong>--</strong><small>horas</small></div>' +
                '<div><strong>--</strong><small>min</small></div>' +
                '<div><strong>--</strong><small>seg</small></div>' +
                '</div>' +
                (sig ? '<p class="b-examen-sig">Después: ' + sig.titulo.replace(/^Tema\s+\d+\s*:\s*/i, "") + ' · ' +
                    new Date(sig.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long" }) + '</p>' : "");

            caja.hidden = false;
            if (bento) bento.classList.remove("sin-examen");
            actualizarCuentas();

        }).catch(function () {
            caja.hidden = true;
            if (bento) bento.classList.add("sin-examen");
        });
    }


    /* Reto del día: una pregunta distinta cada día */

    var RETOS = [
        ["Si A es una matriz 2×3 y B es 3×4, ¿qué dimensión tiene A·B?", ["3×3", "2×4", "4×2", "No se pueden multiplicar"], 1,
         "Se multiplican filas de A por columnas de B: el resultado tiene las filas de A (2) y las columnas de B (4)."],
        ["¿Cuánto vale el determinante de la matriz (2 1 / 4 3)?", ["2", "10", "−2", "6"], 0,
         "2·3 − 1·4 = 6 − 4 = 2."],
        ["Una matriz cuadrada A tiene inversa si y solo si…", ["Es simétrica", "Su determinante es distinto de 0", "Tiene algún cero", "Su determinante es 1"], 1,
         "A es invertible ⇔ |A| ≠ 0. Si |A| = 0, la matriz es singular."],
        ["¿A qué es igual (A·B)ᵗ?", ["Aᵗ·Bᵗ", "Bᵗ·Aᵗ", "A·B", "(B·A)⁻¹"], 1,
         "La traspuesta de un producto invierte el orden: (A·B)ᵗ = Bᵗ·Aᵗ."],
        ["Un sistema con 3 incógnitas tiene rg(A) = rg(A*) = 2. ¿Cómo es?", ["Incompatible", "Compatible determinado", "Compatible indeterminado", "No se puede saber"], 2,
         "Por Rouché-Frobenius: rangos iguales ⇒ compatible; como 2 < 3 incógnitas, tiene infinitas soluciones."],
        ["En programación lineal, si la región factible está acotada, el óptimo se alcanza…", ["En el centro de la región", "En algún vértice de la región", "Siempre en el origen", "Fuera de la región"], 1,
         "La función objetivo alcanza su máximo y su mínimo en vértices de la región factible (o en todo un lado entre dos vértices)."],
        ["A y B son independientes, con P(A) = 0,5 y P(B) = 0,4. ¿Cuánto vale P(A∩B)?", ["0,9", "0,1", "0,2", "0,45"], 2,
         "Si son independientes, P(A∩B) = P(A)·P(B) = 0,5·0,4 = 0,2."],
        ["P(A) = 0,5, P(B) = 0,4 y P(A∩B) = 0,1. ¿Cuánto vale P(A∪B)?", ["0,9", "0,8", "1", "0,7"], 1,
         "P(A∪B) = P(A) + P(B) − P(A∩B) = 0,5 + 0,4 − 0,1 = 0,8."],
        ["¿Para qué sirve el teorema de Bayes?", ["Para sumar probabilidades incompatibles", "Para calcular la probabilidad de una causa sabiendo el resultado", "Para tipificar una normal", "Para calcular combinaciones"], 1,
         "Bayes calcula probabilidades «a posteriori»: P(causa | resultado observado)."],
        ["Si Z sigue una N(0, 1), ¿cuánto vale P(Z ≤ 0)?", ["0", "0,5", "1", "0,8413"], 1,
         "La normal es simétrica respecto de su media, 0: deja la mitad de la probabilidad a cada lado."],
        ["Lanzas una moneda dos veces. ¿Probabilidad de obtener al menos una cara?", ["1/2", "1/4", "3/4", "2/3"], 2,
         "Por el contrario: 1 − P(ninguna cara) = 1 − 1/4 = 3/4."],
        ["En una población N(μ, σ), la media muestral de muestras de tamaño n sigue…", ["N(μ, σ)", "N(μ, σ/√n)", "N(μ/n, σ)", "N(0, 1)"], 1,
         "La media muestral tiene la misma media μ y una desviación típica menor: σ/√n."],
        ["Con el mismo nivel de confianza, si aumentamos el tamaño de la muestra, el error máximo…", ["Aumenta", "Disminuye", "No cambia", "Se duplica"], 1,
         "E = z·σ/√n: al crecer n, el denominador crece y el error disminuye."],
        ["¿Qué valor crítico z(α/2) corresponde a un nivel de confianza del 95 %?", ["1,645", "1,96", "2,575", "0,95"], 1,
         "Con 95 % de confianza, α = 0,05 y deja 0,025 en cada cola: z = 1,96."],
        ["¿Cuánto vale el límite cuando x → ∞ de (3x² + 1)/(x² − 5)?", ["0", "∞", "3", "−1/5"], 2,
         "Mismo grado arriba y abajo: el límite es el cociente de los coeficientes principales, 3/1 = 3."],
        ["¿Cuál es la derivada de f(x) = x³?", ["3x²", "x²", "3x³", "x⁴/4"], 0,
         "Regla de la potencia: (xⁿ)' = n·xⁿ⁻¹, así que (x³)' = 3x²."],
        ["Si f'(a) = 0 y f''(a) > 0, en x = a la función tiene…", ["Un máximo relativo", "Un mínimo relativo", "Un punto de inflexión", "Una asíntota"], 1,
         "Derivada nula y segunda derivada positiva (curva cóncava hacia arriba): mínimo relativo."],
        ["¿Qué asíntota vertical tiene f(x) = 1/(x − 2)?", ["x = 0", "y = 2", "x = 2", "No tiene"], 2,
         "El denominador se anula en x = 2 y el numerador no: ahí la función tiende a ±∞."],
        ["¿Cuánto vale ∫ 2x dx?", ["2", "x² + C", "2x² + C", "x + C"], 1,
         "Una primitiva de 2x es x², porque (x²)' = 2x. No olvides la constante C."],
        ["¿Cuál es el área bajo f(x) = x entre x = 0 y x = 2?", ["1", "2", "4", "8"], 1,
         "∫₀² x dx = [x²/2]₀² = 4/2 − 0 = 2. Es un triángulo de base 2 y altura 2."],
        ["¿Cuál es la derivada de f(x) = e²ˣ?", ["e²ˣ", "2e²ˣ", "2x·e²ˣ", "e²ˣ/2"], 1,
         "Regla de la cadena: (eᵘ)' = u'·eᵘ, con u = 2x y u' = 2."],
        ["f es continua en [a, b] y f(a)·f(b) < 0. ¿Qué asegura el teorema de Bolzano?", ["Que f es derivable", "Que f tiene un máximo", "Que existe c en (a, b) con f(c) = 0", "Que f es creciente"], 2,
         "Si cambia de signo y es continua, la gráfica tiene que cortar al eje X entre a y b."],
        ["¿En qué valor de x tiene un mínimo f(x) = x² − 4x?", ["x = 0", "x = 4", "x = 2", "x = −2"], 2,
         "f'(x) = 2x − 4 = 0 ⇒ x = 2, y f''(x) = 2 > 0: es un mínimo (el vértice de la parábola)."],
        ["¿Cuál es la inversa de la matriz (1 0 / 0 2)?", ["(1 0 / 0 2)", "(1 0 / 0 1/2)", "(−1 0 / 0 −2)", "(0 1 / 2 0)"], 1,
         "Para una matriz diagonal, la inversa tiene en la diagonal los inversos: 1 y 1/2."]
    ];

    function retoDelDia() {

        var caja = document.getElementById("reto-dia");
        if (!caja) return;

        var hoy = new Date();
        var n = Math.floor((Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()) - Date.UTC(2026, 0, 1)) / 86400000);
        var reto = RETOS[((n % RETOS.length) + RETOS.length) % RETOS.length];
        var clave = hoyClave(hoy);

        var estado = {};
        try { estado = JSON.parse(leer("reto-web") || "{}") || {}; } catch (e) {}

        caja.innerHTML =
            '<p class="b-etiqueta">Reto del día <span class="reto-aciertos" hidden></span></p>' +
            '<p class="reto-pregunta"></p>' +
            '<div class="reto-opciones"></div>' +
            '<p class="reto-explicacion" hidden></p>';

        caja.querySelector(".reto-pregunta").textContent = reto[0];

        var opciones = caja.querySelector(".reto-opciones");
        reto[1].forEach(function (texto, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "reto-opcion";
            b.innerHTML = '<span class="reto-letra">' + "ABCD"[i] + '</span><span></span>';
            b.lastChild.textContent = texto;
            b.addEventListener("click", function () { responder(i, true); });
            opciones.appendChild(b);
        });

        function pintarAciertos() {
            var a = caja.querySelector(".reto-aciertos");
            if (estado.aciertos > 0) {
                a.hidden = false;
                a.textContent = "· " + estado.aciertos + (estado.aciertos === 1 ? " acierto" : " aciertos");
            }
        }

        function responder(i, nuevo) {
            var botones = opciones.querySelectorAll(".reto-opcion");
            botones.forEach(function (b, j) {
                b.disabled = true;
                if (j === reto[2]) b.classList.add("correcta");
                else if (j === i) b.classList.add("fallo");
            });
            var acierto = i === reto[2];
            var exp = caja.querySelector(".reto-explicacion");
            exp.hidden = false;
            exp.innerHTML = '<strong>' + (acierto ? "¡Correcto!" : "Casi…") + '</strong> ';
            exp.appendChild(document.createTextNode(reto[3]));
            caja.classList.add(acierto ? "acertado" : "fallado");

            if (nuevo) {
                estado.aciertos = (estado.aciertos || 0) + (acierto ? 1 : 0);
                estado.dia = clave;
                estado.elegida = i;
                guardar("reto-web", JSON.stringify(estado));
            }
            pintarAciertos();
        }

        pintarAciertos();
        if (estado.dia === clave && typeof estado.elegida === "number") responder(estado.elegida, false);
    }


    /* Calculadora de nota PAU (reglas de Andalucía) */

    var calculadora = null;

    function numero(v) {
        if (v === "" || v === null || v === undefined) return null;
        var n = parseFloat(String(v).replace(",", "."));
        return isNaN(n) ? null : Math.max(0, Math.min(10, n));
    }

    function f3(n) {
        return n.toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }

    function crearCalculadora() {

        calculadora = document.createElement("div");
        calculadora.className = "buscador calc-pau";
        calculadora.setAttribute("role", "dialog");
        calculadora.setAttribute("aria-modal", "true");
        calculadora.setAttribute("aria-label", "Calculadora de nota PAU");

        function campo(id, etiqueta, extra) {
            return '<label class="cp-campo"><span>' + etiqueta + '</span>' +
                '<input id="' + id + '" type="text" inputmode="decimal" placeholder="0,00" autocomplete="off">' + (extra || "") + '</label>';
        }

        function peso(id, def) {
            return '<select id="' + id + '" aria-label="Ponderación">' +
                '<option value="0"' + (def === 0 ? " selected" : "") + '>No pondera</option>' +
                '<option value="0.1"' + (def === 0.1 ? " selected" : "") + '>× 0,1</option>' +
                '<option value="0.2"' + (def === 0.2 ? " selected" : "") + '>× 0,2</option></select>';
        }

        calculadora.innerHTML =
            '<div class="buscador-fondo"></div>' +
            '<div class="buscador-caja cp-caja">' +
            '<div class="cp-cabecera"><div><p class="b-etiqueta">PAU · Andalucía</p><h2>Calcula tu nota</h2></div>' +
            '<button type="button" class="cp-cerrar" aria-label="Cerrar">×</button></div>' +
            '<div class="cp-cuerpo">' +
            '<section><h3>1 · Bachillerato</h3>' + campo("cp-bach", "Nota media de Bachillerato") + '</section>' +
            '<section><h3>2 · Fase de acceso</h3><div class="cp-rejilla">' +
            campo("cp-lengua", "Lengua Castellana y Literatura II") +
            campo("cp-historia", "Historia de España o Filosofía") +
            campo("cp-idioma", "Lengua extranjera II") +
            campo("cp-mates", "Matemáticas Aplicadas a las CCSS II") +
            '</div></section>' +
            '<section><h3>3 · Fase de admisión <small>(opcional)</small></h3>' +
            '<p class="cp-ayuda">Cuentan como mucho las dos materias que más sumen, aprobadas con un 5 o más. Las ponderaciones de cada grado están en «Información PAU».</p>' +
            '<div class="cp-fila"><span>Matemáticas CCSS II (de la fase de acceso)</span>' + peso("cp-pm", 0.2) + '</div>' +
            '<div class="cp-fila">' + campo("cp-m1", "Otra materia") + peso("cp-p1", 0.2) + '</div>' +
            '<div class="cp-fila">' + campo("cp-m2", "Otra materia") + peso("cp-p2", 0.1) + '</div>' +
            '</section>' +
            '</div>' +
            '<div class="cp-resultado">' +
            '<div class="cp-nota"><small>Nota de acceso</small><strong id="cp-acceso">—</strong><span>sobre 10</span></div>' +
            '<div class="cp-nota cp-nota-adm"><small>Nota de admisión</small><strong id="cp-admision">—</strong><span>sobre 14</span></div>' +
            '<p class="cp-mensaje" id="cp-mensaje">Rellena tus notas para ver el resultado.</p>' +
            '</div>' +
            '<p class="cp-aviso">Cálculo orientativo: 60 % media de Bachillerato + 40 % fase de acceso (mínimo 4); la nota de acceso debe llegar a 5. Admisión: + hasta dos materias × 0,1 o 0,2.</p>' +
            '</div>';

        document.body.appendChild(calculadora);

        var ids = ["cp-bach", "cp-lengua", "cp-historia", "cp-idioma", "cp-mates", "cp-m1", "cp-m2", "cp-pm", "cp-p1", "cp-p2"];
        var guardado = {};
        try { guardado = JSON.parse(leer("calc-pau") || "{}") || {}; } catch (e) {}
        ids.forEach(function (id) {
            var el = calculadora.querySelector("#" + id);
            if (guardado[id] !== undefined) el.value = guardado[id];
            el.addEventListener("input", calcular);
            el.addEventListener("change", calcular);
        });

        function v(id) { return calculadora.querySelector("#" + id).value; }

        function calcular() {

            var datos = {};
            ids.forEach(function (id) { datos[id] = v(id); });
            guardar("calc-pau", JSON.stringify(datos));

            var bach = numero(v("cp-bach"));
            var ex = ["cp-lengua", "cp-historia", "cp-idioma", "cp-mates"].map(function (id) { return numero(v(id)); });
            var acc = calculadora.querySelector("#cp-acceso");
            var adm = calculadora.querySelector("#cp-admision");
            var msg = calculadora.querySelector("#cp-mensaje");
            var res = calculadora.querySelector(".cp-resultado");

            res.classList.remove("ok", "mal");

            if (bach === null || ex.some(function (n) { return n === null; })) {
                acc.textContent = "—";
                adm.textContent = "—";
                msg.textContent = "Rellena la media de Bachillerato y las cuatro notas de la fase de acceso.";
                return;
            }

            var fase = Math.round((ex[0] + ex[1] + ex[2] + ex[3]) / 4 * 1000) / 1000;
            var acceso = 0.6 * bach + 0.4 * fase;

            acc.textContent = f3(acceso);

            if (fase < 4) {
                adm.textContent = "—";
                msg.textContent = "La fase de acceso sale " + f3(fase) + ": necesitas al menos un 4 de media en los cuatro exámenes.";
                res.classList.add("mal");
                return;
            }

            if (acceso < 5) {
                adm.textContent = "—";
                msg.textContent = "La nota de acceso no llega a 5. Fase de acceso: " + f3(fase) + ".";
                res.classList.add("mal");
                return;
            }

            var candidatas = [
                { n: ex[3], p: +v("cp-pm") },
                { n: numero(v("cp-m1")), p: +v("cp-p1") },
                { n: numero(v("cp-m2")), p: +v("cp-p2") }
            ].filter(function (c) { return c.n !== null && c.n >= 5 && c.p > 0; })
             .map(function (c) { return c.n * c.p; })
             .sort(function (a, b) { return b - a; })
             .slice(0, 2);

            var extra = candidatas.reduce(function (s, x) { return s + x; }, 0);

            adm.textContent = f3(acceso + extra);
            msg.textContent = "¡Aprobada! Fase de acceso: " + f3(fase) +
                (extra > 0 ? " · La fase de admisión suma " + f3(extra) + " puntos." : " · Añade materias de admisión para subir hasta 14.");
            res.classList.add("ok");
        }

        calculadora.querySelector(".buscador-fondo").addEventListener("click", cerrarCalculadora);
        calculadora.querySelector(".cp-cerrar").addEventListener("click", cerrarCalculadora);
        calculadora.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarCalculadora(); });

        calcular();
    }

    function abrirCalculadora() {
        if (!calculadora) crearCalculadora();
        calculadora.classList.add("abierto");
        document.documentElement.classList.add("sin-scroll");
        setTimeout(function () { var c = calculadora.querySelector("input"); if (c && !c.value) c.focus(); }, 40);
    }

    function cerrarCalculadora() {
        if (!calculadora) return;
        calculadora.classList.remove("abierto");
        document.documentElement.classList.remove("sin-scroll");
    }


    /* =====================================================
       ARRANQUE
    ===================================================== */

    document.addEventListener("DOMContentLoaded", function () {

        if (pagina === "inicio") {
            saludoYRacha();
            proximoExamen();
            retoDelDia();
            var bc = document.getElementById("abrir-calculadora");
            if (bc) bc.addEventListener("click", abrirCalculadora);
        }

        botonArriba();
        abrirApartado();
        prepararAparicion();

        /* Las tarjetas que llegan más tarde (menú, noticias…) también aparecen */
        setTimeout(prepararAparicion, 600);
    });

})();
