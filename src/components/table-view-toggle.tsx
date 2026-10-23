import type React from 'react';

export interface TableViewToggleProps {
    activeView: 'table' | 'cards';
    onViewChange: (view: 'table' | 'cards') => void;
}

/**
 * Selector tipo toggle para alternar entre vista de tabla y vista de tarjetas.
 *
 * @param { TableViewToggleProps } props Propiedades de la vista activa y callback de cambio.
 * @returns { React.ReactNode } Botones agrupados de alternancia de vista.
 * @author @luixeduard
 */
export default function TableViewToggle({
    activeView,
    onViewChange,
}: TableViewToggleProps): React.ReactNode {
    return (
        <div
            className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800 shadow-2xs"
            role="group"
            aria-label="Cambiar vista de datos"
        >
            <button
                type="button"
                onClick={() => onViewChange('table')}
                title="Vista de tabla"
                className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeView === 'table'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
            >
                <svg
                    className="w-3.5 h-3.5 me-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M3 14h18m-9-4v8m-9 4h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                Tabla
            </button>
            <button
                type="button"
                onClick={() => onViewChange('cards')}
                title="Vista de tarjetas"
                className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    activeView === 'cards'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
            >
                <svg
                    className="w-3.5 h-3.5 me-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                </svg>
                Tarjetas
            </button>
        </div>
    );
}
