"""
Prepara las fotos para la web.

  · Lee los ORIGINALES de  fotos/<carpeta>/  (no los toca nunca).
  · Crea versiones web nítidas en  img/<carpeta>/  en WebP de alta calidad
    a 800, 1600 y 2400 px de lado mayor (sin ampliar nunca el original).
  · Quita los datos EXIF (ubicación GPS, cámara…) de las versiones web.
  · Escribe  fotos.js  con la lista de fotos de cada carpeta.

Carpeta especial  fotos/_web/ :
  portada.jpg   → fondo de la portada mientras carga el showreel
  sobre-mi.jpg  → tu foto en «Sobre mí»
  compartir.jpg → imagen que sale al compartir el enlace (si no está, se usa portada)

Uso:  python herramientas/preparar_fotos.py          (o doble clic en preparar-fotos.bat)
      python herramientas/preparar_fotos.py --todo   (rehace todas, aunque ya existan)
"""
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

try:
    from PIL import Image, ImageFilter, ImageOps
except ImportError:
    sys.exit("Falta la librería Pillow. Instálala con:  python -m pip install Pillow")

try:  # Fotos de iPhone (.heic), si está instalado pillow-heif
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIC = True
except ImportError:
    HEIC = False

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "fotos"
DESTINO = RAIZ / "img"
MANIFIESTO = RAIZ / "fotos.js"
TAMANOS = (800, 1600, 2400)   # lado mayor en píxeles
CALIDAD = 90                  # WebP: 90 es prácticamente indistinguible del original
EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"} | ({".heic", ".heif"} if HEIC else set())


def limpio(texto: str) -> str:
    t = unicodedata.normalize("NFD", texto)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-") or "foto"


def orden_natural(p: Path):
    return [int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)", p.name)]


def preparar(origen: Path, carpeta_destino: Path, base: str, rehacer: bool):
    """Devuelve [(ruta_relativa, ancho, alto), ...] de cada tamaño generado."""
    with Image.open(origen) as im:
        im = ImageOps.exif_transpose(im)
        icc = im.info.get("icc_profile")
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
        lado = max(im.size)
        objetivos = [t for t in TAMANOS if t < lado] + [min(lado, TAMANOS[-1])]
        objetivos = sorted(set(objetivos))
        salida = []
        for t in objetivos:
            escala = t / lado
            w, h = max(1, round(im.width * escala)), max(1, round(im.height * escala))
            archivo = carpeta_destino / f"{base}-{t}.webp"
            if rehacer or not archivo.exists() or archivo.stat().st_mtime < origen.stat().st_mtime:
                copia = im if (w, h) == im.size else im.resize((w, h), Image.LANCZOS)
                if escala < 0.9:  # un toque de nitidez tras reducir, muy suave
                    copia = copia.filter(ImageFilter.UnsharpMask(radius=0.6, percent=35, threshold=2))
                opciones = {"quality": CALIDAD, "method": 6}
                if icc:
                    opciones["icc_profile"] = icc
                copia.save(archivo, "WEBP", **opciones)
            salida.append((archivo.relative_to(RAIZ).as_posix(), w, h))
        return salida, im


def imagen_compartir(im: Image.Image, destino: Path):
    """Recorte 1200x630 para la vista previa en redes y WhatsApp."""
    copia = ImageOps.fit(im.convert("RGB"), (1200, 630), Image.LANCZOS, centering=(0.5, 0.45))
    copia.save(destino, "JPEG", quality=88, optimize=True, progressive=True)


def main():
    rehacer = "--todo" in sys.argv
    if not ORIGEN.exists():
        ORIGEN.mkdir()
    DESTINO.mkdir(exist_ok=True)
    manifiesto = {}
    vistos_dirs = set()
    total = 0

    for carpeta in sorted((d for d in ORIGEN.iterdir() if d.is_dir()), key=orden_natural):
        nombre = carpeta.name
        destino = DESTINO / nombre
        destino.mkdir(parents=True, exist_ok=True)
        vistos_dirs.add(nombre)
        archivos = sorted((f for f in carpeta.iterdir() if f.is_file() and f.suffix.lower() in EXTENSIONES), key=orden_natural)
        ignorados = [f.name for f in carpeta.iterdir() if f.is_file() and f.suffix.lower() not in EXTENSIONES and not f.name.startswith(".")]
        lista, generados, bases = [], set(), set()
        for f in archivos:
            base = limpio(f.stem)
            while base in bases:
                base += "-b"
            bases.add(base)
            try:
                tamanos, im = preparar(f, destino, base, rehacer)
            except Exception as e:  # foto dañada o formato raro: se avisa y se sigue
                print(f"  ! No se pudo leer {nombre}/{f.name}: {e}")
                continue
            generados.update(Path(r).name for r, _, _ in tamanos)
            _, w, h = tamanos[-1]
            lista.append({"archivo": f.name, "w": w, "h": h, "src": [[r, tw] for r, tw, _ in tamanos]})
            if nombre == "_web":
                hay_compartir = any(limpio(x.stem) == "compartir" for x in archivos)
                if base == "compartir" or (base == "portada" and not hay_compartir):
                    imagen_compartir(im, destino / "og.jpg")
                    generados.add("og.jpg")
        # Borra versiones web de fotos que ya no existen
        for viejo in destino.iterdir():
            if viejo.is_file() and viejo.name not in generados:
                viejo.unlink()
        manifiesto[nombre] = lista
        total += len(lista)
        aviso = f"  (ignorados: {', '.join(ignorados)})" if ignorados else ""
        print(f"  {nombre}: {len(lista)} foto(s){aviso}")

    # Borra carpetas de img/ cuyo original ya no existe
    for d in DESTINO.iterdir():
        if d.is_dir() and d.name not in vistos_dirs:
            shutil.rmtree(d)

    texto = json.dumps(manifiesto, ensure_ascii=False, indent=1)
    MANIFIESTO.write_text(
        "/* Generado automáticamente por herramientas/preparar_fotos.py — no lo edites a mano. */\n"
        f"window.FOTOS = {texto};\n",
        encoding="utf-8",
    )
    print(f"\nListo: {total} foto(s) preparadas. Recarga la web para verlas.")
    if not HEIC:
        print("(Las fotos .HEIC del iPhone necesitan:  python -m pip install pillow-heif)")


if __name__ == "__main__":
    main()
