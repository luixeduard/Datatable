import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';
import type { Column } from '../Datatable.type';
import { getHeaderLabel, renderCell } from '../helpers/datatable-helper';
import {
    calculateColumnFilters,
    filterFrontData,
    sortFrontData,
    toggleColumnOrder,
} from '../helpers/datatable-filter-helper';
import useTableDataSource from './use-table-data-source';
import type { UseDatatableOptions } from './use-datatable.type';

export type { UseDatatableOptions };

/**
 * Hook de dominio que encapsula la lógica de paginación, ordenamiento, filtrado, vistas, columnas y scroll infinito.
 *
 * @param { UseDatatableOptions<T> } options Configuración y callbacks del Datatable.
 * @returns { object } Estados y manejadores calculados para la presentación.
 * @author @luixeduard
 */
export function useDatatable<T>({
    control,
    data,
    getData,
    columns,
    headers,
    columnDef,
    order = [],
    multiple_order = true,
    lengthMenu = [5, 10, 20, 40, 100],
    stateRefresh,
    cardsRender = false,
    infiniteScroll,
    enableInfiniteScroll,
    infiniteScrollMode = 'auto',
    infiniteScrollButtonText,
    columnVisibility = true,
    initialSearch,
    initialPage,
    initialRecords,
    initialOrder,
    initialViewMode,
    initialVisibleColumns,
    onTableStateChange,
}: UseDatatableOptions<T>) {
    const isInfiniteScroll = Boolean(infiniteScroll || enableInfiniteScroll);
    const resolvedInfiniteMode: 'auto' | 'manual' =
        infiniteScroll === 'manual' || infiniteScrollMode === 'manual' ? 'manual' : 'auto';

    const [activeView, setActiveView] = useState<'table' | 'cards'>(() => {
        if (cardsRender === true) return 'cards';
        if (cardsRender === false) return 'table';
        return initialViewMode ?? 'table';
    });

    useEffect(() => {
        if (cardsRender === true) {
            setActiveView('cards');
        } else if (cardsRender === false) {
            setActiveView('table');
        }
    }, [cardsRender]);

    const isCardsView = cardsRender === true || (cardsRender === 'auto' && activeView === 'cards');

    const [internalAllData, setInternalAllData] = useState<T[]>(() => {
        if (Array.isArray(data)) {
            if (data.length > 0 && Array.isArray(data[0])) {
                return (data[0] as T[]) ?? [];
            }
            return (data as T[]) ?? [];
        }
        return [];
    });

    useEffect(() => {
        if (control === 'front' && data && Array.isArray(data)) {
            setInternalAllData(data.length > 0 && Array.isArray(data[0]) ? (data[0] as T[]) : (data as T[]));
        }
    }, [control, data]);

    const [currentData, setCurrentData] = useState<T[]>([]);
    const [page, setPage] = useState<number>(() => initialPage ?? 0);
    const [search, setSearch] = useState<string>(() => initialSearch ?? '');
    const [debouncedSearch, setDebouncedSearch] = useState<string>(() => initialSearch ?? '');
    const [records, setRecords] = useState<number>(() => {
        if (typeof initialRecords === 'number') return initialRecords;
        return typeof lengthMenu[0] === 'number' ? lengthMenu[0] : lengthMenu[0].value;
    });
    const [count, setCount] = useState<number | undefined>();
    const [orderCol, setOrderCol] = useState<[number, -1 | 'ASC' | 'DESC' | 1][]>(() => {
        if (initialOrder && initialOrder.length > 0) return initialOrder;
        return order.map((ord) => (Array.isArray(ord) ? ord : [ord.idx, ord.order]));
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [visibleColumns, setVisibleColumns] = useState<Record<number, boolean>>(
        () => initialVisibleColumns ?? {},
    );

    useEffect(() => {
        onTableStateChange?.({
            search: debouncedSearch,
            page,
            records,
            order: orderCol,
            viewMode: activeView,
            visibleColumns,
        });
    }, [debouncedSearch, page, records, orderCol, activeView, visibleColumns, onTableStateChange]);

    const manualRefreshTrigger = stateRefresh ? stateRefresh[0] : false;

    useEffect(() => {
        if (stateRefresh && stateRefresh[0]) {
            setPage(0);
            setHasMore(true);
            stateRefresh[1](false);
        }
    }, [stateRefresh]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch((prev) => {
                if (prev !== search) {
                    setPage(0);
                    setHasMore(true);
                }
                return search;
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const filters = useMemo(() => calculateColumnFilters(columns.length, columnDef), [columns.length, columnDef]);

    const filterColumn = useCallback(
        (_col: Column<T>, index: number): boolean => {
            if (visibleColumns[index] !== undefined) {
                return visibleColumns[index];
            }
            const f = filters[index];
            return !f || f.visible !== false;
        },
        [filters, visibleColumns],
    );

    const toggleColumnVisibility = useCallback(
        (index: number) => {
            setVisibleColumns((prev) => {
                const currentVal = prev[index] !== undefined ? prev[index] : filters[index]?.visible !== false;
                return {
                    ...prev,
                    [index]: !currentVal,
                };
            });
        },
        [filters],
    );

    const showAllColumns = useCallback(() => {
        const next: Record<number, boolean> = {};
        columns.forEach((_, idx) => {
            next[idx] = true;
        });
        setVisibleColumns(next);
    }, [columns]);

    const advancedHeaders = headers.every((header) => typeof header !== 'string');
    if (!advancedHeaders && headers.length !== columns.length) {
        throw new Error('Numero de headers y columnas diferente');
    }

    useTableDataSource({
        control,
        getData,
        page,
        records,
        columns,
        orderCol,
        debouncedSearch,
        manualRefreshTrigger,
        isInfiniteScroll,
        setCurrentData,
        setCount,
        setInternalAllData,
        setLoading,
        setHasMore,
    });

    const renderTd = useCallback((column: Column<T>, object: T): React.ReactNode => renderCell(column, object), []);

    const sortedData = useMemo(() => {
        if (control === 'back') return [];
        return sortFrontData(internalAllData, orderCol, columns);
    }, [control, internalAllData, orderCol, columns]);

    const filteredData = useMemo(() => {
        if (control === 'back') return [];
        return filterFrontData(sortedData, debouncedSearch, columns, filters);
    }, [control, debouncedSearch, sortedData, columns, filters]);

    useEffect(() => {
        if (control === 'front') {
            setCount(filteredData.length);
            if (isInfiniteScroll) {
                const end = (page + 1) * records;
                const slice = filteredData.slice(0, end);
                setCurrentData(slice);
                setHasMore(end < filteredData.length);
            } else {
                const start = page * records;
                setCurrentData(filteredData.slice(start, start + records));
                setHasMore(start + records < filteredData.length);
            }
        }
    }, [control, filteredData, page, records, isInfiniteScroll]);

    const onChangeSelectPages = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setPage(0);
        setHasMore(true);
        setRecords(Number(event.currentTarget.value));
    }, []);

    const setOrder = useCallback(
        (index: number) => {
            setPage(0);
            setHasMore(true);
            setOrderCol((current) => toggleColumnOrder(current, index, multiple_order));
        },
        [multiple_order],
    );

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setPage((prev) => prev + 1);
        }
    }, [loading, hasMore]);

    return {
        activeView,
        setActiveView,
        isCardsView,
        currentData,
        loading,
        count,
        page,
        setPage,
        records,
        onChangeSelectPages,
        search,
        setSearch,
        orderCol,
        setOrder,
        filters,
        filterColumn,
        visibleColumns,
        toggleColumnVisibility,
        showAllColumns,
        columnVisibility,
        getHeaderLabel: (index: number) => getHeaderLabel(headers, index),
        renderTd,
        isInfiniteScroll,
        infiniteScrollMode: resolvedInfiniteMode,
        infiniteScrollButtonText,
        hasMore,
        loadMore,
    };
}

export default useDatatable;
