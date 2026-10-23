import type React from 'react';
import type { Column, Headers } from '../Datatable.type';
import type { StickyColumnInfo } from '../hooks/use-sticky-columns';

export interface ColumnFilterItem {
    target: number;
    visible?: boolean;
    searchable?: boolean;
    orderable?: boolean;
    sticky?: boolean;
    classname?: string;
}

export interface TableHeadProps<T> {
    headers: string[] | Headers[][];
    columns: Column<T>[];
    filters: ColumnFilterItem[];
    filterColumn: (col: Column<T>, index: number) => boolean;
    orderCol: [number, -1 | 'ASC' | 'DESC' | 1][];
    onToggleOrder: (index: number) => void;
    getStickyInfo?: (index: number) => StickyColumnInfo;
    stickyHeader?: boolean;
}

/**
 * Encabezado de la tabla (<thead>) con soporte para ordenamiento, cabeceras avanzadas, thead sticky y columnas fijas (sticky).
 *
 * @param { TableHeadProps<T> } props Propiedades de cabecera, columnas, estado de orden, stickyHeader y columnas sticky.
 * @returns { React.ReactNode } Elemento thead con celdas, flechas de ordenación y sticky apilado.
 * @author @luixeduard
 */
export default function TableHead<T>({
    headers,
    columns,
    filters,
    filterColumn,
    orderCol,
    onToggleOrder,
    getStickyInfo,
    stickyHeader = true,
}: TableHeadProps<T>): React.ReactNode {
    const advancedHeaders = headers.every((header) => typeof header !== 'string');

    function getHeaderStickyProps(index: number) {
        const stickyInfo = getStickyInfo?.(index);
        const isSticky = Boolean(stickyInfo?.isSticky);
        const stickyStyle: React.CSSProperties = {
            ...(stickyHeader ? { position: 'sticky', top: 0 } : {}),
            ...(isSticky
                ? { position: 'sticky', left: `${stickyInfo?.left ?? 0}px`, zIndex: 30 }
                : stickyHeader
                  ? { zIndex: 20 }
                  : {}),
        };
        const stickyClass = isSticky
            ? `sticky bg-slate-100 dark:bg-slate-800 ${
                  stickyInfo?.isLastSticky
                      ? 'border-r border-slate-300 dark:border-slate-700 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[3px_0_5px_-2px_rgba(0,0,0,0.4)]'
                      : ''
              }`
            : (stickyHeader ? 'sticky bg-slate-100 dark:bg-slate-800' : '');

        return { stickyStyle, stickyClass };
    }

    function renderOrderIcon(index: number) {
        const find = orderCol.find((ord) => ord[0] === index);
        const orderDir = find?.[1];
        if (!find || !orderDir) return null;

        const isAsc = orderDir === 'ASC' || orderDir === 1;

        return (
            <svg
                className="w-3.5 h-3.5 ms-1 inline-block shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
            >
                {isAsc ? (
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M12 5l-4 4M12 5l4 4"
                    />
                ) : (
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M12 19l-4-4M12 19l4-4"
                    />
                )}
            </svg>
        );
    }

    return (
        <thead
            className={`datatable-thead text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 ${
                stickyHeader ? 'sticky top-0 z-20' : ''
            }`}
        >
            {!advancedHeaders ? (
                <tr>
                    {(headers as string[]).map((head, index) => {
                        const col = columns[index];
                        if (!col || !filterColumn(col, index)) return null;
                        const isOrderable = filters[index]?.orderable;
                        const { stickyStyle, stickyClass } = getHeaderStickyProps(index);

                        return (
                            <th
                                scope="col"
                                style={stickyStyle}
                                className={`datatable-th px-6 py-3.5 text-left font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700 ${stickyClass} ${
                                    isOrderable
                                        ? 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer select-none transition-colors'
                                        : ''
                                }`}
                                {...(isOrderable && { onClick: () => onToggleOrder(index) })}
                                key={`th-${index}`}
                            >
                                <span className="flex items-center gap-1">
                                    {head}
                                    {renderOrderIcon(index)}
                                </span>
                            </th>
                        );
                    })}
                </tr>
            ) : (
                <>
                    {(headers as Headers[][]).map((headerRow, rowIndex) => (
                        <tr key={`header-row-${rowIndex}`}>
                            {headerRow.map((header, index) => {
                                const isOrderable = filters[index]?.orderable;
                                const { stickyStyle, stickyClass } = getHeaderStickyProps(index);

                                return (
                                    <th
                                        key={`th-adv-${rowIndex}-${index}`}
                                        rowSpan={header.rowspan}
                                        colSpan={header.colspan}
                                        scope="col"
                                        style={stickyStyle}
                                        className={`datatable-th px-6 py-3.5 text-left font-semibold tracking-wider border-b border-slate-200 dark:border-slate-700 ${stickyClass} ${
                                            isOrderable
                                                ? 'hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer select-none transition-colors'
                                                : ''
                                        }`}
                                        {...(isOrderable && { onClick: () => onToggleOrder(index) })}
                                    >
                                        <span className="flex items-center gap-1">
                                            {header.label}
                                            {renderOrderIcon(index)}
                                        </span>
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </>
            )}
        </thead>
    );
}
