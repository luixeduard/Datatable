
# React Datatable (TypeScript)

Componente de tabla basado en [DataTables.net](https://datatables.net/) para React y TypeScript, que soporta tanto paginación/control “backend” como control “frontend”.

---

## 📦 Instalación

```bash
`npm i @luix_eduard/datatable`
# o con yarn
yarn add @luix_eduard/datatable
```
---

## 🚀 Uso Básico

### Importar el componente

```tsx
import Datatable from '@luix_eduard/datatable';
import type { DatatableType } from '@luix_eduard/datatable';
```
### Definir tu tipo de dato

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

El componente exporta dos modos de control:

1. **Backend-controlled** (`control="back"`)  
2. **Frontend-controlled** (`control="front"`)

Ambos comparten las props comunes:

| Prop            | Tipo                                                                                         | Descripción                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `headers`       | `string[] | Headers[][]`                                                                    | Encabezados de columnas. Puede ser un array plano o matriz para múltiples filas de encabezado. |
| `footers?`      | `string[] | Headers[][]`                                                                    | Pie de tabla. Igual estructura que `headers`.                                               |
| `columns`       | `Column<T>[]`                                                                                | Definición de cada columna (campo, formato, render, etc.).                                   |
| `columnDef?`    | `ColumnDef[]`                                                                                | Opciones de configuración de DataTables (visibilidad, orden, clase CSS, etc.).              |
| `pagging?`      | `boolean`                                                                                    | Mostrar controles de paginación.                                                            |
| `info?`         | `boolean`                                                                                    | Mostrar información de registros.                                                           |
| `searching?`    | `boolean`                                                                                    | Habilitar búsqueda interna.                                                                 |
| `saveState?`    | `boolean`                                                                                    | Guardar estado (página, orden, búsqueda) en localStorage.                                    |
| `lengthMenu?`   | `(number | LengthMenu)[]`                                                                   | Opciones de número de filas por página.                                                     |
| `order?`        | `([number, 'ASC'|'DESC'|1|-1] | OrderTable)[]`                                               | Orden por defecto: índice de columna y dirección.                                           |
| `multiple_order?` | `boolean`                                                                                  | Permitir múltiples columnas de orden.                                                       |
| `stateRefresh?` | `[boolean, React.Dispatch<React.SetStateAction<boolean>>]`                                   | Forzar refresco manual.                                                                     |

---

### 🎛️ Modo “Backend Controlled”

Uso cuando los datos se obtienen de un servidor paginado:

```tsx
<Datatable<Producto>
  control="back"
  headers={['Título', 'Categoría', 'Precio', 'Fecha']}
  footers={['Título', 'Categoría', 'Precio', 'Fecha']}
  columns={[
    { fieldName: 'title' },
    { fieldName: 'category' },
    { fieldName: 'price', format: 'currency' },
    { fieldName: 'createdAt', format: 'datetime', formatOptions: { locale: es } },
  ]}
  columnDef={[{ target: 2, classname: 'text-right' }]}
  lengthMenu={[5, 10, 25, { label: 'Todos', value: -1 }]}
  order={[[0, 'ASC']]}
  getData={async (page, records, columns, orderValue, search) => {
    const resp = await fetch(`/api/products?page=${page + 1}&limit=${records}&sort=${orderValue[0][1]}`);
    const { data, pagination } = await resp.json();
    return {
      rows: data.map((p: Producto) => ({ ...p, createdAt: new Date(p.createdAt) })),
      page: pagination.page - 1,
      records: pagination.limit,
      count: pagination.total
    };
  }}
/>
```

- **`getData`** debe devolver un objeto `{ rows, page, records, count }` de tipo `Promise<Data<T>>`.

---

### 🎛️ Modo “Frontend Controlled”

Uso cuando ya tienes todos los datos cargados en memoria:

```tsx
const [productos, setProductos] = useState<Producto[]>([]);

<Datatable<Producto>
  control="front"
  headers={['Título', 'Categoría', 'Precio', 'Fecha']}
  columns={[
    { fieldName: 'title' },
    { fieldName: 'category' },
    { fieldName: 'price', format: 'currency' },
    { fieldName: 'createdAt', format: 'datetime', formatOptions: { locale: es } },
  ]}
  data={[productos, setProductos]}  // ó simplemente [productos] si no necesitas modificar
  multiple_order={false}
/>
```

- Pasas **`data`** como `[rows]` o `[rows, setRows]`.
- **No** se usa `getData` en este modo.

---

## 🔍 Detalle de Tipos Auxiliares

### `Column<T>`

```ts
export type Column<T> = {
  fieldName: NestedKey<T> | keyof T | null;
  orderValue?: NestedKey<T> | keyof T | null;
  renderFn?: (data: any) => any;
  format?: FormatType<T>;
  formatOptions?: Intl.NumberFormatOptions | FormatOptions;
}
```

- **`fieldName`**: Ruta al dato (incluye claves anidadas con ‘.’).
- **`orderValue`**: Campo para orden (por defecto igual a \`fieldName\`).
- **`renderFn`**: Función de render personalizado.
- **`format`**: Tipo de formato (`currency`, `decimal`, `percent`, `unit`, `date`, `datetime` o función).
- **`formatOptions`**: Opciones de `Intl.NumberFormat` o `date-fns` (`FormatOptions`).

### `NestedKey<T>`

Permite referenciar propiedades anidadas con cadenas tipo `"rating.rate"`.


## ❓ Preguntas y respuestas

¿Como obtener las propiedades de columna?
```
type Props = React.ComponentProps<typeof Datatable<User>>;
type ColumnType = Props['columns'];
```

## 📄 Licencia

MIT © [luixeduard]
