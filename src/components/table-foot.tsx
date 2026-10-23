import type React from 'react';
import type { Column, Headers } from '../Datatable.type';
import type { StickyColumnInfo } from '../hooks/use-sticky-columns';

export interface TableFootProps<T> {
    footers?: string[] | Headers[][];
    columns: Column<T>[];
    filterColumn: (col: Column<T>, index: number) => boolean;
    getStickyInfo?: (index: number) => StickyColumnInfo;
}

/**
 * Pie de la tabla (<tfoot>) con soporte para footers simples o estructurados en matriz y sticky apilado.
 *
 * @param { TableFootProps<T> } props Columnas, pie de página, filtro de visibilidad y sticky.
 * @returns { React.ReactNode } Elemento tfoot o null si no se configuran footers.
 * @author @luixeduard
 */
export default function TableFoot<T>({
    footers,
    columns,
    filterColumn,
    getStickyInfo,
}: TableFootProps<T>): React.ReactNode {
    if (!footers || footers.length === 0) {
        return null;
    }

    const advancedFooters = footers.every((header) => typeof header !== 'string');

    return (
        <tfoot className="datatable-tfoot text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            {!advancedFooters ? (
                <tr>
                    {(footers as string[]).map((foot, index) => {
                        const col = columns[index];
                        if (!col || !filterColumn(col, index)) return null;

                        const stickyInfo = getStickyInfo?.(index);
                        const isSticky = Boolean(stickyInfo?.isSticky);
                        const stickyStyle: React.CSSProperties = isSticky
                            ? { position: 'sticky', left: `${stickyInfo?.left ?? 0}px`, zIndex: 10 }
                            : {};
                        const stickyClass = isSticky
                            ? `sticky bg-slate-100 dark:bg-slate-800 ${
                                  stickyInfo?.isLastSticky
                                      ? 'border-r border-slate-300 dark:border-slate-700 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[3px_0_5px_-2px_rgba(0,0,0,0.4)]'
                                      : ''
                              }`
                            : '';

                        return (
                            <th
                                scope="col"
                                style={stickyStyle}
                                className={`datatable-tfoot-th px-6 py-3 font-semibold ${stickyClass}`}
                                key={`tfoot-${index}`}
                            >
                                <span className="flex items-center">{foot}</span>
                            </th>
                        );
                    })}
                </tr>
            ) : (
                <>
                    {(footers as Headers[][]).map((footerRow, rowIndex) => (
                        <tr key={`footer-row-${rowIndex}`}>
                            {footerRow.map((foot, index) => {
                                const stickyInfo = getStickyInfo?.(index);
                                const isSticky = Boolean(stickyInfo?.isSticky);
                                const stickyStyle: React.CSSProperties = isSticky
                                    ? { position: 'sticky', left: `${stickyInfo?.left ?? 0}px`, zIndex: 10 }
                                    : {};
                                const stickyClass = isSticky
                                    ? `sticky bg-slate-100 dark:bg-slate-800 ${
                                          stickyInfo?.isLastSticky
                                              ? 'border-r border-slate-300 dark:border-slate-700 shadow-[3px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[3px_0_5px_-2px_rgba(0,0,0,0.4)]'
                                              : ''
                                      }`
                                    : '';

                                return (
                                    <th
                                        key={`tfoot-adv-${rowIndex}-${index}`}
                                        rowSpan={foot.rowspan}
                                        colSpan={foot.colspan}
                                        style={stickyStyle}
                                        className={`datatable-tfoot-th px-6 py-3 font-semibold ${stickyClass}`}
                                    >
                                        <span className="flex items-center">{foot.label}</span>
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </>
            )}
        </tfoot>
    );
}
