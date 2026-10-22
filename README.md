# React Datatable (TypeScript)

Componente de tabla avanzado para React y TypeScript inspirado en [DataTables.net](https://datatables.net/), compatible con **TailwindCSS** y modo oscuro. Soporta control tanto en **Backend** (paginado en servidor) como en **Frontend** (en memoria), visualización en **Tarjetas (Cards)** con toggle automático y **persistencia opcional con Redux Toolkit & SessionStorage**.

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
> `@reduxjs/toolkit` y `react-redux` son **peerDependencies opcionales**. Si tu proyecto no utiliza Redux, la librería funciona perfectamente sin necesidad de instalarlos y sin generar errores de compilación.

---

## 🚀 Uso Básico

### 1. Importar el componente y estilos

```tsx
import Datatable from '@luix_eduard/datatable';
import '@luix_eduard/datatable/dist/index.css';
import type { DatatableType } from '@luix_eduard/datatable';
```

### 2. Definir tu modelo de datos

```ts
interface Producto {
  id: number;
  title: string;
  price: number;
  category: string;
  rating: { rate: number; count: number };
  createdAt: Date;
}
```

---

## 🧩 Props Principales (`DatatableType<T>`)

El componente opera en dos modos según el valor de `control`:
1. **Backend-controlled** (`control="back"`)
2. **Frontend-controlled** (`control="front"`)

### Tabla de Props Comunes:

| Prop | Tipo | Por Defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `headers` | `string[] \| Headers[][]` | **Requerido** | Encabezados de columnas. Admite array simple o matriz para filas con `colspan`/`rowspan`. |
| `footers?` | `string[] \| Headers[][]` | `undefined` | Pie de tabla opcional. Misma estructura que `headers`. |
| `columns` | `Column<T>[]` | **Requerido** | Definición de columnas (campo, formato, render personalizado). |
| `columnDef?` | `ColumnDef[]` | `[]` | Reglas por columna (visibilidad, clases CSS, ordenamiento deshabilitado). |
| `rowDef?` | `RowDef<T>` | `undefined` | Eventos sobre las filas (`onClick`, `onDoubleClick`). |
| `pagging?` | `boolean` | `true` | Habilita o deshabilita los controles de paginación. |
| `info?` | `boolean` | `true` | Muestra el texto informativo de registros (ej. "Mostrando 1 a 10 de 50 registros"). |
| `searching?` | `boolean` | `true` | Muestra el campo de búsqueda rápida con debounce automático (300ms). |
| `lengthMenu?` | `(number \| LengthMenu)[]` | `[5, 10, 20, 40, 100]` | Opciones de registros por página disponibles en el selector. |
| `order?` | `([number, 'ASC'\|'DESC'\|1\|-1] \| OrderTable)[]` | `[]` | Ordenamiento inicial de columnas. |
| `multiple_order?` | `boolean` | `true` | Permite ordenar por múltiples columnas simultáneamente. |
| `cardsRender?` | `boolean \| 'auto'` | `false` | Visualización en tarjetas. Con `'auto'` muestra un botón selector en la esquina superior derecha. |
| `cardsPerRow?` | `number` | `1` | Número de tarjetas por fila en modo cards. |
| `cardsClassName?` | `string` | `""` | Clases CSS adicionales aplicadas a cada tarjeta. |
| `tableId?` | `string` | `undefined` | Identificador único de la tabla para persistencia con Redux. |
| `store?` | `unknown` | `undefined` | Instancia de Redux Store para activar la persistencia del estado. |
| `restoreScroll?` | `boolean` | `true` | Si se pasa `store` y `tableId`, restaura la posición exacta de scroll de la ventana al refrescar. |
| `stateRefresh?` | `[boolean, React.Dispatch<React.SetStateAction<boolean>>]` | `undefined` | Gatillo para forzar la recarga de datos externamente. |

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
  getData={async (page, records, columns, orderValue, search) => {
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

> **Nota:** La función `getData` se ejecuta automáticamente con debounce al escribir en el buscador y previene estados bloqueados de carga ante cancelaciones o errores.

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

## 🌟 Persistencia con Redux Toolkit & SessionStorage

Al proporcionar las props `store` y `tableId`, el Datatable activa automáticamente la persistencia del estado:

1. **¿Qué recupera al refrescar el navegador (F5)?**
   - El texto que el usuario había buscado.
   - La página en la que se encontraba.
   - La cantidad de registros por página seleccionada.
   - El ordenamiento de las columnas.
   - La vista seleccionada (`table` o `cards` cuando `cardsRender="auto"`).
   - La **posición exacta del scroll** en la ventana (`restoreScroll`).

### Paso 1: Configurar el reducer en tu Redux Store

```ts
import { configureStore } from '@reduxjs/toolkit';
import { datatableReducer } from '@luix_eduard/datatable';

export const store = configureStore({
  reducer: {
    // Es importante asignarlo a la clave 'datatable'
    datatable: datatableReducer,
    // tus otros reducers...
  },
});
```

### Paso 2: Pasar `store` y `tableId` al componente

```tsx
import { store } from './store';

<Datatable<Producto>
  control="front"
  tableId="tabla-inventario-productos" // Identificador único por tabla
  store={store}                        // Instancia del store
  restoreScroll={true}                 // Restaura el scroll automáticamente
  cardsRender="auto"                   // Guarda también si estaba en tabla o tarjetas
  headers={['Título', 'Categoría', 'Precio']}
  columns={[
    { fieldName: 'title' },
    { fieldName: 'category' },
    { fieldName: 'price', format: 'currency' },
  ]}
  data={[productos]}
/>
```

### Acciones disponibles:

```ts
import { resetTableState, clearAllTablesState } from '@luix_eduard/datatable';

// Reiniciar el estado guardado de una tabla en específico
dispatch(resetTableState({ tableId: 'tabla-inventario-productos' }));

// Limpiar el estado de todas las tablas
dispatch(clearAllTablesState());
```

---

## 🃏 Modo Tarjetas (Cards) y Alternancia Dinámica

El Datatable permite renderizar los registros como tarjetas o permitir que el usuario elija su vista preferida:

### 1. Alternancia Automática (`cardsRender="auto"`)

Muestra un botón selector en la esquina superior derecha con opciones para **Tabla** y **Tarjetas**:

```tsx
<Datatable<Producto>
  cardsRender="auto"
  cardsPerRow={3} // 3 columnas de tarjetas en pantallas medianas/grandes
  cardsClassName="shadow-md rounded-xl p-4 bg-white dark:bg-gray-800"
  {...otrasProps}
/>
```

### 2. Modo Tarjetas Fijo (`cardsRender={true}`)

Renderiza siempre en tarjetas con CSS Grid responsivo:

```tsx
<Datatable<Producto>
  cardsRender={true}
  cardsPerRow={2}
  {...otrasProps}
/>
```

---

## 🔍 Detalle de Tipos Auxiliares

### `Column<T>`

```ts
export type Column<T> = {
  fieldName: NestedKey<T> | keyof T | null;
  orderValue?: NestedKey<T> | keyof T | null;
  renderFn?: (data: T) => React.ReactNode;
  format?: 'currency' | 'decimal' | 'percent' | 'unit' | 'date' | 'datetime' | ((value: unknown) => React.ReactNode);
  formatOptions?: Intl.NumberFormatOptions | FormatOptions;
};
```

- **`fieldName`**: Permite rutas anidadas con soporte seguro de TypeScript (ej. `"rating.rate"`).
- **`format`**: Aplica formateo automático según el locale de `Intl` o `date-fns`.
- **`renderFn`**: Función para personalizar completamente el contenido de la celda.

---

## 🛠️ Desarrollo y Storybook

Para visualizar y probar todos los casos de uso interactivamente:

```bash
npm run storybook
```

Casos incluidos en Storybook:
- **Modo Backend (Paginado en Servidor)**
- **Modo Frontend (En Memoria)**
- **Frontend con Persistencia Redux Toolkit**
- **Vista Dinámica (Tabla / Tarjetas)**

---

## 📄 Licencia

MIT © [luixeduard](https://github.com/luixeduard)
