import type React from 'react';
import type { Column, ColumnDef, DatatableType, Headers } from '../Datatable.type';

export interface UseDatatableOptions<T> {
    control: 'back' | 'front';
    data?: [T[], React.Dispatch<React.SetStateAction<T[]>>] | [T[]] | T[];
    getData?: unknown;
    columns: Column<T>[];
    headers: string[] | Headers[][];
    columnDef?: ColumnDef[];
    order?: DatatableType<T>['order'];
    multiple_order?: boolean;
    lengthMenu?: DatatableType<T>['lengthMenu'];
    stateRefresh?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    cardsRender?: boolean | 'auto';
    infiniteScroll?: boolean | 'auto' | 'manual';
    enableInfiniteScroll?: boolean;
    infiniteScrollMode?: 'auto' | 'manual';
    infiniteScrollButtonText?: string;
    columnVisibility?: boolean;
    initialSearch?: string;
    initialPage?: number;
    initialRecords?: number;
    initialOrder?: [number, -1 | 'ASC' | 'DESC' | 1][];
    initialViewMode?: 'table' | 'cards';
    initialVisibleColumns?: Record<number, boolean>;
    onTableStateChange?: (state: {
        search: string;
        page: number;
        records: number;
        order: [number, -1 | 'ASC' | 'DESC' | 1][];
        viewMode?: 'table' | 'cards';
        visibleColumns?: Record<number, boolean>;
    }) => void;
}
