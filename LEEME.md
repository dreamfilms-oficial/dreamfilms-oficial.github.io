# Tu web · cómo se usa

Web: **https://dreamfilms-oficial.github.io**

## Cambiar un texto
1. Abre `contenido.js` con el Bloc de notas (o cualquier editor).
2. Cambia lo que haya entre comillas: nombre, marca, showreel, «Sobre mí», correo, Instagram…
3. Guarda y haz doble clic en **`publicar.bat`**. En 1–2 minutos está en internet.

## Añadir un proyecto
1. Crea una carpeta dentro de `fotos/` con un nombre sencillo, sin espacios: `fotos/boda-lucia-pablo/`.
2. Mete ahí las fotos **originales** (no se tocan nunca; solo se publican copias para la web).
   Salen en orden de nombre: si quieres un orden concreto, ponles `01`, `02`, `03`… delante.
3. En `contenido.js`, dentro de la sección que toque, copia un bloque de proyecto y rellénalo:
   ```js
   {
     titulo: "Boda de Lucía y Pablo",
     cliente: "Lucía y Pablo",
     año: "2025",
     papel: "Dirección, cámara y montaje",
     descripcion: "",
     carpeta: "boda-lucia-pablo",
     portada: "",                       // opcional: nombre de la foto para la miniatura
     videos: ["https://vimeo.com/..."]  // opcional: YouTube o Vimeo
   },
   ```
   Ojo con las comas entre bloques y con cerrar comillas y llaves.
4. Doble clic en **`publicar.bat`**.

Una sección nueva es igual: `{ titulo: "Videoclips", proyectos: [ ...proyectos... ] },`

## Fotos especiales (`fotos/_web/`)
- `portada.jpg` → fondo de la portada mientras carga el showreel.
- `sobre-mi.jpg` → tu foto en «Sobre mí».
- `compartir.jpg` → la imagen que sale al mandar el enlace por WhatsApp o redes.

## Ver la web antes de publicarla
Doble clic en `index.html` no basta para todo; mejor, en esta carpeta:
`python -m http.server 8000` y abre http://localhost:8000

## Detalles
- Mientras falte algo, la web muestra un aviso naranja de **BORRADOR** con lo que falta.
- Los vídeos no se suben aquí: se ponen enlaces de YouTube, Vimeo o Google Drive (compartido como «Cualquier persona con el enlace»). Para un vídeo vertical: `{ enlace: "...", vertical: true }`.
- Las versiones web de las fotos van a `img/` (las crea `preparar-fotos.bat`); no las toques a mano.
- Los originales de `fotos/` no se suben a internet.
