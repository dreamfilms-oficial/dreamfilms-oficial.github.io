/* =====================================================================
   Lógica de la web. No hace falta tocar este archivo para cambiar
   textos o proyectos: eso se hace en contenido.js
   ===================================================================== */
(function () {
  "use strict";

  const C = window.CONTENIDO || {};
  const FOTOS = window.FOTOS || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilidades ------------------------------------------- */
  const esc = (t) => String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const lleno = (v) => v != null && String(v).trim() !== "";
  const slug = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "x";
  const dos = (n) => String(n).padStart(2, "0");
  const pendiente = (texto, etiqueta = "span") => `<${etiqueta} class="pendiente">${esc(texto)}</${etiqueta}>`;

  // Entiende enlaces de YouTube y Vimeo tal cual se copian del navegador
  // También acepta { enlace: "...", vertical: true } para vídeos 9:16
  function leerVideo(entrada) {
    if (entrada && typeof entrada === "object") {
      const v = leerVideo(entrada.enlace);
      if (v && entrada.vertical) v.vertical = true;
      return v;
    }
    let url = entrada;
    if (!lleno(url)) return null;
    url = String(url).trim();
    let m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?(?:.*&)?id=)([\w-]{20,})/i);
    if (m) return { tipo: "drive", id: m[1] };
    m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i);
    if (m) return { tipo: "youtube", id: m[1] };
    m = url.match(/vimeo\.com\/(?:.*?\/)?(?:video\/)?(\d+)(?:\/([\da-f]+))?(?:.*?[?&]h=([\da-f]+))?/i);
    if (m) return { tipo: "vimeo", id: m[1], hash: m[2] || m[3] || "" };
    return null;
  }
  function urlInsertado(v, { fondo = false } = {}) {
    if (v.tipo === "drive") return `https://drive.google.com/file/d/${v.id}/preview`;
    if (v.tipo === "youtube") {
      const p = fondo
        ? `autoplay=1&mute=1&loop=1&playlist=${v.id}&controls=0&disablekb=1&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1`
        : `autoplay=1&playsinline=1&rel=0&modestbranding=1`;
      return `https://www.youtube-nocookie.com/embed/${v.id}?${p}`;
    }
    const h = v.hash ? `h=${v.hash}&` : "";
    const p = fondo ? "background=1&autoplay=1&muted=1&loop=1" : "autoplay=1&title=0&byline=0&portrait=0";
    return `https://player.vimeo.com/video/${v.id}?${h}${p}&dnt=1`;
  }
  const miniaturaYoutube = (id, calidad = "maxresdefault") => `https://i.ytimg.com/vi/${id}/${calidad}.jpg`;
  const cacheVimeo = {};
  function miniaturaVimeo(v) {
    const url = `https://vimeo.com/${v.id}${v.hash ? "/" + v.hash : ""}`;
    return cacheVimeo[url] || (cacheVimeo[url] = fetch(`https://vimeo.com/api/oembed.json?width=1920&url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && d.thumbnail_url) || null)
      .catch(() => null));
  }
  // Rellena los huecos marcados con data-vimeo con la miniatura del vídeo
  function rellenarVimeo(raiz) {
    $$("[data-vimeo]", raiz).forEach((el) => {
      miniaturaVimeo(JSON.parse(el.dataset.vimeo)).then((src) => {
        if (!src || !el.isConnected) return;
        const img = document.createElement("img");
        img.src = src; img.alt = ""; img.loading = "lazy";
        el.replaceWith(img);
      });
    });
  }

  // Fotos ya preparadas (fotos.js) de una carpeta
  const fotosDe = (carpeta) => (lleno(carpeta) && FOTOS[carpeta]) || [];
  function imagen(foto, { sizes = "100vw", alt = "", perezosa = true, clase = "" } = {}) {
    const srcset = foto.src.map(([f, w]) => `${f} ${w}w`).join(", ");
    const media = foto.src[Math.min(1, foto.src.length - 1)][0];
    return `<img src="${esc(media)}" srcset="${esc(srcset)}" sizes="${sizes}" width="${foto.w}" height="${foto.h}"` +
      ` alt="${esc(alt)}"${perezosa ? ' loading="lazy"' : ""} decoding="async"${clase ? ` class="${clase}"` : ""}>`;
  }
  function fotoWeb(nombre) {
    return fotosDe("_web").find((f) => slug(f.archivo.replace(/\.[^.]+$/, "")) === nombre) || null;
  }

  /* ---------- Datos: proyectos numerados --------------------------- */
  const secciones = (C.secciones || []).map((s, i) => ({ ...s, slug: "seccion-" + slug(s.titulo || "seccion-" + (i + 1)) }));
  const proyectos = [];
  const usados = {};
  secciones.forEach((s) => {
    s.lista = (s.proyectos || []).map((p) => {
      let id = slug(p.titulo || "proyecto");
      if (usados[id]) id += "-" + (++usados[id]); else usados[id] = 1;
      const fotos = fotosDe(p.carpeta);
      const videos = (p.videos || []).map(leerVideo).filter(Boolean);
      let portada = fotos[0] || null;
      if (lleno(p.portada)) portada = fotos.find((f) => f.archivo === p.portada) || portada;
      const item = { ...p, id, seccion: s, fotos, videos, portada, n: proyectos.length + 1 };
      proyectos.push(item);
      return item;
    });
  });

  /* ---------- Aviso de huecos pendientes --------------------------- */
  function avisoBorrador() {
    const faltan = [];
    if (!(C.sobreMi || []).some(lleno)) faltan.push("texto de «Sobre mí»");
    if (!fotoWeb("sobre-mi")) faltan.push("foto de «Sobre mí»");
    if (!lleno(C.correo)) faltan.push("correo");
    if (!lleno(C.instagram)) faltan.push("Instagram");
    if (!fotoWeb("compartir") && !fotoWeb("portada")) faltan.push("imagen para compartir");
    if (!proyectos.length) faltan.push("secciones y proyectos");
    const incompletos = proyectos.filter((p) => !lleno(p.titulo) || !lleno(p.papel) || (!p.fotos.length && !p.videos.length));
    if (incompletos.length) faltan.push(`datos en ${incompletos.length} proyecto(s)`);
    const sinFotos = proyectos.filter((p) => lleno(p.carpeta) && !p.fotos.length);
    if (sinFotos.length) faltan.push(`fotos de: ${sinFotos.map((p) => p.carpeta).join(", ")} (¿falta ejecutar preparar-fotos?)`);
    if (!faltan.length) return;
    const el = $("#borrador");
    el.innerHTML = `<button type="button" aria-label="Ocultar aviso">×</button><strong>BORRADOR</strong> · Falta: ${esc(faltan.join(" · "))}`;
    el.hidden = false;
    $("button", el).addEventListener("click", () => (el.hidden = true));
  }

  /* ---------- Cabecera, portada y textos fijos --------------------- */
  function pintarTextos() {
    const nombre = lleno(C.nombre) ? C.nombre : "";
    const marca = lleno(C.marca) ? C.marca : nombre;
    $$("[data-marca]").forEach((el) => (el.textContent = marca));
    $$("[data-nombre]").forEach((el) => (el.textContent = nombre));
    $$("[data-profesion]").forEach((el) => (el.textContent = C.profesion || ""));
    $("#anio").textContent = new Date().getFullYear();
    if (lleno(C.productora)) {
      $$("[data-productora]").forEach((el) => { el.textContent = " · " + C.productora; });
      if (lleno(C.logo)) {
        const marcaCab = $(".cabecera__marca");
        marcaCab.insertAdjacentHTML("afterbegin", `<img class="cabecera__logo" src="${esc(C.logo)}" alt="${esc(C.productora)}" width="72" height="32">`);
      }
    }

    // Título de la portada, letra a letra
    const titulo = $("#portadaTitulo");
    let retraso = 0.9;
    titulo.innerHTML = marca.split(" ").map((palabra) =>
      `<span class="palabra">${Array.from(palabra).map((l) => {
        retraso += 0.045;
        return `<span class="letra" style="animation-delay:${retraso.toFixed(3)}s">${esc(l)}</span>`;
      }).join("")}</span>`).join(" ");
    titulo.setAttribute("aria-label", marca);
    const subtitulo = lleno(C.marca) && C.marca !== nombre ? nombre : (C.productora || "");
    if (lleno(subtitulo)) {
      const sub = $("#portadaSubtitulo");
      sub.textContent = subtitulo;
      sub.hidden = false;
    }
  }

  function pintarPortada() {
    const fondo = $("#portadaFondo");
    const poster = fotoWeb("portada");
    if (poster) fondo.innerHTML = imagen(poster, { perezosa: false, alt: "" });
    // Collage solo para móvil en vertical (fotos de fotos/_portada-movil/)
    const collage = fotosDe("_portada-movil");
    if (collage.length) {
      fondo.insertAdjacentHTML("beforeend", `<div class="collage" aria-hidden="true">${collage.map((f, i) =>
        `<div class="collage__pieza" style="--i:${i}">${imagen(f, { sizes: i === 0 ? "100vw" : "50vw", alt: "", perezosa: false })}</div>`).join("")}</div>`);
    }

    const reel = leerVideo(C.showreel);
    const boton = $("#botonReel");
    if (!reel) {
      // Sin showreel: la portada invita directamente a bajar a las fotos
      boton.remove();
      return;
    }
    boton.addEventListener("click", () => abrirVisor([{ video: reel }], 0, boton));

    const ahorro = navigator.connection && navigator.connection.saveData;
    if (movimientoReducido || ahorro || reel.tipo === "drive") return;
    const iframe = document.createElement("iframe");
    iframe.src = urlInsertado(reel, { fondo: true });
    iframe.title = "Showreel";
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    iframe.setAttribute("tabindex", "-1");
    iframe.setAttribute("aria-hidden", "true");
    // Esperamos un poco tras cargar para que no se vean los rótulos del reproductor
    iframe.addEventListener("load", () => setTimeout(() => iframe.classList.add("visible"), 2200));
    fondo.appendChild(iframe);
  }

  /* ---------- Proyectos -------------------------------------------- */
  // Portada propia para los vídeos (en vez de la miniatura de YouTube)
  // Estilo «visor de cámara»: fotograma del vídeo en blanco/negro y rojo,
  // esquinas de encuadre, REC parpadeando y código de tiempo.
  function cartel(p, k = 0, video = null) {
    const v = video || p.videos[0];
    const etiqueta = p.cliente || (p.seccion && p.seccion.titulo) || "Vídeo";
    const semilla = (p.n || 1) * 7 + k * 13;
    const tc = `${dos(semilla % 3)}:${dos((semilla * 5) % 60)}:${dos((semilla * 11) % 60)}:${dos((semilla * 3) % 25)}`;
    // Fondo: una foto propia si el proyecto la indica (fondo: "carpeta/archivo"),
    // si no, el fotograma de YouTube
    const [fc, fa] = lleno(p.fondo) ? String(p.fondo).split("/") : [];
    const propia = fc && fotosDe(fc).find((f) => f.archivo === fa);
    const fondo = propia
      ? imagen(propia, { sizes: "(max-width: 760px) 100vw, 40vw", alt: "", clase: "cartel__fondo cartel__fondo--propia" })
      : v && v.tipo === "youtube"
        ? `<img class="cartel__fondo" src="${miniaturaYoutube(v.id)}" alt="" loading="lazy" data-yt="${v.id}">` : "";
    return `<div class="cartel" aria-hidden="true">${fondo}
      <span class="cartel__velo"></span>
      <span class="cartel__esquinas"><i></i><i></i><i></i><i></i></span>
      <span class="cartel__barrido"></span>
      <span class="cartel__arriba"><span class="cartel__rec">REC</span><span class="cartel__tc">${tc}</span></span>
      <span class="cartel__centro">
        <span class="cartel__etiqueta">${esc(etiqueta)}</span>
        <span class="cartel__titulo">${esc(p.titulo || "")}</span>
      </span>
      <span class="cartel__abajo"><span>4K · 25 FPS</span><span class="cartel__play"></span></span></div>`;
  }
  function portadaTarjeta(p, k = 0) {
    if (p.portada) {
      const foto = imagen(p.portada, { sizes: "(max-width: 760px) 100vw, 60vw", alt: p.titulo || "" });
      const q = p.portadilla;
      if (!q) return foto;
      return foto + `<div class="revista" aria-hidden="true">
        <span class="revista__etiqueta">${esc(q.etiqueta || "")}</span>
        <span class="revista__titulo">${esc(q.titulo || p.titulo || "")}</span>
        <span class="revista__sub">${esc(q.sub || "")}</span></div>`;
    }
    if (p.videos.length) return cartel(p, k);
    return `<div class="sin-foto">${pendiente("fotos o vídeo del proyecto")}</div>`;
  }
  // La tarjeta toma la forma de su foto, así no se recorta nada
  function formaTarjeta(p) {
    if (!p.portada) return { estilo: "", clase: "" };
    const { w, h } = p.portada;
    return { estilo: ` style="aspect-ratio:${w} / ${h}"`, clase: h > w ? " tarjeta--vertical" : " tarjeta--horizontal" };
  }

  function pintarProyectos() {
    const lista = $("#listaSecciones");
    const filtros = $("#filtros");

    if (!secciones.length) {
      lista.innerHTML = `
        <div class="seccion">
          <div class="seccion__cabecera"><span class="seccion__numero">01</span>
            <h3 class="seccion__titulo">${pendiente("nombre de la sección")}</h3></div>
          <div class="rejilla">${[1, 2, 3, 4].map(() => `
            <article class="tarjeta tarjeta--vacia">
              <div class="tarjeta__imagen">${pendiente("proyecto: título, cliente, año, tu papel y fotos o vídeo", "p")}</div>
            </article>`).join("")}
          </div>
        </div>`;
      return;
    }

    if (secciones.length > 1) {
      filtros.innerHTML = secciones.map((s) => `<a href="#${s.slug}">${esc(s.titulo || "Sección")}</a>`).join("");
    }

    lista.innerHTML = secciones.map((s, i) => `
      <section class="seccion" id="${s.slug}" aria-labelledby="${s.slug}-t">
        <header class="seccion__cabecera revelar">
          <span class="seccion__numero">${dos(i + 1)}</span>
          <h3 class="seccion__titulo" id="${s.slug}-t">${lleno(s.titulo) ? esc(s.titulo) : pendiente("nombre de la sección")}</h3>
          <span class="seccion__cuenta">${s.lista.length} ${s.lista.length === 1 ? "proyecto" : "proyectos"}</span>
        </header>
        <div class="rejilla${s.tipo === "videos" ? " rejilla--videos" : ""}">
          ${s.lista.map((p, k) => { const f = s.tipo === "videos" ? { estilo: "", clase: "" } : formaTarjeta(p); return `
            <article class="tarjeta${f.clase}${p.portadilla ? " tarjeta--revista" : ""}">
              <a class="tarjeta__enlace" href="#proyecto/${p.id}">
                <div class="tarjeta__imagen"${f.estilo}>
                  ${portadaTarjeta(p, k)}
                  <span class="tarjeta__ver">Ver proyecto</span>
                  ${p.videos.length ? `<span class="tarjeta__icono-video">▶ Vídeo</span>` : ""}
                </div>
                <div class="tarjeta__info">
                  <span class="tarjeta__num">${dos(p.n)}</span>
                  <div>
                    <h4 class="tarjeta__titulo">${lleno(p.titulo) ? esc(p.titulo) : pendiente("título")}</h4>
                    <p class="tarjeta__meta">${[p.cliente, p.año].filter(lleno).map(esc).join(" · ")}</p>
                  </div>
                </div>
              </a>
            </article>`; }).join("")}
        </div>
      </section>`).join("");
    rellenarVimeo(lista);
    arreglarYt(lista);
  }

  /* ---------- Ventana de proyecto ---------------------------------- */
  const ventana = $("#ventanaProyecto");
  const panel = $("#proyectoPanel");
  let abiertoConClic = false;
  let focoPrevio = null;
  let cierreVentana = null;

  function htmlVideo(v, poster, p, k = 0) {
    let fondo = "";
    if (poster) {
      fondo = imagen(poster, { alt: "" });
    } else if (p) {
      const copia = { ...p, titulo: p.videos.length > 1 ? `${p.titulo} · ${k + 1}` : p.titulo };
      fondo = cartel(copia, k, v);
    } else if (v.tipo === "youtube") {
      fondo = `<img src="${miniaturaYoutube(v.id)}" alt="" loading="lazy" data-yt="${v.id}">`;
    } else {
      fondo = `<span data-vimeo="${esc(JSON.stringify(v))}"></span>`;
    }
    return `<div class="video${v.vertical ? " video--vertical" : ""}" role="button" tabindex="0" aria-label="Reproducir vídeo" data-video="${esc(JSON.stringify(v))}">
      ${fondo}<span class="video__play" aria-hidden="true"></span></div>`;
  }

  function htmlFicha(p) {
    const i = proyectos.indexOf(p);
    const ant = proyectos[(i - 1 + proyectos.length) % proyectos.length];
    const sig = proyectos[(i + 1) % proyectos.length];
    const dato = (titulo, valor, opcional = false) => lleno(valor)
      ? `<div><dt>${titulo}</dt><dd>${esc(valor)}</dd></div>`
      : (opcional ? "" : `<div><dt>${titulo}</dt><dd>${pendiente(titulo.toLowerCase())}</dd></div>`);
    const columnas = p.fotos.length === 1 ? 1 : p.fotos.length >= 5 ? 3 : 2;
    const sizes = columnas === 1 ? "100vw" : columnas === 3 ? "(min-width: 1100px) 33vw, (min-width: 560px) 50vw, 100vw" : "(min-width: 560px) 50vw, 100vw";
    return `
      <article class="ficha">
        <p class="etiqueta ficha__seccion">${esc(p.seccion.titulo || "")} · ${dos(p.n)}</p>
        <h2 class="ficha__titulo" id="proyectoTitulo">${lleno(p.titulo) ? esc(p.titulo) : pendiente("título")}</h2>
        <dl class="ficha__datos">${dato("Cliente", p.cliente, true)}${dato("Año", p.año, true)}${dato("Papel", p.papel)}</dl>
        ${lleno(p.descripcion) ? `<p class="ficha__descripcion">${esc(p.descripcion)}</p>` : ""}
        ${p.videos.length ? `<div class="ficha__videos">${p.videos.map((v, k) => htmlVideo(v, p.portada, p, k)).join("")}</div>` : ""}
        ${p.fotos.length ? `<div class="galeria galeria--${columnas}">${p.fotos.map((f, k) =>
          `<button type="button" data-foto="${k}" aria-label="Ampliar foto ${k + 1} de ${p.fotos.length}">${imagen(f, { sizes, alt: `${p.titulo || ""} — foto ${k + 1}` })}</button>`).join("")}</div>` : ""}
        ${!p.fotos.length && !p.videos.length ? pendiente("fotos o vídeo del proyecto", "p") : ""}
        ${proyectos.length > 1 ? `
        <nav class="ficha__navegacion" aria-label="Otros proyectos">
          <a href="#proyecto/${ant.id}"><small>← Anterior</small><span>${esc(ant.titulo || "Proyecto")}</span></a>
          <a href="#proyecto/${sig.id}"><small>Siguiente →</small><span>${esc(sig.titulo || "Proyecto")}</span></a>
        </nav>` : ""}
      </article>`;
  }

  function activarVideo(el) {
    const v = JSON.parse(el.dataset.video);
    el.innerHTML = `<iframe src="${urlInsertado(v)}" title="Vídeo" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    el.removeAttribute("role");
    el.removeAttribute("tabindex");
  }
  function arreglarYt(raiz) {
    $$("[data-yt]", raiz).forEach((img) => {
      // YouTube devuelve una imagen gris de 120 px si no hay miniatura grande
      const revisar = () => {
        if (img.naturalWidth && img.naturalWidth <= 120) { img.src = miniaturaYoutube(img.dataset.yt, "sddefault"); img.classList.add("baja"); }
      };
      if (img.complete) revisar();
      img.addEventListener("load", revisar);
      img.addEventListener("error", () => (img.src = miniaturaYoutube(img.dataset.yt, "hqdefault")));
    });
  }
  function prepararVideos(raiz) {
    rellenarVimeo(raiz);
    arreglarYt(raiz);
    $$(".video[data-video]", raiz).forEach((el) => {
      el.addEventListener("click", () => activarVideo(el), { once: true });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activarVideo(el); } });
    });
  }

  function abrirProyecto(p) {
    clearTimeout(cierreVentana);
    const contenido = $("#proyectoContenido");
    contenido.innerHTML = htmlFicha(p);
    prepararVideos(contenido);
    $$(".galeria img", contenido).forEach((img) => {
      if (img.complete) img.classList.add("cargada");
      else img.addEventListener("load", () => img.classList.add("cargada"));
    });
    $$(".galeria button", contenido).forEach((b) => b.addEventListener("click", () => {
      abrirVisor(p.fotos.map((f) => ({ foto: f, alt: p.titulo })), Number(b.dataset.foto), b);
    }));
    panel.scrollTop = 0;
    if (ventana.hidden) {
      focoPrevio = document.activeElement;
      ventana.hidden = false;
      document.body.classList.add("bloqueado");
      requestAnimationFrame(() => requestAnimationFrame(() => ventana.classList.add("abierto")));
    }
    document.title = `${p.titulo || "Proyecto"} · ${C.nombre || ""}`;
    panel.focus({ preventScroll: true });
  }

  function cerrarProyecto() {
    if (ventana.hidden) return;
    ventana.classList.remove("abierto");
    document.body.classList.remove("bloqueado");
    document.title = tituloOriginal;
    cierreVentana = setTimeout(() => {
      ventana.hidden = true;
      $("#proyectoContenido").innerHTML = "";
    }, 550);
    if (focoPrevio) focoPrevio.focus({ preventScroll: true });
  }

  function pedirCierre() {
    if (abiertoConClic) { history.back(); return; }
    history.replaceState(null, "", location.pathname + location.search + "#proyectos");
    cerrarProyecto();
  }

  function segunHash() {
    const m = location.hash.match(/^#proyecto\/(.+)$/);
    const p = m && proyectos.find((x) => x.id === decodeURIComponent(m[1]));
    if (p) abrirProyecto(p);
    else { cerrarProyecto(); abiertoConClic = false; }
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#proyecto/"]');
    if (!a || e.metaKey || e.ctrlKey) return;
    if (a.closest(".ficha")) {
      // Anterior/siguiente: sustituye la entrada del historial
      e.preventDefault();
      history.replaceState(null, "", a.getAttribute("href"));
      segunHash();
    } else {
      abiertoConClic = true;
    }
  });
  $("[data-cerrar]", ventana).addEventListener("click", pedirCierre);
  window.addEventListener("hashchange", segunHash);

  /* ---------- Visor a pantalla completa ---------------------------- */
  const visor = $("#visor");
  const escena = $("#visorEscena");
  let elementos = [];
  let actual = 0;
  let focoVisor = null;

  function mostrar(i, dir = 0) {
    actual = (i + elementos.length) % elementos.length;
    escena.classList.remove("desde-izq", "sin-dir");
    if (dir < 0) escena.classList.add("desde-izq");
    else if (dir === 0) escena.classList.add("sin-dir");
    const e = elementos[actual];
    if (e.video) {
      escena.innerHTML = `<div class="video${e.video.vertical ? " video--vertical" : ""}"><iframe src="${urlInsertado(e.video)}" title="Vídeo" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
    } else {
      escena.innerHTML = imagen(e.foto, { sizes: "100vw", alt: e.alt || "", perezosa: false });
    }
    const varios = elementos.length > 1;
    $("[data-visor-ant]", visor).hidden = !varios;
    $("[data-visor-sig]", visor).hidden = !varios;
    $("#visorContador").textContent = varios ? `${actual + 1} / ${elementos.length}` : "";
    // Precarga de la siguiente
    const sig = elementos[(actual + 1) % elementos.length];
    if (varios && sig.foto) { const im = new Image(); im.sizes = "100vw"; im.srcset = sig.foto.src.map(([f, w]) => `${f} ${w}w`).join(", "); }
  }
  function abrirVisor(lista, i, desde) {
    elementos = lista;
    focoVisor = desde || document.activeElement;
    visor.hidden = false;
    document.body.classList.add("bloqueado");
    mostrar(i);
    requestAnimationFrame(() => requestAnimationFrame(() => visor.classList.add("abierto")));
    $("[data-cerrar-visor]", visor).focus({ preventScroll: true });
  }
  function cerrarVisor() {
    visor.classList.remove("abierto");
    setTimeout(() => { visor.hidden = true; escena.innerHTML = ""; }, 350);
    if (ventana.hidden) document.body.classList.remove("bloqueado");
    if (focoVisor) focoVisor.focus({ preventScroll: true });
  }
  $("[data-cerrar-visor]", visor).addEventListener("click", cerrarVisor);
  $("[data-visor-ant]", visor).addEventListener("click", () => mostrar(actual - 1, -1));
  $("[data-visor-sig]", visor).addEventListener("click", () => mostrar(actual + 1, 1));
  visor.addEventListener("click", (e) => { if (e.target === visor || e.target === escena) cerrarVisor(); });
  let toqueX = null;
  visor.addEventListener("touchstart", (e) => { toqueX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  visor.addEventListener("touchend", (e) => {
    if (toqueX == null || elementos.length < 2) return;
    const dx = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    toqueX = null;
  });

  /* ---------- Teclado y foco --------------------------------------- */
  function atraparFoco(e, raiz) {
    const f = $$('a[href], button:not([hidden]), iframe, [tabindex]:not([tabindex="-1"])', raiz).filter((x) => x.offsetParent !== null || x === document.activeElement);
    if (!f.length) return;
    const primero = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  }
  document.addEventListener("keydown", (e) => {
    if (!visor.hidden) {
      if (e.key === "Escape") cerrarVisor();
      else if (e.key === "ArrowRight") mostrar(actual + 1, 1);
      else if (e.key === "ArrowLeft") mostrar(actual - 1, -1);
      else if (e.key === "Tab") atraparFoco(e, visor);
    } else if (!ventana.hidden) {
      if (e.key === "Escape") pedirCierre();
      else if (e.key === "Tab") atraparFoco(e, ventana);
    }
  });

  /* ---------- Próximamente: cortometrajes -------------------------- */
  function pintarProximamente() {
    const P = C.proximamente;
    const el = $("#cortometrajes");
    if (!P || !lleno(P.titulo)) return;
    el.innerHTML = `
      <div class="proximo__lider" aria-hidden="true">
        <span class="proximo__aguja"></span>
        <span class="proximo__cruz"></span>
        <span class="proximo__num">3</span><span class="proximo__num">2</span><span class="proximo__num">1</span><span class="proximo__num">?</span>
      </div>
      <div class="proximo__texto">
        <p class="etiqueta revelar">${esc(P.etiqueta || "Próximamente")}</p>
        <h2 class="proximo__titulo revelar" id="tituloProximo">${esc(P.titulo)} <span class="proximo__pregunta" aria-label="(próximamente)">¿?</span></h2>
        ${lleno(P.texto) ? `<p class="proximo__frase revelar">${esc(P.texto)}</p>` : ""}
        ${lleno(C.logo) ? `<img class="proximo__logo revelar" src="${esc(C.logo)}" alt="${esc(C.productora || "")}" width="200" height="90" loading="lazy">` : ""}
      </div>`;
    el.hidden = false;
  }

  /* ---------- Animación al pulsar ---------------------------------- */
  function ondasAlPulsar() {
    if (movimientoReducido) return;
    document.addEventListener("pointerdown", (e) => {
      const t = e.target.closest("a, button, .video[data-video], .galeria button");
      if (!t) return;
      const o = document.createElement("span");
      o.className = "onda";
      o.style.left = e.clientX + "px";
      o.style.top = e.clientY + "px";
      document.body.appendChild(o);
      o.addEventListener("animationend", () => o.remove());
    }, { passive: true });
  }

  /* ---------- Sobre mí y contacto ---------------------------------- */
  function pintarSobreMi() {
    const foto = fotoWeb("sobre-mi");
    $("#sobreFoto").innerHTML = foto
      ? imagen(foto, { sizes: "(max-width: 860px) 90vw, 40vw", alt: C.nombre || "" })
      : pendiente("tu foto (fotos/_web/sobre-mi.jpg)", "div");
    const parrafos = (C.sobreMi || []).filter(lleno);
    $("#sobreTexto").innerHTML = parrafos.length
      ? parrafos.map((p) => `<p>${esc(p)}</p>`).join("")
      : pendiente("texto de «Sobre mí»", "p");
    const f = C.formacion;
    if (f && (f.titulos || []).some(lleno)) {
      $("#sobreTexto").insertAdjacentHTML("beforeend", `
        <div class="formacion">
          <div class="etiqueta">Formación${lleno(f.centro) ? " · " + esc(f.centro) : ""}</div>
          <ul>${f.titulos.filter(lleno).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </div>`);
    }
  }

  function pintarContacto() {
    const partes = [];
    partes.push(lleno(C.correo)
      ? `<a class="contacto__correo" href="mailto:${esc(C.correo)}">${esc(C.correo)}</a>`
      : pendiente("correo de contacto", "p"));
    const ig = lleno(C.instagram) ? String(C.instagram).trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "") : "";
    partes.push(ig
      ? `<a class="contacto__red" href="https://www.instagram.com/${encodeURIComponent(ig)}/" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>
          @${esc(ig)}</a>`
      : pendiente("usuario de Instagram", "p"));
    if (lleno(C.youtube)) {
      partes.push(`<a class="contacto__red" href="${esc(C.youtube)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/></svg>
          YouTube</a>`);
    }
    $("#contactoEnlaces").innerHTML = `<div class="contacto__principal">${partes[0]}</div><div class="contacto__redes">${partes.slice(1).join("")}</div>`;

    // Datos estructurados para buscadores
    const datos = { "@context": "https://schema.org", "@type": "Person", name: C.nombre, jobTitle: C.profesion, url: location.origin + "/" };
    if (lleno(C.correo)) datos.email = "mailto:" + C.correo;
    datos.sameAs = [ig && "https://www.instagram.com/" + ig + "/", lleno(C.youtube) && C.youtube].filter(Boolean);
    const marcaDatos = C.marca || C.productora;
    if (lleno(marcaDatos)) datos.brand = { "@type": "Brand", name: marcaDatos };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(datos);
    document.head.appendChild(s);
  }

  /* ---------- Scroll: aparición, cabecera y menú ------------------- */
  function animacionesScroll() {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    $$(".revelar, .tarjeta").forEach((el) => io.observe(el));

    const cabecera = $("#cabecera");
    const alHacerScroll = () => cabecera.classList.toggle("cabecera--solida", window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    alHacerScroll();

    // Marca en el menú y en los filtros la parte que se está viendo
    const vigilar = (selector, enlaces) => {
      const o = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          enlaces().forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id ? "true" : "false"));
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$(selector).forEach((z) => o.observe(z));
    };
    vigilar("main > section[id]", () => $$("#menu a"));
    vigilar(".seccion[id]", () => $$("#filtros a"));
  }

  function menuMovil() {
    const boton = $("#botonMenu");
    const menu = $("#menu");
    const poner = (abierto) => {
      boton.setAttribute("aria-expanded", String(abierto));
      menu.classList.toggle("menu--abierto", abierto);
      document.body.classList.toggle("bloqueado", abierto);
      document.body.classList.toggle("menu-abierto", abierto);
    };
    // Numeración y pie del menú (solo se ve en móvil)
    $$("a", menu).forEach((a, i) => a.insertAdjacentHTML("afterbegin", `<span class="menu__num">${dos(i + 1)}</span>`));
    const ig = lleno(C.instagram) ? String(C.instagram).replace(/^@/, "") : "";
    menu.insertAdjacentHTML("beforeend", `<div class="menu__pie">
      ${lleno(C.correo) ? `<a class="menu__dato" href="mailto:${esc(C.correo)}">${esc(C.correo)}</a>` : ""}
      ${ig ? `<a class="menu__dato" href="https://www.instagram.com/${encodeURIComponent(ig)}/" target="_blank" rel="noopener">@${esc(ig)}</a>` : ""}
      ${lleno(C.logo) ? `<img class="menu__logo" src="${esc(C.logo)}" alt="" width="90" height="40">` : ""}
    </div>`);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("menu--abierto")) poner(false); });
    boton.addEventListener("click", () => poner(boton.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => poner(false)));
  }

  /* ---------- Arranque --------------------------------------------- */
  const tituloOriginal = document.title;
  pintarTextos();
  pintarPortada();
  pintarProyectos();
  pintarProximamente();
  ondasAlPulsar();
  pintarSobreMi();
  pintarContacto();
  avisoBorrador();
  menuMovil();
  animacionesScroll();
  if (location.hash.startsWith("#proyecto/")) segunHash();
})();
