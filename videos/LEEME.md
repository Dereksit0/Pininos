# Videos del reel (formato 9:16)

Coloca aquí los cuatro clips con **exactamente** estos nombres para que el
sitio los tome sin tocar el HTML:

| Archivo        | Sección del reel            |
|----------------|-----------------------------|
| `reel-1.mp4`   | Estimulación temprana       |
| `reel-2.mp4`   | Juego libre y exploración   |
| `reel-3.mp4`   | Talleres de arte            |
| `reel-4.mp4`   | Música y movimiento         |

## Requisitos (no negociables para que el sitio siga siendo rápido)

- Formato **MP4 / H.264 + AAC**, relación de aspecto **9:16** (ej. 720x1280).
- **Menos de 3 MB por clip.** Duración ideal: 8 a 15 segundos.
- Sin audio imprescindible: se reproducen silenciados.
- Cada video necesita su **poster** (imagen de portada) en `/img/reel-N.webp`.
  Hoy hay placeholders en `/img/reel-N.svg`; al cambiarlos, actualiza el
  atributo `poster` de cada `<video>` en `index.html`.

## Cómo comprimir (ffmpeg)

```bash
ffmpeg -i original.mov -vf "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280" \
  -c:v libx264 -crf 28 -preset slow -movflags +faststart -an reel-1.mp4
```

`-movflags +faststart` es importante: permite que el video empiece a
reproducirse antes de descargarse completo.

## Cómo sacar el poster del propio video

```bash
ffmpeg -i reel-1.mp4 -ss 00:00:01 -vframes 1 -vf scale=540:960 ../img/reel-1.webp
```

> Mientras no haya videos reales, el sitio muestra el poster y **no falla**:
> el botón de play simplemente no logra reproducir y se mantiene la portada.
