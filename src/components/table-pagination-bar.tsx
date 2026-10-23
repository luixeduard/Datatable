import type React from 'react';
import type { LengthMenu } from '../Datatable.type';
import TablePageSize from './table-page-size';
import TableInfo from './table-info';
import TablePagination from './table-pagination';

export interface TablePaginationBarProps {
    pagging?: boolean;
    info?: boolean;
    count?: number;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    records: number;
    lengthMenu: (number | LengthMenu)[];
    onChangeSelectPages: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Barra inferior completa que organiza el selector de páginas, la información y la paginación.
 *
 * @param { TablePaginationBarProps } props Parámetros de paginación e información.
 * @returns { React.ReactNode } Barra inferior unificada y responsiva.
 * @author @luixeduard
 */
export default function TablePaginationBar({
    pagging = true,
    info = true,
    count,
    page,
    setPage,
    records,
    lengthMenu,
    onChangeSelectPages,
}: TablePaginationBarProps): React.ReactNode {
    if (!pagging) {
        return null;
    }

    return (
        <nav
            className="datatable-pagination-bar flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 w-full"
            aria-label="Navegación de tabla"
        >
            <TablePageSize
                records={records}
                lengthMenu={lengthMenu}
                onChange={onChangeSelectPages}
            />

            {info && (
                <TableInfo
                    page={page}
                    records={records}
                    count={count}
                />
            )}

            <TablePagination
                page={page}
                setPage={setPage}
                count={count}
                records={records}
            />
        </nav>
    );
}
