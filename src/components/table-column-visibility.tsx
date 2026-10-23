import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Column } from '../Datatable.type';

export interface TableColumnVisibilityProps<T> {
    columns: Column<T>[];
    getHeaderLabel: (index: number) => string;
    filterColumn: (col: Column<T>, index: number) => boolean;
    onToggleColumn: (index: number) => void;
    onShowAllColumns?: () => void;
}

/**
 * Menú desplegable para seleccionar y alternar la visibilidad de columnas de la tabla.
 *
 * @param { TableColumnVisibilityProps<T> } props Configuración de columnas y manejadores de visibilidad.
 * @returns { React.ReactNode } Botón con popover accesible de selección de columnas.
 * @author @luixeduard
 */
export default function TableColumnVisibility<T>({
    columns,
    getHeaderLabel,
    filterColumn,
    onToggleColumn,
    onShowAllColumns,
}: TableColumnVisibilityProps<T>): React.ReactNode {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const visibleCount = columns.filter((col, index) => filterColumn(col, index)).length;

    return (
        <div ref={containerRef} className="datatable-column-visibility relative inline-block text-left shrink-0">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="datatable-column-visibility-btn inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:focus:ring-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
            >
                <svg
                    className="w-4 h-4 text-slate-500 dark:text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Columnas</span>
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                    {visibleCount}/{columns.length}
                </span>
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className="datatable-column-visibility-menu absolute right-0 z-50 mt-2 w-60 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2.5 datatable-fade-enter"
                >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 px-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Mostrar columnas
                        </span>
                        {onShowAllColumns && visibleCount < columns.length && (
                            <button
                                type="button"
                                onClick={onShowAllColumns}
                                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                            >
                                Todas
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                        {columns.map((column, index) => {
                            const isVisible = filterColumn(column, index);
                            const label = getHeaderLabel(index) || `Columna ${index + 1}`;
                            const isSingleVisible = visibleCount === 1 && isVisible;

                            return (
                                <label
                                    key={`col-vis-${index}`}
                                    className={`datatable-column-visibility-item flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors select-none ${
                                        isSingleVisible
                                            ? 'opacity-60 cursor-not-allowed'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                                    }`}
                                >
                                    <span className="truncate text-slate-700 dark:text-slate-300">
                                        {label}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={isVisible}
                                        disabled={isSingleVisible}
                                        onChange={() => onToggleColumn(index)}
                                        className="datatable-column-visibility-checkbox w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-600 cursor-pointer"
                                    />
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
