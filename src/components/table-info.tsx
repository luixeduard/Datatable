import type React from 'react';

export interface TableInfoProps {
    page: number;
    records: number;
    count?: number;
}

/**
 * Componente que muestra el resumen de paginación e información de registros visibles.
 *
 * @param { TableInfoProps } props Página actual, registros por página y total de elementos.
 * @returns { React.ReactNode } Bloque de texto con el rango de elementos visible.
 * @author @luixeduard
 */
export default function TableInfo({
    page,
    records,
    count,
}: TableInfoProps): React.ReactNode {
    const totalCount = count ?? 0;
    const fromIndex = totalCount === 0 ? 0 : page * records + 1;
    const toIndex = totalCount === 0
        ? 0
        : (page + 1) * records > totalCount
        ? totalCount
        : (page + 1) * records;

    return (
        <div
            className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg px-3 py-1.5 shadow-2xs"
            role="status"
            aria-live="polite"
        >
            Mostrando{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-100">
                {fromIndex} - {toIndex}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-100">
                {totalCount}
            </span>{' '}
            registros
        </div>
    );
}
