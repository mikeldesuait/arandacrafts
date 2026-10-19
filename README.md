# 🛠️ Aranda Crafts — Gestión de Taller

App web local para crear **presupuestos, albaranes y facturas** de un taller de estampación textil (vinilo, DTF, sublimación, ropa Roly).

Pensada para autónomo. Funciona en **PC, tablet y móvil** (100% responsive). Todo se guarda en el navegador (`localStorage`). Imprime o guarda como PDF con un clic.

---

## 🎯 ¿Qué hace?

### 📊 Dashboard (Inicio)
- Resumen visual del taller: **Clientes, Total Cobrado, Pendiente de Cobro, Inversión en Stock**.
- **Top 5 Más Vendidos** (por unidades y dinero generado).
- **Pedidos en Taller Urgentes**: Avisos en rojo/naranja si un pedido está retrasado o se entrega hoy.

### 🏭 Tablero de Taller (Kanban)
- Organiza los pedidos en 3 columnas: **Aceptados (En cola)**, **En Producción** y **Entregados (Albarán)**.
- **Sistema de prioridad automático**: Los pedidos se ordenan por fecha de entrega (los más urgentes arriba).
- Alerta visual con semáforo (🔴 Retrasado, 🟠 Hoy, 🟡 Quedan X días, 🟢 A tiempo).

### 📦 Control de Stock y Variantes
- Catálogo con estructura de carpetas (Ropa, Vinilos, DTF, Sublimación, Personalizables).
- **Variantes**: Control de stock por Color y Talla. El stock total se recalcula automáticamente al guardar.
- **Descuento automático**: El stock **solo se descuenta** cuando el documento se guarda como **Albarán** (material entregado).
- **Inventario**: Pestaña exclusiva para ver la inversión total de dinero en el almacén (Coste x Stock).

### 👥 Clientes 360º
- Base de datos de clientes.
- **Historial integrado**: Al abrir un cliente, puedes ver cuánto te debe, cuánto te ha pagado y hacer clic en cualquier presupuesto para abrirlo al instante.

### 📄 Presupuestos, Albaranes y Facturas
- **3 tipos de documento** con numeración independiente:
  - Presupuesto → `PRE-2026-001`
  - Albarán → `ALB-2026-001`
  - Factura → `FAC-2026-001`
- **Estados claros**: Borrador, Aceptado, En Producción, Entregado.
- **Control de cobro**: Marca si un documento está *Pendiente* o *Cobrado*.
- **Cálculo exacto**: Desglose de Base Imponible e IVA al céntimo.
- **Imprimir / PDF** con cabecera profesional y material del cliente.

### ⚙️ Ajustes y Seguridad
- Configuración de datos fiscales, eslogan e IBAN del emisor.
- **Backup completo**: Exporta e importa todos los datos en un archivo JSON.
- **Tema claro / oscuro**.
- **Zona peligrosa** para borrar todos los datos con doble confirmación.

---

## 🚫 ¿Qué NO hace?

- **No emite facturas fiscales válidas** para Hacienda (esa parte la hace la asesoría).
- No aplica IRPF fiscal automáticamente ni cumple Verifactu.

---

## 🏗️ Arquitectura

Aplicación **100% estática**: HTML + CSS + JavaScript vanilla, sin frameworks, sin bundler, sin backend.

Toda la persistencia va a `localStorage`. Los datos no salen del dispositivo.

### Estructura

```
arandacrafts/
├── index.html              ← Punto de entrada
├── README.md
├── css/
│   ├── themes.css          ← Variables de tema claro/oscuro
│   ├── styles.css          ← Estilos base + responsive
│   └── print.css           ← Estilos de impresión
└── js/
    ├── storage.js          ← Persistencia (localStorage)
    ├── modelo.js           ← Catálogos, stock, presupuestos, cálculos
    ├── app.js              ← Arranque, navegación, lógica de UI y parches
    ├── dashboard.js        ← Lógica de la pantalla de Inicio
    ├── taller.js           ← Lógica del tablero Kanban de producción
    └── inventario.js       ← Lógica del listado de costes de stock
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
**Ajustes → 👤 Datos del emisor**: Rellena tu nombre, NIF, dirección, etc.

### 2. Gestionar Stock
**Productos** → Crea carpetas y añade productos. Si un producto tiene variantes (color/talla), el stock se suma automáticamente.

### 3. Flujo de trabajo (Presupuesto → Taller)
1. Crea un **Presupuesto** (estado *Borrador*). El stock NO baja.
2. Cuando el cliente acepte, cámbialo a **Aceptado** y ponle una *Fecha de entrega*. (Aparecerá en el Taller).
3. Ponlo en **En Producción** cuando te pongas a ello.
4. Cuando lo entregues, cámbialo a **Entregado**. Automáticamente pasará a ser un **Albarán** y el stock bajará.

### 4. Cobros
Una vez entregado, si el cliente te paga, abre el documento y cambia **Estado de Cobro** a *Cobrado*. El Dashboard se actualizará solo.

---

## 💾 Persistencia (`localStorage`)

Todo bajo el prefijo `arandacrafts:`:

| Clave | Contenido |
|---|---|
| `arandacrafts:tema` | `light` / `dark` |
| `arandacrafts:stock:estructura` | Carpetas, productos y variantes (Stock) |
| `arandacrafts:stock:registro` | Material aportado por clientes |
| `arandacrafts:catalogo:mano_obra` | Mano de obra / extras |
| `arandacrafts:presupuestos` | Documentos guardados |
| `arandacrafts:clientes` | Base de datos de clientes |
| `arandacrafts:emisor` | Datos fiscales + marca |
| `arandacrafts:contador` | Contadores de numeración |

---

## 🧭 Roadmap

- [ ] Logo real en la cabecera del PDF.
- [ ] PWA para instalar en el móvil.
- [ ] Envío por email con `mailto:`.
- [ ] Historial de movimientos de stock (entradas/salidas).
