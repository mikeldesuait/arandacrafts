# 📖 Manual de Uso — Aranda Crafts

Bienvenido a tu aplicación de gestión de taller. Esta guía está pensada para el día a día: cómo crear cosas, cómo gestionar los pedidos y cómo saber cuánto ganas.

---

## 🚀 Primeros Pasos (Configuración)

Antes de empezar a trabajar, lo primero es configurar tus datos de empresa.

1. Ve a la pestaña **Ajustes**.
2. Rellena tus datos fiscales: **Nombre comercial**, **Nombre fiscal** (el tuyo como autónomo), **NIF**, **Dirección**, **Teléfono** y **Email**.
3. Estos datos aparecerán en la cabecera de los PDFs que envíes a los clientes.
4. **Consejo:** Haz clic en "Exportar Backup" para descargar una copia de seguridad de vez en cuando.

---

## ⚠️ ATENCIÓN: EL STOCK NO SE BORRA AL HACER UN PRESUPUESTO

**Esto es lo más importante que debes entender antes de usar la aplicación:**

1. Cuando creas un presupuesto (en estado Borrador o Aceptado), **los productos NO se descuentan del stock**. El sistema es inteligente y espera a que el pedido se entregue de verdad.
2. **El stock SOLO se descuenta cuando cambias el estado a "Entregado (Albarán)".** Es en ese momento, al guardar, cuando el sistema resta las unidades del almacén.
3. **⚠️ OJO:** Si te equivocas y guardas un Albarán por error, el stock **NO se recupera automáticamente**. Para solucionarlo, tienes que entrar manualmente en la pestaña **Productos**, editar el producto afectado y volver a poner las unidades que correspondan.

---

## 📦 1. Gestionar el Catálogo (Stock)

Aquí es donde guardas lo que tienes en el taller.

- **Crear una carpeta:** Entra en un bloque (ej: Ropa) y pulsa en "Nueva Carpeta" (ej: Camisetas).
- **Crear un producto:**
  - Haz clic en "Nuevo producto".
  - Rellena el nombre, el precio de coste (lo que te cuesta a ti) y el precio base (lo que cobras sin IVA).
  - **Si es ropa:** Añade las variantes (Color y Talla) con sus cantidades.
  - **Si es una taza o vinilo:** Elige "Solo Color" o "Sin variantes" y pon el stock general.
  - **Nota sobre la talla:** La opción "Sin talla" viene por defecto para que no tengas que rellenarla si no aplica.

---

## 📄 2. El Ciclo del Presupuesto (El Flujo Correcto)

Este es el flujo de trabajo diario para un pedido. ¡Sigue estos pasos para no perder el control!

1. **Crear Presupuesto (Borrador):**
   - Ve a **Presupuestos** → **+ Nuevo presupuesto**.
   - Elige al cliente, añade productos (del catálogo) y trabajos (tu mano de obra).
   - **Guarda** el documento. *(El stock NO baja, está a salvo).*

2. **Aceptado / En Cola:**
   - El cliente te dice que sí. Abre el presupuesto, ponlo en estado **"Aceptado"** y ponle una **Fecha de entrega**.
   - *Automáticamente aparecerá en la pestaña Taller.*

3. **En Producción:**
   - Cuando te pongas a fabricarlo, cámbialo a **"En Producción"**.

4. **Entregado (Albarán):**
   - Cuando se lo des al cliente, cámbialo a **"Entregado (Albarán)"**.
   - **⚠️ AQUÍ ES CUANDO EL STOCK BAJA.** Al guardar este estado, el sistema resta las unidades automáticamente.

5. **Cobrado:**
   - Si ya te ha pagado, cambia el estado de cobro a **"Cobrado"**. Si no, déjalo en "Pendiente".

---

## 🏭 3. El Tablero de Taller

Es tu centro de operaciones visual.
- Muestra los pedidos "Aceptados" y "En Producción".
- **Los colores te avisan de las urgencias:**
  - 🔴 Rojo: Retrasado (fecha pasada).
  - 🟠 Naranja: Entrega HOY.
  - 🟡 Amarillo: Quedan pocos días.
  - 🟢 Verde: A tiempo.
- Haz clic en cualquier tarjeta para abrir el presupuesto y gestionarlo.

---

## 👥 4. Clientes

- **Añadir cliente:** Pulsa "+ Nuevo cliente".
- **Historial:** Si haces clic en un cliente, verás cuánto te debe (Pendiente), cuánto te ha pagado (Cobrado) y una lista de todos sus pedidos.

---

## 🛠️ 5. Mano de Obra (Trabajos)

- Ve a la pestaña **Trabajos**.
- Aquí defines tus tarifas fijas: Ej. "Diseño" a 25€/hora, "Planchado" a 0,80€/unidad.
- Luego, al crear un presupuesto, podrás buscarlos y añadirlos. ¡El sistema acepta decimales (ej: 1,5 horas)!

---

## 📊 6. Resumen (Inicio e Inventario)

- **Inicio (Dashboard):** Un vistazo rápido a tu salud financiera. Cuánto has cobrado, cuánto está pendiente de cobro, y tu inversión en stock.
- **Inventario:** Una tabla con el valor de todo lo que tienes en el almacén (Stock x Precio de Coste). Útil para saber dónde tienes el dinero invertido.

---

## 🖨️ 7. Imprimir / PDF

- Desde dentro del presupuesto, pulsa "Imprimir / PDF".
- Se abrirá una nueva ventana con el documento listo para imprimir o guardar como archivo. Incluye el material que el cliente te haya dejado y el desglose de IVA.

---

## 💡 Preguntas Frecuentes

**¿Cómo cambio el color de la app?**
Arriba a la derecha, en el icono de la luna/sol, cambias entre modo claro y oscuro.

**¿Qué pasa si me equivoco al borrar un producto?**
El sistema pide confirmación antes de borrar. Si lo has borrado, tendrás que volver a crearlo.

**¿Por qué el stock no baja cuando guardo un presupuesto?**
Porque el sistema está diseñado para que el stock solo baje cuando el pedido se entrega físicamente (Albarán). Así evitas descuadres si el cliente cancela el pedido a última hora.
