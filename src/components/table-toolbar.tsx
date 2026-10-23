import type React from 'react';
import type { Column } from '../Datatable.type';
import TableSearch from './table-search';
import TableViewToggle from './table-view-toggle';
import TableColumnVisibility from './table-column-visibility';

export interface TableToolbarProps<T = unknown> {
    searching?: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    showViewToggle?: boolean;
    activeView: 'table' | 'cards';
    onViewChange: (view: 'table' | 'cards') => void;
    columnVisibility?: boolean;
    columns?: Column<T>[];
    getHeaderLabel?: (index: number) => string;
    filterColumn?: (col: Column<T>, index: number) => boolean;
    onToggleColumn?: (index: number) => void;
    onShowAllColumns?: () => void;
}

/**
 * Barra superior de herramientas del Datatable que agrupa la búsqueda, el selector de columnas y el selector de vistas.
 *
 * @param { TableToolbarProps<T> } props Propiedades de control de búsqueda, columnas visibles y alternancia de vistas.
 * @returns { React.ReactNode } Barra superior estilizada y responsiva.
 * @author @luixeduard
 */
export default function TableToolbar<T>({
    searching = true,
    search,
    onSearchChange,
    showViewToggle = false,
    activeView,
    onViewChange,
    columnVisibility = true,
    columns,
    getHeaderLabel,
    filterColumn,
    onToggleColumn,
    onShowAllColumns,
}: TableToolbarProps<T>): React.ReactNode {
    const showColumnSelector =
        activeView === 'table' &&
        columnVisibility &&
        Boolean(columns && getHeaderLabel && filterColumn && onToggleColumn);

    if (!searching && !showViewToggle && !showColumnSelector) {
        return null;
    }

    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 w-full px-1 sm:px-0">
            {searching ? (
                <TableSearch search={search} onSearchChange={onSearchChange} />
            ) : (
                <div />
            )}

            <div className="ms-auto flex items-center gap-2.5">
                {showColumnSelector && columns && getHeaderLabel && filterColumn && onToggleColumn && (
                    <TableColumnVisibility
                        columns={columns}
                        getHeaderLabel={getHeaderLabel}
                        filterColumn={filterColumn}
                        onToggleColumn={onToggleColumn}
                        onShowAllColumns={onShowAllColumns}
                    />
                )}

                {showViewToggle && (
                    <TableViewToggle activeView={activeView} onViewChange={onViewChange} />
                )}
            </div>
        </div>
    );
}
