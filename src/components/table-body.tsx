import type React from 'react';
import type { Column, RowDef } from '../Datatable.type';
import type { ColumnFilterItem } from './table-head';
import type { StickyColumnInfo } from '../hooks/use-sticky-columns';

export interface TableBodyProps<T> {
    currentData: T[];
    columns: Column<T>[];
    filters: ColumnFilterItem[];
    filterColumn: (col: Column<T>, index: number) => boolean;
    loading: boolean;
    renderTd: (column: Column<T>, object: T) => React.ReactNode;
    rowDef?: RowDef<T>;
    getStickyInfo?: (index: number) => StickyColumnInfo;
}

/**
 * Cuerpo principal de la tabla (<tbody>) con soporte para estado de carga, sin datos, selección de filas y columnas sticky apiladas.
 *
 * @param { TableBodyProps<T> } props Propiedades de renderizado de filas, celdas y posicionamiento sticky.
 * @returns { React.ReactNode } Elemento tbody con filas renderizadas y columnas fijas.
 * @author @luixeduard
 */
export default function TableBody<T>({
    currentData,
    columns,
    filters,
    filterColumn,
    loading,
    renderTd,
    rowDef,
    getStickyInfo,
}: TableBodyProps<T>): React.ReactNode {
    const visibleColumnsCount = columns.filter((col, idx) => filterColumn(col, idx)).length;

    if (loading) {
        return (
            <tbody>
                <tr className="datatable-fade-enter">
                    <td colSpan={visibleColumnsCount}>
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div role="status">
                                <svg
                                    aria-hidden="true"
                                    className="inline w-8 h-8 text-slate-200 animate-spin dark:text-slate-700 fill-blue-600 dark:fill-blue-400"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <span className="sr-only">Cargando...</span>
                            </div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Cargando registros...
                            </span>
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (currentData.length === 0) {
        return (
            <tbody>
                <tr className="datatable-fade-enter border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td colSpan={visibleColumnsCount} className="p-8 text-center text-sm font-semibold text-slate-400">
                        SIN DATOS
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody className="datatable-tbody divide-y divide-slate-200/80 dark:divide-slate-700/80">
            {currentData.map((row, rowIndex) => {
                const record = row as Record<string, unknown> | null | undefined;
                const rowKey =
                    (record?._id as string | number | undefined) ??
                    (record?.id as string | number | undefined) ??
                    `tbody-row-${rowIndex}`;
                const staggerDelay = Math.min(rowIndex * 25, 250);

                return (
                    <tr
                        key={rowKey}
                        onDoubleClick={(evt) => rowDef?.onDoubleClick?.(evt, row)}
                        onClick={(evt) => rowDef?.onClick?.(evt, row)}
                        style={{ animationDelay: `${staggerDelay}ms` }}
                        className="datatable-row datatable-row-animated group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                        {columns.map((column, colIndex) => {
                            if (!filterColumn(column, colIndex)) return null;
                            const customClass = filters[colIndex]?.classname;

                            const stickyInfo = getStickyInfo?.(colIndex);
                            const isSticky = Boolean(stickyInfo?.isSticky);
                            const stickyStyle: React.CSSProperties = isSticky
                                ? { position: 'sticky', left: `${stickyInfo?.left ?? 0}px`, zIndex: 10 }
                                : {};
                            const stickyClass = isSticky
                                ? `sticky bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 ${
                                      stickyInfo?.isLastSticky
                                          ? 'border-r border-slate-300 dark:border-slate-700 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.08)] dark:shadow-[3px_0_5px_-2px_rgba(0,0,0,0.35)]'
                                          : ''
                                  }`
                                : '';

                            return (
                                <td
                                    key={`td-${colIndex}`}
                                    style={stickyStyle}
                                    className={`datatable-td px-6 py-4 text-sm text-slate-700 dark:text-slate-300 ${stickyClass} ${customClass ?? ''}`}
                                >
                                    {renderTd(column, row)}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
}
