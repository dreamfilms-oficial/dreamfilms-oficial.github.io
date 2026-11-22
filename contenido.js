/* =====================================================================
   CONTENIDO DE LA WEB
   ---------------------------------------------------------------------
   Todo lo que se lee en la web sale de este archivo. Para cambiar un
   texto, cámbialo aquí entre comillas, guarda y recarga la página.

   · Si un campo obligatorio está vacío ("") la web muestra un aviso
     de PENDIENTE. «cliente» y «año» son opcionales.
   · Los enlaces de vídeo pueden ser de YouTube, Vimeo o Google Drive,
     tal cual los copias del navegador. (En Drive, el vídeo tiene que
     estar compartido como «Cualquier persona con el enlace».)
   · Las fotos NO se ponen aquí: van en  fotos/<carpeta-del-proyecto>/
     y luego se ejecuta  preparar-fotos.bat  (ver LEEME.md).
   ===================================================================== */

window.CONTENIDO = {

  /* --- Nombre y marca ------------------------------------------------ */
  nombre: "Ángel Pérez Castillo",
  profesion: "Filmmaker · Fotografía",
  // Nombre grande de la portada. Si lo dejas vacío, se usa tu nombre.
  marca: "",
  // Productora con la que firmas (sale con su logo en la cabecera y el pie)
  productora: "Dream Films",
  logo: "img/logo-dreamfilms.png",

  /* --- Showreel (vídeo de la portada) -------------------------------- */
  // Enlace de YouTube o Vimeo. Se reproduce sin sonido de fondo y con
  // sonido al pulsar «Ver showreel». Vacío = la portada muestra la foto
  // fotos/_web/portada.jpg y el botón lleva a la sección de vídeos.
  // Cuando tengas un showreel propio, pon aquí su enlace.
  showreel: "",

  /* --- Sobre mí ------------------------------------------------------ */
  // Un párrafo por línea entre comillas, separados por comas.
  // El primero sale más grande, como titular.
  // La foto va en  fotos/_web/sobre-mi.jpg
  sobreMi: [
    "Capturo momentos que cuentan una historia.",
    "Soy Ángel Pérez Castillo, filmmaker y fotógrafo. Me mueve la energía de la calle, del directo y de las personas: busco el gesto que no se repite y lo convierto en una imagen con algo que contar.",
    "He participado en bodas, eventos culturales, teatro, sesiones de estudio y fotografía de producto. Trabajo con ambición, honestidad y cercanía, sin hacer perder el tiempo a nadie. El cine es mi gran escuela y se nota en cómo encuadro, ilumino y narro.",
    "Firmo mi trabajo como Dream Films, mi productora audiovisual: con ella hago cada encargo y, muy pronto, mis propios cortometrajes."
  ],
  formacion: {
    centro: "IES Ángel de Saavedra, Córdoba",
    titulos: [
      "Técnico Superior en Iluminación, Captación y Tratamiento de Imagen",
      "Técnico Superior en Producción de Audiovisuales y Espectáculos"
    ]
  },

  /* --- Contacto (público: nada de teléfono ni dirección) ------------- */
  correo: "dfilmsproductora@gmail.com",
  instagram: "dreamfilms_oficial",   // solo el usuario, sin @
  youtube: "https://www.youtube.com/@Dream_films__",

  /* --- Próximamente (bloque final antes de «Sobre mí») -------------- */
  // Para quitarlo, deja  proximamente: null
  proximamente: {
    titulo: "Cortometrajes",
    texto: "Lo próximo de Dream Films ya se está escribiendo.",
    etiqueta: "Próximamente"
  },

  /* --- Secciones y proyectos ----------------------------------------- */
  // Cada sección agrupa proyectos. Cada proyecto:
  //   titulo      → nombre del proyecto
  //   cliente     → para quién fue (opcional)
  //   año         → p. ej. "2025" (opcional)
  //   papel       → tu papel (dirección, cámara, montaje…)
  //   descripcion → opcional, un par de frases
  //   carpeta     → nombre de su carpeta dentro de fotos/  (opcional)
  //   portada     → nombre del archivo de foto para la miniatura
  //                 (opcional; si no, se usa la primera foto)
  //   videos      → lista de enlaces de YouTube/Vimeo/Drive (opcional).
  //                 Para un vídeo vertical: { enlace: "...", vertical: true }
  //
  // Ejemplo (copia el bloque entre llaves para añadir otro):
  //   {
  //     titulo: "Nombre del proyecto",
  //     cliente: "Cliente",
  //     año: "2025",
  //     papel: "Dirección y montaje",
  //     descripcion: "",
  //     carpeta: "nombre-de-la-carpeta",
  //     portada: "",
  //     videos: ["https://youtu.be/XXXXXXXXXXX"]
  //   },
  // Para que una sección se vea como rejilla de vídeos, añade  tipo: "videos"
  secciones: [
    {
      titulo: "Bodas",
      proyectos: [
        {
          titulo: "Reportaje de boda",
          cliente: "",
          año: "2026",
          papel: "Foto y vídeo",
          descripcion: "Un día entero contado sin poses: los nervios de antes, la emoción del «sí, quiero» y una fiesta que no quiere terminar. Incluye el reel vertical de 60 segundos.",
          carpeta: "bodas",
          portada: "04.jpg",
          videos: [{ enlace: "https://drive.google.com/file/d/18XlTABBvzsL7DE_D6dh3ri6WlTqOqZwb/view?usp=sharing", vertical: true }]
        }
      ]
    },
    {
      titulo: "Eventos y cultura",
      proyectos: [
        {
          titulo: "Circo y danza",
          cliente: "Escuela María Hames · Planneo Córdoba Joven",
          año: "2026",
          papel: "Fotografía",
          descripcion: "Pasacalles de la IV Velá de las Flores: zancos, color y público en la calle.",
          carpeta: "circo-y-danza",
          portada: "01.jpg",
          videos: []
        },
        {
          titulo: "Gala · IV Velá de las Flores",
          cliente: "Planneo Córdoba Joven",
          año: "2026",
          papel: "Fotografía",
          descripcion: "",
          carpeta: "gala",
          portada: "03.jpg",
          videos: []
        }
      ]
    },
    {
      titulo: "Artes escénicas",
      proyectos: [
        {
          titulo: "La Celestina",
          cliente: "3.º C · ESAD Córdoba",
          año: "2026",
          papel: "Fotografía",
          descripcion: "Fotografiar sin flash y sin interrumpir: dejar que la luz del montaje cuente la escena.",
          carpeta: "la-celestina",
          portada: "00.jpg",
          videos: []
        },
        {
          titulo: "ESAD Córdoba",
          cliente: "Escuela Superior de Arte Dramático de Córdoba",
          año: "2025",
          papel: "Fotografía",
          descripcion: "Luz de escena, gesto y movimiento: la función vista desde dentro. Los vídeos de la escuela están en la sección «Vídeos».",
          carpeta: "esad",
          portada: "01.jpg",
          videos: []
        },
        {
          titulo: "Personajes",
          cliente: "La Celestina · 3.º C · ESAD Córdoba",
          año: "2026",
          papel: "Retrato",
          descripcion: "Retratos de personaje para una obra de teatro: un solo foco y mucho carácter.",
          carpeta: "personajes",
          portada: "05.jpg",
          videos: []
        }
      ]
    },
    {
      titulo: "Sesiones",
      proyectos: [
        {
          titulo: "Asfixia",
          cliente: "",
          año: "2025",
          papel: "Sesión de estudio",
          descripcion: "",
          carpeta: "asfixia",
          portada: "01.jpg",
          videos: []
        },
        {
          titulo: "Retrato bicolor",
          cliente: "",
          año: "",
          papel: "Sesión de estudio",
          descripcion: "Dos fuentes de luz, dos colores y fondo neutro.",
          carpeta: "retrato-bicolor",
          portada: "01.jpg",
          videos: []
        },
        {
          titulo: "Parejas",
          cliente: "",
          año: "2026",
          papel: "Sesión en exterior",
          descripcion: "",
          carpeta: "parejas",
          portada: "01.jpg",
          videos: []
        }
      ]
    },
    {
      titulo: "Producto",
      proyectos: [
        {
          titulo: "Bisutería",
          cliente: "",
          año: "2026",
          papel: "Fotografía de producto",
          descripcion: "Luz suave y cálida, poca profundidad de campo y el foco donde importa: en la pieza.",
          carpeta: "bisuteria",
          portada: "01.jpg",
          videos: []
        }
      ]
    },
    {
      titulo: "Fotografía de calle",
      proyectos: [
        {
          titulo: "Pobreza",
          cliente: "",
          año: "2025",
          papel: "Serie personal · Blanco y negro",
          descripcion: "Serie de fotografía callejera sobre la pobreza en la ciudad: lo que pasa a pie de acera mientras todo sigue su curso.",
          carpeta: "pobreza",
          portada: "01.jpg",
          videos: []
        }
      ]
    },
    {
      titulo: "Encuentros",
      proyectos: [
        {
          titulo: "Gervasio Sánchez: la mirada del fotoperiodista",
          cliente: "Charla en la ESAD Córdoba",
          año: "2025",
          papel: "Fotografía",
          descripcion: "El fotoperiodista Gervasio Sánchez comparte con el alumnado de la ESAD de Córdoba décadas de oficio contando historias con la cámara.",
          carpeta: "gervasio-sanchez",
          portada: "01.jpg",
          // Portada tipo revista: texto encima de la foto
          portadilla: { etiqueta: "Encuentro · ESAD Córdoba", titulo: "Gervasio Sánchez", sub: "La mirada del fotoperiodista" },
          videos: []
        }
      ]
    },
    {
      titulo: "Vídeos",
      tipo: "videos",   // tarjetas iguales en 16:9, al final de la web
      proyectos: [
        {
          titulo: "Reportaje ESAD Córdoba",
          cliente: "ESAD Córdoba",
          año: "",
          papel: "Grabación y montaje",
          descripcion: "",
          carpeta: "",
          portada: "",
          videos: [
            "https://www.youtube.com/watch?v=wbfiS5tJtFE"
          ]
        },
        {
          titulo: "ESAD Córdoba 2025",
          cliente: "ESAD Córdoba",
          año: "2025",
          papel: "Grabación y montaje",
          descripcion: "",
          carpeta: "",
          portada: "",
          // Foto propia de fondo para el cartel del vídeo (carpeta/archivo)
          fondo: "portadas-video/esad-2025.jpg",
          videos: [
            "https://www.youtube.com/watch?v=WHpz71bBSpw"
          ]
        },
        {
          titulo: "Gala del Teatro",
          cliente: "ESAD Córdoba",
          año: "",
          papel: "Grabación y montaje",
          descripcion: "",
          carpeta: "",
          portada: "",
          videos: [
            "https://www.youtube.com/watch?v=EXSnVM-4USk"
          ]
        },
        {
          titulo: "Tiresias",
          cliente: "ESAD Córdoba",
          año: "",
          papel: "Grabación y montaje",
          descripcion: "",
          carpeta: "",
          portada: "",
          videos: [
            "https://www.youtube.com/watch?v=3dSGGO0Abzs"
          ]
        },
        {
          titulo: "Los ciegos",
          cliente: "ESAD Córdoba",
          año: "",
          papel: "Grabación y montaje",
          descripcion: "Taller fin de estudios.",
          carpeta: "",
          portada: "",
          videos: [
            "https://www.youtube.com/watch?v=iSXpVIk19yI"
          ]
        },
        {
          titulo: "Creativo de danza",
          cliente: "ESAD Córdoba",
          año: "",
          papel: "Grabación y montaje",
          descripcion: "Piezas de 1.º y 2.º curso.",
          carpeta: "",
          portada: "",
          videos: [
            "https://www.youtube.com/watch?v=I3o1rVye9rY",
            "https://www.youtube.com/watch?v=k-_yUXnfMHU"
          ]
        },
        {
          titulo: "Escuela de Danza Maica",
          cliente: "Escuela de Danza Maica",
          año: "2025",
          papel: "Grabación y montaje",
          descripcion: "",
          carpeta: "",
          portada: "",
          videos: [
            "https://www.youtube.com/watch?v=gjDcux6FJkE"
          ]
        }
      ]
    }
  ]
};
