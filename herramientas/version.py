"""Pone un número de versión en los enlaces de index.html para que los navegadores
descarguen siempre los últimos cambios (y no una copia antigua guardada)."""
import re
import time
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "index.html"
s = p.read_text(encoding="utf-8")
v = time.strftime("%Y%m%d%H%M")
for f in ["css/estilos.css", "contenido.js", "fotos.js", "js/app.js"]:
    s = re.sub('"' + re.escape(f) + r'(\?v=\d+)?"', '"' + f + "?v=" + v + '"', s)
p.write_text(s, encoding="utf-8")
print("Versión", v)
