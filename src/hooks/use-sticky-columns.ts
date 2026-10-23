import { useCallback, useEffect, useRef, useState } from 'react';
import type { Column } from '../Datatable.type';
import type { ColumnFilterItem } from '../components/table-head';

export interface StickyColumnInfo {
    isSticky: boolean;
    left: number;
    isLastSticky: boolean;
}

/**
 * Hook de dominio que calcula los desplazamientos horizontales acumulados para columnas sticky apiladas.
 *
 * @param { Column<T>[] } columns Definición de columnas.
 * @param { ColumnFilterItem[] } filters Configuración de visibilidad y filtros.
 * @param { Function } filterColumn Función de comprobación de visibilidad.
 * @returns { object } Referencia de tabla y función de consulta getStickyInfo.
 * @author @luixeduard
 */
export function useStickyColumns<T>(
    columns: Column<T>[],
    filters: ColumnFilterItem[],
    filterColumn: (col: Column<T>, index: number) => boolean,
) {
    const tableRef = useRef<HTMLTableElement | null>(null);
    const [offsets, setOffsets] = useState<Record<number, number>>({});

    const recalculateOffsets = useCallback(() => {
        if (!tableRef.current) return;
        const thead = tableRef.current.querySelector('thead');
        if (!thead) return;

        const thElements = thead.querySelectorAll('tr:last-child > th');
        let currentLeft = 0;
        const newOffsets: Record<number, number> = {};

        let thIndex = 0;
        columns.forEach((col, index) => {
            if (!filterColumn(col, index)) return;
            const isSticky = Boolean(col.sticky || filters[index]?.sticky);
            const th = thElements[thIndex] as HTMLElement | undefined;
            const width = th ? th.offsetWidth : 0;

            if (isSticky) {
                newOffsets[index] = currentLeft;
                currentLeft += width;
            }
            thIndex++;
        });

        setOffsets(newOffsets);
    }, [columns, filters, filterColumn]);

    useEffect(() => {
        recalculateOffsets();
        const timeout = setTimeout(recalculateOffsets, 50);
        window.addEventListener('resize', recalculateOffsets);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', recalculateOffsets);
        };
    }, [recalculateOffsets]);

    const getStickyInfo = useCallback(
        (index: number): StickyColumnInfo => {
            const col = columns[index];
            const isSticky = Boolean(col?.sticky || filters[index]?.sticky);
            if (!isSticky) {
                return { isSticky: false, left: 0, isLastSticky: false };
            }

            let lastStickyIdx = -1;
            columns.forEach((c, idx) => {
                if (filterColumn(c, idx) && (c.sticky || filters[idx]?.sticky)) {
                    lastStickyIdx = idx;
                }
            });

            return {
                isSticky: true,
                left: offsets[index] ?? 0,
                isLastSticky: index === lastStickyIdx,
            };
        },
        [columns, filters, filterColumn, offsets],
    );

    return {
        tableRef,
        getStickyInfo,
        recalculateOffsets,
    };
}

export default useStickyColumns;
