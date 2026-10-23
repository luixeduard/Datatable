# React Datatable (TypeScript)

Componente de tabla avanzado para React y TypeScript inspirado en [DataTables.net](https://datatables.net/), diseñado con **TailwindCSS**, soporte completo para **Modo Oscuro (Dark Theme)**, arquitectura por capas modular y animaciones fluidas aceleradas por hardware.

Soporta control tanto en **Backend** (paginado en servidor) como en **Frontend** (en memoria), **Scroll Infinito** (manual y automático), **Columnas Sticky Apiladas en Pila**, **Selector de Columnas Visibles**, visualización en **Tarjetas (Cards)** con conmutador dinámico y **persistencia de estado con Redux Toolkit & SessionStorage**.

---

## 📦 Instalación

```bash
npm i @luix_eduard/datatable
# o con yarn
yarn add @luix_eduard/datatable
# o con pnpm
pnpm add @luix_eduard/datatable
```

> **Nota sobre dependencias opcionales:**  
> `@reduxjs/toolkit` y `react-redux` son **peerDependencies opcionales**. Si tu proyecto no utiliza Redux, la librería funciona perfectamente sin necesidad de instalarlos.

---

## 🚀 Inicio Rápido

### 1. Importar el componente y estilos

```tsx
import Datatable from '@luix_eduard/datatable';
import '@luix_eduard/datatable/dist/index.css';
import type { DatatableType, Column } from '@luix_eduard/datatable';
```

### 2. Definir tu modelo de datos

```ts
interface Producto {
    id: number;
    title: string;
    brand: string;
    price: number;
    category: string;
    stock: number;
    rating: { rate: number; count: number };
    createdAt: Date;
}
```

---

## 🧩 Props Principales (`DatatableType<T>`)

El componente opera en dos modos según el valor de `control`:
1. **Backend-controlled** (`control="back"`): Las peticiones de paginado, búsqueda y ordenamiento se delegan a tu servidor.
2. **Frontend-controlled** (`control="front"`): La búsqueda, ordenamiento múltiple y cortes de datos se procesan en memoria.

### Tabla de Propiedades:

| Prop | Tipo | Por Defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `headers` | `string[] \| Headers[][]` | **Requerido** | Encabezados de columnas (arreglo simple o matriz multinivel con `colspan`/`rowspan`). |
| `footers?` | `string[] \| Headers[][]` | `undefined` | Pie de tabla opcional con la misma estructura que `headers`. |
| `columns` | `Column<T>[]` | **Requerido** | Definición de columnas (campo, formato, render personalizado, sticky, etc.). |
| `columnDef?` | `ColumnDef[]` | `[]` | Reglas por columna (visibilidad inicial, clases CSS, ordenable, sticky). |
| `rowDef?` | `RowDef<T>` | `undefined` | Eventos sobre las filas (`onClick`, `onDoubleClick`). |
| `pagging?` | `boolean` | `true` | Habilita o deshabilita los controles de paginación tradicionales. |
| `info?` | `boolean` | `true` | Muestra el texto informativo de registros (ej. *"Mostrando 1 a 10 de 50 registros"*). |
| `searching?` | `boolean` | `true` | Muestra el campo de búsqueda rápida con debounce automático (300ms). |
| `lengthMenu?` | `(number \| LengthMenu)[]` | `[5, 10, 20, 40, 100]` | Opciones de registros por página disponibles en el selector desplegable. |
| `order?` | `([number, 'ASC'\|'DESC'\|1\|-1] \| OrderTable)[]` | `[]` | Ordenamiento inicial de columnas. |
| `multiple_order?` | `boolean` | `true` | Permite ordenar por múltiples columnas simultáneamente manteniendo presionada la tecla Shift o haciendo clics sucesivos. |
| `columnVisibility?` | `boolean` | `true` | Muestra el botón desplegable en la barra de herramientas para seleccionar qué columnas mostrar (solo en modo tabla). |
| `stickyHeader?` | `boolean` | `true` | Mantiene el encabezado `<thead>` completo fijo en la parte superior (`top: 0`) al hacer scroll vertical. |
| `maxHeight?` | `string \| number` | `undefined` | Altura máxima del contenedor de la tabla con scroll vertical automático (`overflow-y: auto`), ideal para sticky header. |
| `infiniteScroll?` | `boolean \| 'auto' \| 'manual'` | `false` | Activa el Scroll Infinito. Desactiva automáticamente la paginación tradicional. |
| `infiniteScrollMode?` | `'auto' \| 'manual'` | `'auto'` | Modo de scroll infinito: `'manual'` (botón centrado *"Cargar más datos"*) o `'auto'` (append continuo vía `IntersectionObserver`). |
| `infiniteScrollButtonText?`| `string` | `'Cargar más datos'` | Texto personalizado para el botón en modo scroll infinito manual. |
| `cardsRender?` | `boolean \| 'auto'` | `false` | Visualización en tarjetas. Con `'auto'` muestra un selector conmutador entre Tabla y Tarjetas. |
| `cardsPerRow?` | `number` | `1` | Número de tarjetas por fila en modo cards (CSS Grid responsivo). |
| `cardsClassName?` | `string` | `""` | Clases CSS adicionales aplicadas a cada tarjeta. |
| `renderCard?` | `(data: T, rowIndex: number) => React.ReactNode` | `undefined` | Función personalizada para renderizar el contenido completo de cada tarjeta (layout libre). |
| `tableId?` | `string` | `undefined` | Identificador único de la tabla para persistencia con Redux y SessionStorage. |
| `store?` | `unknown` | `undefined` | Instancia de Redux Store para activar la persistencia automática de estado. |
| `restoreScroll?` | `boolean` | `true` | Si se pasa `store` y `tableId`, restaura la posición exacta de scroll de la ventana al refrescar. |
| `stateRefresh?` | `[boolean, React.Dispatch<React.SetStateAction<boolean>>]` | `undefined` | Gatillo reactivo para forzar la recarga de datos externamente. |

---

## 📌 Thead Sticky Completo y Columnas Fijas Apiladas (`stickyHeader` y `sticky: true`)

El Datatable cuenta con soporte integral de fijación bidireccional (2D Sticky):

### 1. Thead Completo Sticky (`stickyHeader={true}`)
Por defecto (`stickyHeader: true`), la cabecera completa `<thead>` (y todas sus celdas `<th>`) permanece fijada en la parte superior (`top: 0`) durante el desplazamiento vertical. Si defines `maxHeight` (ej. `maxHeight="400px"` o `maxHeight={500}`), el contenedor activa automáticamente el scroll vertical interno sin salirse del área visual.

### 2. Columnas Fijas Apiladas en Pila (`sticky: true`)
Puedes fijar una o múltiples columnas a la izquierda agregando `sticky: true` en la definición de la columna o en `columnDef`.

Cuando varias columnas consecutivas son fijas, **se apilan sucesivamente en forma de pila**, calculando de forma automática los anchos y desplazamientos horizontales (`left`) acumulados:

```tsx
const columns: Column<Producto>[] = [
    {
        fieldName: 'id',
        sticky: true, // Columna 1 fija en left: 0px
    },
    {
        fieldName: 'title',
        sticky: true, // Columna 2 fija en left: width(Columna 1)
    },
    {
        fieldName: 'category', // Se desplaza libremente por debajo del bloque sticky
    },
    {
        fieldName: 'price',
        format: 'currency',
    },
    {
        fieldName: 'stock',
    },
];

<Datatable<Producto>
    control="front"
    data={productos}
    headers={['ID', 'Producto', 'Categoría', 'Precio', 'Stock']}
    columns={columns}
    stickyHeader={true} // Thead fijo al hacer scroll vertical (por defecto: true)
    maxHeight="400px"   // Scroll vertical contenido en la tabla
/>
```

* **Intersección de Esquinas (2D)**: Las celdas de cabecera de las columnas fijas se mantienen ancladas tanto vertical (`top: 0`) como horizontalmente (`left: Xpx`), con `z-index: 30` para que nunca queden debajo de otras celdas al desplazarse en cualquier dirección.
* **Separador Visual Automático**: La última columna fija proyecta automáticamente un borde y sombra divisoria para separar con claridad las columnas fijadas del contenido desplazable.
* **Fondos Opacos**: Encabezados y celdas sticky disponen de fondos sólidos en temas claro (`bg-slate-100`) y oscuro (`dark:bg-slate-800`), garantizando que las filas desplazables nunca se transparenten por debajo.

---

## 👁️ Selector de Columnas Visibles (`columnVisibility`)

Permite al usuario marcar y desmarcar en tiempo real qué columnas desea visualizar mediante un menú desplegable accesible en la barra superior:

```tsx
<Datatable<Producto>
    control="front"
    data={productos}
    headers={['ID', 'Producto', 'Categoría', 'Precio', 'Stock']}
    columns={columns}
    columnVisibility={true} // Habilita el menú desplegable (por defecto: true)
/>
```

* **Exclusividad en Modo Tabla**: El botón se despliega automáticamente en modo tabla y **se oculta cuando se cambia a la vista de tarjetas (Cards)**.
* **Control de Seguridad**: Impide desmarcar la última columna visible para mantener la integridad de la interfaz.

---

## ♾️ Scroll Infinito (`infiniteScroll`)

El Datatable incluye soporte nativo para **Scroll Infinito** con carga incremental tipo `append`.

> ⚠️ **Regla de Exclusión:** Cuando el scroll infinito está activo (`infiniteScroll={true}` o `'auto'` o `'manual'`), **la paginación tradicional queda automáticamente inhabilitada**.

### 1. Modo Manual (Botón Centrado)

Presenta un botón centrado al pie de los resultados que solicita el siguiente bloque y lo anexa a la tabla o tarjetas:

```tsx
<Datatable<Producto>
    control="front" // o "back"
    data={productos}
    headers={['Título', 'Precio', 'Stock']}
    columns={columns}
    lengthMenu={[10]} // Tamaño de cada lote de append
    infiniteScroll="manual"
    infiniteScrollButtonText="Cargar más productos"
    info={true}
/>
```

### 2. Modo Automático (IntersectionObserver)

Detecta el desplazamiento hacia el final del contenedor y anexa de forma fluida el siguiente lote:

```tsx
<Datatable<Producto>
    control="front"
    data={productos}
    headers={['Título', 'Precio', 'Stock']}
    columns={columns}
    lengthMenu={[10]}
    infiniteScroll="auto" // o simplemente infiniteScroll={true}
/>
```

Tanto en frontend como en backend, si el usuario escribe en el buscador o cambia el ordenamiento de columnas, la tabla reinicia la página a 0 y carga los nuevos resultados de forma segura.

---

## 🎛️ Modo “Backend Controlled” (`control="back"`)

Ideal cuando los datos se consultan de un servidor paginado mediante una API REST:

```tsx
<Datatable<Producto>
    control="back"
    headers={['Título', 'Categoría', 'Precio', 'Calificación', 'Fecha']}
    footers={['Título', 'Categoría', 'Precio', 'Calificación', 'Fecha']}
    columns={[
        { fieldName: 'title' },
        { fieldName: 'category' },
        { fieldName: 'price', format: 'currency' },
        { fieldName: 'rating.rate' },
        { fieldName: 'createdAt', format: 'datetime', formatOptions: { locale: es } },
    ]}
    columnDef={[{ target: 2, classname: 'text-right' }]}
    lengthMenu={[5, 10, 25, 50]}
    order={[[0, 'ASC']]}
    getData={async (page, records, queryColumns, orderValue, search) => {
        const sortCol = orderValue?.[0]?.[0] ?? 0;
        const sortDir = orderValue?.[0]?.[1] ?? 'ASC';
        const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';

        const resp = await fetch(
            `/api/products?page=${page + 1}&limit=${records}&order=${sortCol}&sort=${sortDir}${searchParam}`
        );
        const { data, pagination } = await resp.json();

        return {
            rows: data,
            page: pagination.page - 1, // 0-indexed
            records: pagination.limit,
            count: pagination.total,
        };
    }}
/>
```

---

## 🎛️ Modo “Frontend Controlled” (`control="front"`)

Ideal cuando ya tienes la colección completa de datos cargada en memoria:

```tsx
const [productos, setProductos] = useState<Producto[]>([]);

<Datatable<Producto>
    control="front"
    headers={['Título', 'Categoría', 'Precio', 'Calificación']}
    columns={[
        { fieldName: 'title' },
        { fieldName: 'category' },
        { fieldName: 'price', format: 'currency' },
        { fieldName: 'rating.rate' },
    ]}
    data={[productos, setProductos]} // o simplemente [productos] si es de solo lectura
    multiple_order={true}
    lengthMenu={[5, 10, 20]}
/>
```

- Filtra en memoria con tolerancia a acentos y diacríticos (ej. busca `cancion` y encuentra `Canción`).
- La paginación calcula cortes exactos sin desfases de índices.

---

## 🃏 Modo Tarjetas (Cards) y Alternancia Dinámica

### 1. Alternancia Dinámica (`cardsRender="auto"`)

Muestra un botón selector en la barra superior con opciones para **Tabla** y **Tarjetas**:

```tsx
<Datatable<Producto>
    cardsRender="auto"
    cardsPerRow={3} // 3 columnas de tarjetas en grid responsivo
    cardsClassName="shadow-sm rounded-xl p-4 bg-white dark:bg-slate-800"
    {...otrasProps}
/>
```

### 2. Plantilla Personalizada (`renderCard`) y `hideCardLabel`

Permite diseñar un layout a medida para la tarjeta o suprimir etiquetas en columnas destacadas:

```tsx
const columns: Column<Producto>[] = [
    {
        fieldName: 'title',
        hideCardLabel: true, // Oculta "Título:" para renderizarlo como encabezado hero
        renderFn: (item) => (
            <div className="flex items-center gap-3">
                <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
                    <span className="text-xs text-slate-400">{item.brand}</span>
                </div>
            </div>
        ),
    },
    {
        fieldName: 'price',
        format: 'currency',
    },
];
```

---

## 🌟 Persistencia con Redux Toolkit & SessionStorage

Al proporcionar las props `store` y `tableId`, el Datatable activa automáticamente la persistencia del estado:

1. **¿Qué recupera al refrescar el navegador (F5)?**
   - El texto buscado en el buscador.
   - La página en la que se encontraba el usuario.
   - La cantidad de registros por página seleccionada.
   - El ordenamiento de las columnas.
   - La vista seleccionada (`table` o `cards`).
   - Las **columnas visibles personalizadas** (`visibleColumns`), recordando en tiempo real qué columnas ocultó o activó el usuario mediante el selector dinámico.
   - La posición exacta del scroll en la ventana (`restoreScroll`).

### Paso 1: Configurar el reducer en tu Redux Store

```ts
import { configureStore } from '@reduxjs/toolkit';
import { datatableReducer } from '@luix_eduard/datatable';

export const store = configureStore({
    reducer: {
        datatable: datatableReducer,
    },
});
```

### Paso 2: Pasar `store` y `tableId` al componente

```tsx
<Datatable<Producto>
    control="front"
    tableId="tabla-inventario"
    store={store}
    restoreScroll={true}
    cardsRender="auto"
    headers={['Título', 'Categoría', 'Precio']}
    columns={columns}
    data={[productos]}
/>
```

---

## 🧩 Componentes Modulares Exportados

Si deseas construir una interfaz personalizada o componer tus propios bloques, la librería exporta cada componente atómico:

```tsx
import {
    TableToolbar,
    TableSearch,
    TableViewToggle,
    TableColumnVisibility,
    TableHead,
    TableBody,
    TableFoot,
    CardsView,
    TablePaginationBar,
    TablePagination,
    TablePageSize,
    TableInfo,
    TableInfiniteScroll,
    useDatatable,
    useStickyColumns,
} from '@luix_eduard/datatable';
```

---

## 🔍 Detalle de Tipos Auxiliares

### `Column<T>`

```ts
export type Column<T> = {
    fieldName?: NestedKey<T> | keyof T | null;
    orderValue?: NestedKey<T> | keyof T | null;
    renderFn?: (data: T, row?: T) => React.ReactNode;
    format?: 'currency' | 'decimal' | 'percent' | 'unit' | 'date' | 'datetime' | ((value: unknown) => string);
    formatOptions?: Intl.NumberFormatOptions | FormatOptions;
    hideCardLabel?: boolean;
    sticky?: boolean;
};
```

- **`fieldName`**: Soporta rutas anidadas con tipado seguro de TypeScript (ej. `"rating.rate"`).
- **`format`**: Formateo automático de divisas, porcentajes, unidades y fechas vía `Intl` o `date-fns`.
- **`renderFn`**: Renderizado completamente personalizado de la celda.
- **`sticky`**: Mantiene la columna fija en scroll horizontal (apilada en cascada).
- **`hideCardLabel`**: Suprime la etiqueta automática en modo tarjetas.

---

## 🛠️ Historias en Storybook

Para explorar todas las variantes interactivamente:

```bash
npm run storybook
```

Secciones disponibles:
- **Vista Principal**: Tablas con control `front`, `back` y persistencia Redux.
- **Tarjetas (Cards)**: Grid con plantillas personalizadas y conmutador `cardsRender="auto"`.
- **Scroll Infinito**: Demostraciones en modo `manual` (botón centrado) y `auto` (scroll fluido) en tabla y tarjetas.
- **Columnas y Sticky**: Demostraciones de columnas sticky apiladas en cascada y selector interactivo de visibilidad.

---

## 📄 Licencia

MIT © [luixeduard](https://github.com/luixeduard)
