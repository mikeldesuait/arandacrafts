# 🛠️ Aranda Crafts — Presupuestos

App web local para crear **presupuestos, albaranes, facturas y órdenes de trabajo** de un taller de estampación textil (vinilo, DTF, sublimación, ropa Roly).

Pensada para autónomo. Funciona en **PC, tablet y móvil**. Todo se guarda en el navegador (`localStorage`). Imprime o guarda como PDF con un clic.

---

## 🎯 ¿Qué hace?

- **Catálogo editable**:
  - 👕 **Ropa Roly** (camisetas, pantalones, sudaderas...)
  - 🎨 **Vinilos** (Flex PU, Glitter, Reflectante, Flock, Puff, Holográfico...)
  - 🖨️ **DTF** (planchas A5/A4/A3/A2, film, poliamida)
  - ☕ **Sublimación** (papel, tintas, planchas)
  - 🛠️ **Mano de obra / Extras** (diseño, planchado, packaging, envíos)
- **4 tipos de documento** con numeración independiente:
  - Presupuesto → `PRE-2026-001`
  - Albarán → `ALB-2026-001`
  - Factura → `FAC-2026-001`
  - Orden de trabajo → `OT-2026-001`
- **Modal selector de catálogo** con pestañas por subcategoría y buscador.
- **Cálculo en vivo** de subtotales y total.
- **Estados**: borrador, enviado, aceptado, rechazado, hecho.
- **Imprimir / PDF** con cabecera profesional (marca + datos fiscales del autónomo).
- **Duplicar** cualquier documento con 1 clic.
- **Backup completo** (export / import JSON).
- **Tema claro / oscuro**.
- **Responsive** en PC, tablet y móvil.

---

## 🚫 ¿Qué NO hace?

- **No emite facturas fiscales válidas** para Hacienda (esa parte la hace la asesoría).
- No aplica IVA / IRPF fiscal automáticamente.
- No cumple Verifactu ni TicketBAI.

---

## 🏗️ Arquitectura

Aplicación **100% estática**: HTML + CSS + JavaScript vanilla, sin frameworks, sin bundler, sin backend.

Toda la persistencia va a `localStorage`. Los datos no salen del dispositivo.

### Estructura

```
arandacrafts/
├── index.html              ← Punto de entrada
├── README.md
├── .gitignore
├── css/
│   ├── themes.css          ← Variables de tema claro/oscuro
│   ├── styles.css          ← Estilos base + responsive
│   └── print.css           ← Estilos de impresión (fallback)
└── js/
    ├── storage.js          ← Persistencia (localStorage)
    ├── modelo.js           ← Catálogos, presupuestos, cálculos, numeración
    └── app.js              ← Arranque, navegación, catálogos y editor
```

---

## 🚀 Arrancar en local

```bash
cd ~/arandacrafts
python3 -m http.server 8000
```

Abre: **http://localhost:8000/**

---

## 🌐 Producción

- Repo: https://github.com/mikeldesuait/arandacrafts
- Web: **https://mikeldesuait.github.io/arandacrafts/**

---

## 🧩 Uso rápido

### 1. Configurar datos del emisor

**Ajustes → 👤 Datos del emisor**:

- **Nombre comercial**: `Aranda Crafts`
- **Eslogan**: `Estampación textil · Vinilo · DTF`
- **Nombre fiscal** (titular autónomo)
- **NIF**, **dirección**, **teléfono**, **email**
- Opcional: **web**, **IBAN**

### 2. Personalizar catálogo

**Catálogo** → 3 pestañas: **Ropa**, **Materiales** (Vinilos / DTF / Sublimación), **Mano de obra**.

### 3. Crear un documento

**Presupuestos → + Nuevo presupuesto**:

- Elige tipo (Presupuesto / Albarán / Factura / Orden).
- Rellena cliente, contacto y descripción.
- Añade líneas desde el modal (ropa / material / mano de obra).
- Ajusta cantidad y precio. Total en vivo.
- **💾 Guardar**, **🖨️ Imprimir / PDF**, **📄 Duplicar**, **🗑️ Eliminar**.

### 4. Backup

**Ajustes → 💾 Backup**:

- **📤 Exportar backup** → descarga `arandacrafts-backup-AAAA-MM-DD.json`
- **📥 Importar backup** → restaura desde un JSON

---

## 💾 Persistencia (`localStorage`)

Todo bajo el prefijo `arandacrafts:`:

| Clave | Contenido |
|---|---|
| `arandacrafts:tema` | `light` / `dark` |
| `arandacrafts:catalogo:ropa` | Lista de prendas |
| `arandacrafts:catalogo:materiales:vinilos` | Vinilos |
| `arandacrafts:catalogo:materiales:dtf` | DTF |
| `arandacrafts:catalogo:materiales:sublimacion` | Sublimación |
| `arandacrafts:catalogo:mano` | Mano de obra / extras |
| `arandacrafts:presupuestos` | Documentos guardados |
| `arandacrafts:emisor` | Datos fiscales + marca |
| `arandacrafts:contador` | Contadores de numeración |
| `arandacrafts:ultima-export` | Fecha de la última exportación |

---

## 🛠️ Tecnologías

- HTML5 + CSS3 con variables CSS para temas.
- JavaScript ES6+ vanilla — sin frameworks, sin bundler.
- `localStorage` para persistencia.
- `window.open` + `window.print` para generar PDF en pestaña nueva (100% fiable).
- GitHub Pages para hosting.
- Dependencia externa: Google Fonts: Inter.

---

## 🧭 Roadmap

- [ ] Logo real en la cabecera del PDF.
- [ ] PWA para instalar en el móvil.
- [ ] Favicon propio.
- [ ] Condiciones generales al pie del documento.
- [ ] Envío por email con `mailto:`.

---

## 📜 Licencia

Uso personal / privado. Todos los derechos reservados.

---

## 🌐 English summary

Personal offline web app to create quotes, delivery notes, invoices and work orders for a small textile printing workshop (vinyl, DTF, sublimation, Roly garments). No backend: pure HTML/CSS/JS with `localStorage`. Printable PDF via `window.print()` in a new window. Hosted on GitHub Pages.

Live: https://mikeldesuait.github.io/arandacrafts/
