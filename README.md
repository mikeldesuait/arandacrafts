# 🛠️ Aranda Crafts — Gestión de Taller

App web local para crear presupuestos, albaranes y facturas de un taller de estampación textil (vinilo, DTF, sublimación, ropa Roly).

Pensada para autónomo. Funciona en PC, tablet y móvil. Todo se guarda en el navegador (localStorage). Imprime o guarda como PDF con un clic.

---

## 🎯 ¿Qué hace?

- Catálogo editable con estructura de carpetas:
  - 👕 Ropa (con control de variantes: Color y Talla)
  - 🎨 Vinilos, DTF, Sublimación y Personalizables (tazas, botellas, etc.)
  - 🛠️ Mano de obra / Extras (diseño, planchado, packaging, envíos)
- Control de Stock automático:
  - El stock solo se descuenta cuando el documento se guarda como Albarán (asumiendo que el material ya se ha entregado).
  - Soporta descuento de productos con variantes (ej: Camiseta Roly - Blanco - S) y productos simples (ej: Taza mágica).
- 3 tipos de documento con numeración independiente:
  - Presupuesto -> PRE-2026-001
  - Albarán -> ALB-2026-001
  - Factura -> FAC-2026-001
- Modal selector de catálogo con pestañas por subcategoría, navegación y buscador.
- Cálculo en vivo de subtotales, desglose de IVA y total.
- Estados: borrador, enviado, aceptado, rechazado, hecho.
- Imprimir / PDF con cabecera profesional y material del cliente.
- Backup completo (export / import JSON).
- Tema claro / oscuro.

---

## 🚫 ¿Qué NO hace?

- No emite facturas fiscales válidas para Hacienda (esa parte la hace la asesoría).
- No aplica IRPF fiscal automáticamente.
- No cumple Verifactu ni TicketBAI.

---

## 🏗️ Arquitectura

Aplicación 100% estática: HTML + CSS + JavaScript vanilla, sin frameworks, sin bundler, sin backend.

Toda la persistencia va a localStorage. Los datos no salen del dispositivo.

### Estructura

arandacrafts/
├── index.html              <- Punto de entrada
├── README.md
├── .gitignore
├── css/
│   ├── themes.css          <- Variables de tema claro/oscuro
│   ├── styles.css          <- Estilos base + responsive
│   └── print.css           <- Estilos de impresión
└── js/
    ├── storage.js          <- Persistencia (localStorage)
    ├── modelo.js           <- Catálogos, stock, presupuestos, cálculos
    └── app.js              <- Arranque, navegación, lógica de UI y parches

---

## 🚀 Arrancar en local

cd ~/arandacrafts
python3 -m http.server 8000

Abre: http://localhost:8000/

---

## 🌐 Producción

- Repo: https://github.com/mikeldesuait/arandacrafts
- Web: https://mikeldesuait.github.io/arandacrafts/

---

## 🧩 Uso rápido

### 1. Configurar datos del emisor

Ajustes -> 👤 Datos del emisor:

- Nombre comercial, eslogan, Nombre fiscal (titular autónomo)
- NIF, dirección, teléfono, email, web, IBAN

### 2. Gestionar Stock

Productos -> Navega por las carpetas (Ropa, Vinilos, Personalizables...). 
Puedes crear productos simples o con variantes (color/talla). El stock se actualiza automáticamente.

### 3. Crear un documento

Presupuestos -> + Nuevo presupuesto:

- Elige tipo (Presupuesto / Albarán / Factura).
- Rellena cliente, contacto y descripción.
- Añade líneas desde el modal.
- Ajusta cantidad y precio. Total en vivo.
- 💾 Guardar, 🖨️ Imprimir / PDF, 🗑️ Eliminar.
- Nota: Al cambiar el tipo a "Albarán" y guardar, el sistema restará automáticamente las unidades del stock.

### 4. Backup

Ajustes -> 💾 Backup:

- 📤 Exportar backup -> descarga arandacrafts-backup-AAAA-MM-DD.json
- 📥 Importar backup -> restaura desde un JSON

---

## 💾 Persistencia (localStorage)

Todo bajo el prefijo arandacrafts:

Clave | Contenido
arandacrafts:tema | light / dark
arandacrafts:stock:estructura | Carpetas, productos y variantes (Stock)
arandacrafts:stock:registro | Material aportado por clientes
arandacrafts:catalogo:mano_obra | Mano de obra / extras
arandacrafts:presupuestos | Documentos guardados
arandacrafts:clientes | Base de datos de clientes
arandacrafts:emisor | Datos fiscales + marca
arandacrafts:contador | Contadores de numeración

---

## 🧭 Roadmap

- [ ] Logo real en la cabecera del PDF.
- [ ] PWA para instalar en el móvil.
- [ ] Condiciones generales al pie del documento.
- [ ] Envío por email con mailto:.
- [ ] Historial de movimientos de stock (entradas/salidas).
