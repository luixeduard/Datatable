import type React from 'react';

export interface TableSearchProps {
    search: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
}

/**
 * Barra de búsqueda accesible para el Datatable con icono y debounce.
 *
 * @param { TableSearchProps } props Propiedades del componente de búsqueda.
 * @returns { React.ReactNode } Nodo con el input de búsqueda estilizado.
 * @author @luixeduard
 */
export default function TableSearch({
    search,
    onSearchChange,
    placeholder = 'Buscar...',
}: TableSearchProps): React.ReactNode {
    return (
        <div className="relative w-full max-w-md">
            <label htmlFor="table-search" className="sr-only">
                Buscar
            </label>

            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <svg
                    className="w-4 h-4 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                </svg>
            </div>

            <input
                id="table-search"
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={({ currentTarget }) => onSearchChange(currentTarget.value)}
                onInput={({ currentTarget }) => onSearchChange(currentTarget.value)}
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-hidden dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-500 transition-colors shadow-2xs"
            />
        </div>
    );
}
