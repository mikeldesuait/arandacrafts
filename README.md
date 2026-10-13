# 🛠️ ArandaCrafts — Presupuestos

Aplicación web local (sin backend) para crear presupuestos de trabajos
de diseño de camisetas, estampación en vinilo, DTF, serigrafía y similares.

## ¿Qué hace?
- Catálogo de prendas (por unidad)
- Catálogo de estampación (vinilo por metro, DTF por plancha, etc.)
- Catálogo de mano de obra y extras (hora / unidad / fijo)
- Crear presupuestos con líneas desde catálogo
- Total en vivo, estados (borrador, enviado, aceptado, rechazado, hecho)
- Imprimir / guardar como PDF
- Backup con Export/Import JSON

## ¿Qué NO hace?
- No emite facturas (eso lo hace la asesoría)
- No aplica IVA/IRPF fiscal
- No cumple Verifactu ni normativa AEAT

## Arrancar en local
    cd ~/arandacrafts
    python3 -m http.server 8000

Abrir: http://localhost:8000/

## Producción
GitHub Pages: https://mikeldesuait.github.io/arandacrafts/

## Tecnología
HTML + CSS + JavaScript vanilla. localStorage. Sin frameworks ni bundler.
