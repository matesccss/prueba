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
        if (meta) meta.setAttribute("content", tema === "noche" ? "#070b16" : "#14213d");
    }

    aplicarTema(leer("tema-web") === "claro" ? "claro" : "noche");

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
        ".aviso-examen, .curiosidades, .game-card, .examen-prox, .tema, .recurso";

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
        ".pau-card, .proximos, .tema-header, .btn-tema, .aviso-examen, .curiosidades, " +
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
       ARRANQUE
    ===================================================== */

    document.addEventListener("DOMContentLoaded", function () {

        if (pagina === "inicio") {
            dibujarCurva();
            proximosExamenes();
        }

        botonArriba();
        abrirApartado();
        prepararAparicion();

        /* Las tarjetas que llegan más tarde (menú, noticias…) también aparecen */
        setTimeout(prepararAparicion, 600);
    });

})();
