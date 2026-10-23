import type { Column, ColumnDef, NestedKey } from '../Datatable.type';
import type { ColumnFilterItem } from '../components/table-head';
import { getNestedValue, getValue, limpiarString } from './datatable-helper';

/**
 * Obtiene el valor booleano configurado en `columnDef` para una clave específica.
 *
 * @param { ColumnDef[] | undefined } columnDef Definición de columnas.
 * @param { number } index Índice de la columna.
 * @param { keyof ColumnDef } key Propiedad a consultar.
 * @returns { boolean } Valor resuelto o true por defecto.
 * @author @luixeduard
 */
export function getValueColumnDef(
    columnDef: ColumnDef[] | undefined,
    index: number,
    key: keyof ColumnDef,
): boolean {
    if (!columnDef) return key === 'sticky' ? false : true;
    const filter = columnDef.find((c) => {
        if (!(key in c)) return false;
        const matchesTarget = 'target' in c && (c.target === index || c.target === '_all');
        const matchesTargets = 'targets' in c && Array.isArray(c.targets) && c.targets.includes(index);
        return matchesTarget || matchesTargets;
    });
    if (!filter || filter[key] === undefined) return key === 'sticky' ? false : true;
    return Boolean(filter[key]);
}

/**
 * Construye la lista de metadatos de filtrado, visibilidad y clases para cada columna.
 *
 * @param { number } columnsCount Total de columnas.
 * @param { ColumnDef[] | undefined } columnDef Definición personalizada de columnas.
 * @returns { ColumnFilterItem[] } Matriz de filtros por columna.
 * @author @luixeduard
 */
export function calculateColumnFilters(
    columnsCount: number,
    columnDef?: ColumnDef[],
): ColumnFilterItem[] {
    return new Array(columnsCount).fill(null).map((_c, index) => {
        const visible = !columnDef ? true : getValueColumnDef(columnDef, index, 'visible');
        const searchable = !columnDef ? true : getValueColumnDef(columnDef, index, 'searchable');
        const orderable = !columnDef ? true : getValueColumnDef(columnDef, index, 'orderable');
        const sticky = !columnDef ? false : getValueColumnDef(columnDef, index, 'sticky');

        const classname = !columnDef
            ? undefined
            : columnDef
                  .filter(
                      (c) =>
                          c.classname &&
                          c.classname.length > 0 &&
                          (c.target === '_all' ||
                              (c.target != null && c.target === index) ||
                              (c.targets != null && c.targets.includes(index))),
                  )
                  .map((c) => c.classname)
                  .join(' ');

        return {
            target: index,
            visible,
            searchable,
            orderable,
            sticky,
            classname: classname || undefined,
        };
    });
}

/**
 * Ordena en memoria la colección de datos para el modo front.
 *
 * @param { T[] } data Lista de registros.
 * @param { [number, -1 | 'ASC' | 'DESC' | 1][] } orderCol Columnas y direcciones de orden.
 * @param { Column<T>[] } columns Definición de columnas.
 * @returns { T[] } Nueva colección ordenada.
 * @author @luixeduard
 */
export function sortFrontData<T>(
    data: T[],
    orderCol: [number, -1 | 'ASC' | 'DESC' | 1][],
    columns: Column<T>[],
): T[] {
    if (!orderCol || orderCol.length === 0) return data;

    return [...data].sort((itemA, itemB) => {
        for (const [indexCol, orderDir] of orderCol) {
            const col = columns[indexCol];
            if (!col) continue;
            const keyPath = (col.fieldName || col.orderValue) as string;
            if (!keyPath) continue;

            const valueA = getNestedValue(itemA, keyPath);
            const valueB = getNestedValue(itemB, keyPath);

            if (valueA == null && valueB != null) return ['ASC', 1].includes(orderDir) ? -1 : 1;
            if (valueB == null && valueA != null) return ['ASC', 1].includes(orderDir) ? 1 : -1;
            if (valueA == null && valueB == null) continue;

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                const cmp = valueA.localeCompare(valueB);
                if (cmp !== 0) return ['ASC', 1].includes(orderDir) ? cmp : -cmp;
            }
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                const cmp = valueA - valueB;
                if (cmp !== 0) return ['ASC', 1].includes(orderDir) ? cmp : -cmp;
            }
            const dateA = valueA instanceof Date ? valueA : typeof valueA === 'string' ? new Date(valueA) : null;
            const dateB = valueB instanceof Date ? valueB : typeof valueB === 'string' ? new Date(valueB) : null;
            if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                const cmp = dateA.getTime() - dateB.getTime();
                if (cmp !== 0) return ['ASC', 1].includes(orderDir) ? cmp : -cmp;
            }
        }
        return 0;
    });
}

/**
 * Filtra en memoria los registros según el término de búsqueda ingresado.
 *
 * @param { T[] } data Lista de registros ordenados.
 * @param { string } debouncedSearch Término de búsqueda normalizado.
 * @param { Column<T>[] } columns Definición de columnas.
 * @param { ColumnFilterItem[] } filters Filtros por columna.
 * @returns { T[] } Lista de registros que coinciden con la búsqueda.
 * @author @luixeduard
 */
export function filterFrontData<T>(
    data: T[],
    debouncedSearch: string,
    columns: Column<T>[],
    filters: ColumnFilterItem[],
): T[] {
    const query = limpiarString(debouncedSearch);
    if (!query) return data;

    const searchableCols = columns
        .map((col, idx) => ({ col, idx }))
        .filter(({ idx }) => {
            const f = filters[idx];
            return !f || (f.searchable !== false && f.visible !== false);
        });

    return data.filter((row) => {
        return searchableCols.some(({ col }) => {
            const fieldName = col.fieldName;
            if (!fieldName) return false;
            const rawVal = String(fieldName).includes('.')
                ? getValue(row, fieldName as NestedKey<T>)
                : (row as Record<string, unknown>)[String(fieldName)];
            if (rawVal == null) return false;
            return limpiarString(rawVal).includes(query);
        });
    });
}

/**
 * Calcula el nuevo estado de ordenamiento al hacer clic en una columna.
 *
 * @param { [number, -1 | 'ASC' | 'DESC' | 1][] } current Orden actual.
 * @param { number } index Índice de la columna a ordenar.
 * @param { boolean } multipleOrder Si permite ordenamiento multicampo.
 * @returns { [number, -1 | 'ASC' | 'DESC' | 1][] } Nuevo arreglo de ordenamiento.
 * @author @luixeduard
 */
export function toggleColumnOrder(
    current: [number, -1 | 'ASC' | 'DESC' | 1][],
    index: number,
    multipleOrder = true,
): [number, -1 | 'ASC' | 'DESC' | 1][] {
    if (!multipleOrder) {
        if (current.length === 0 || current[0][0] !== index) {
            return [[index, 'ASC']];
        }
        if (current[0][1] === 'ASC' || current[0][1] === 1) {
            return [[index, 'DESC']];
        }
        return [];
    }
    const find = current.find((curr) => curr[0] === index);
    if (find) {
        const isAsc = [1, 'ASC'].includes(find[1]);
        if (isAsc) {
            return [...current.filter((curr) => curr[0] !== index), [index, 'DESC']];
        }
        return current.filter((curr) => curr[0] !== index);
    }
    return [...current, [index, 'ASC']];
}
