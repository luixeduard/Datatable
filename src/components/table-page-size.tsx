import type React from 'react';
import type { LengthMenu } from '../Datatable.type';

export interface TablePageSizeProps {
    records: number;
    lengthMenu: (number | LengthMenu)[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Selector desplegable para definir el número de filas o tarjetas mostradas por página.
 *
 * @param { TablePageSizeProps } props Registros actuales, lista de opciones y manejador de evento.
 * @returns { React.ReactNode } Selector estilizado de registros por página.
 * @author @luixeduard
 */
export default function TablePageSize({
    records,
    lengthMenu,
    onChange,
}: TablePageSizeProps): React.ReactNode {
    return (
        <div className="datatable-page-size flex items-center gap-2 shrink-0">
            <label
                htmlFor="datatable-page-size-select"
                className="datatable-page-size-label text-xs font-medium text-slate-500 dark:text-slate-400 select-none"
            >
                Mostrando:
            </label>
            <select
                id="datatable-page-size-select"
                value={records}
                onChange={onChange}
                className="datatable-page-size-select bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg focus:border-slate-400 focus:ring-1 focus:ring-slate-400 p-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-colors cursor-pointer shadow-2xs"
            >
                {lengthMenu.map((value, idx) => {
                    const optValue = typeof value === 'number' ? value : value.value;
                    const optLabel = typeof value === 'number' ? value : value.label;
                    return (
                        <option key={`page-size-${idx}-${optValue}`} value={optValue}>
                            {optLabel}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}
