import type React from 'react';
import type { PagginationType } from './Pagination.type';
import TablePaginationBar from './components/table-pagination-bar';

/**
 * Componente de paginación para Datatable con compatibilidad hacia atrás.
 *
 * @param { PagginationType } props Propiedades de paginación e información de registros.
 * @returns { React.ReactNode } Barra unificada de paginación, selector e información.
 * @author @luixeduard
 */
export default function Pagination(props: PagginationType): React.ReactNode {
    return <TablePaginationBar pagging={true} {...props} />;
}