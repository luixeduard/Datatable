import { useEffect } from 'react';
import type React from 'react';
import type { Column } from '../Datatable.type';

export interface UseTableDataSourceOptions<T> {
    control: 'back' | 'front';
    getData?: unknown;
    page: number;
    records: number;
    columns: Column<T>[];
    orderCol: [number, -1 | 'ASC' | 'DESC' | 1][];
    debouncedSearch: string;
    manualRefreshTrigger: boolean;
    isInfiniteScroll: boolean;
    setCurrentData: React.Dispatch<React.SetStateAction<T[]>>;
    setCount: React.Dispatch<React.SetStateAction<number | undefined>>;
    setInternalAllData: React.Dispatch<React.SetStateAction<T[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Hook que gestiona las peticiones asíncronas de datos tanto para control backend como carga inicial frontend.
 *
 * @param { UseTableDataSourceOptions<T> } options Configuración de origen de datos, estado de carga y mutadores.
 * @author @luixeduard
 */
export function useTableDataSource<T>({
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
}: UseTableDataSourceOptions<T>): void {
    useEffect(() => {
        if (control !== 'back') return;
        const fnGetData = getData as (
            p: number,
            r: number,
            c: string[],
            o: [number, -1 | 'ASC' | 'DESC' | 1][],
            s?: string,
        ) => Promise<{ rows?: T[]; count?: number }>;

        if (!fnGetData) throw new Error('No se definio la funcion getData');

        let isCancelled = false;
        setLoading(true);
        const queryColumns = columns.map((col) => (col.orderValue || col.fieldName || '') as string);

        fnGetData(page, records, queryColumns, orderCol, debouncedSearch || undefined)
            .then((res) => {
                if (isCancelled || !res) return;
                const rows = res.rows ?? [];
                const totalCount = res.count ?? 0;
                setCount(totalCount);

                if (isInfiniteScroll && page > 0) {
                    setCurrentData((prev) => {
                        const updated = [...prev, ...rows];
                        const more = totalCount > 0 ? updated.length < totalCount : rows.length === records;
                        setHasMore(more);
                        return updated;
                    });
                } else {
                    setCurrentData(rows);
                    setHasMore(totalCount > 0 ? rows.length < totalCount : rows.length === records);
                }
            })
            .catch((error: unknown) => {
                console.error("Error al obtener datos en Datatable (control='back'):", error);
            })
            .finally(() => {
                if (!isCancelled) setLoading(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [
        control,
        getData,
        page,
        records,
        orderCol,
        debouncedSearch,
        manualRefreshTrigger,
        columns,
        isInfiniteScroll,
        setCurrentData,
        setCount,
        setHasMore,
        setLoading,
    ]);

    useEffect(() => {
        if (control !== 'front' || !getData) return;
        const fnGetVoidData = getData as () => Promise<{ rows?: T[]; count?: number }>;

        let isCancelled = false;
        setLoading(true);
        fnGetVoidData()
            .then((res) => {
                if (isCancelled || !res) return;
                setInternalAllData(res.rows ?? []);
                setCount(res.count ?? (res.rows?.length ?? 0));
            })
            .catch((error: unknown) => {
                console.error("Error al obtener datos en Datatable (control='front'):", error);
            })
            .finally(() => {
                if (!isCancelled) setLoading(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [control, getData, manualRefreshTrigger, setCount, setInternalAllData, setLoading]);
}

export default useTableDataSource;
