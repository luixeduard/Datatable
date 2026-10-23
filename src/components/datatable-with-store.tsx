import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { DatatableCoreExtraProps, DatatableType } from '../Datatable.type';
import {
    setTableScroll,
    setTableState,
    loadDatatableStorage,
    type MinimalReduxStore,
    type DatatableSavedState,
} from '../datatableSlice';

export interface DatatableWithStoreProps<T> {
    props: DatatableType<T>;
    renderCore: (extraProps: DatatableCoreExtraProps) => React.ReactNode;
}

/**
 * Conector con persistencia Redux y SessionStorage opcional.
 *
 * @param { DatatableWithStoreProps<T> } options Propiedades del Datatable con store y renderizador de núcleo.
 * @returns { React.ReactNode } DatatableCore sincronizado con la store.
 * @author @luixeduard
 */
export default function DatatableWithStore<T>({
    props,
    renderCore,
}: DatatableWithStoreProps<T>): React.ReactNode {
    const store = props.store as MinimalReduxStore;
    const tableId = props.tableId as string;

    const getInitialState = (): DatatableSavedState | undefined => {
        try {
            const state = store?.getState?.() as { datatable?: { tables?: Record<string, DatatableSavedState> } };
            if (state?.datatable?.tables?.[tableId]) {
                return state.datatable.tables[tableId];
            }
        } catch {
            // ignore
        }
        const storage = loadDatatableStorage();
        return storage[tableId];
    };

    const [savedState] = useState<DatatableSavedState | undefined>(getInitialState);

    useEffect(() => {
        if (props.restoreScroll === false) return;
        if (savedState && (savedState.scrollX > 0 || savedState.scrollY > 0)) {
            const timer = setTimeout(() => {
                window.scrollTo({
                    left: savedState.scrollX,
                    top: savedState.scrollY,
                    behavior: 'instant' as ScrollBehavior,
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [savedState, props.restoreScroll]);

    useEffect(() => {
        if (props.restoreScroll === false || !store?.dispatch) return;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                store.dispatch(
                    setTableScroll({
                        tableId,
                        scrollX: window.scrollX,
                        scrollY: window.scrollY,
                    }),
                );
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [store, tableId, props.restoreScroll]);

    const handleTableStateChange = useCallback(
        (newState: {
            search: string;
            page: number;
            records: number;
            order: [number, -1 | 'ASC' | 'DESC' | 1][];
            viewMode?: 'table' | 'cards';
            visibleColumns?: Record<number, boolean>;
        }) => {
            if (!store?.dispatch) return;
            store.dispatch(
                setTableState({
                    tableId,
                    state: newState,
                }),
            );
        },
        [store, tableId],
    );

    return renderCore({
        initialSearch: savedState?.search,
        initialPage: savedState?.page,
        initialRecords: savedState?.records,
        initialOrder: savedState?.order,
        initialViewMode: savedState?.viewMode,
        initialVisibleColumns: savedState?.visibleColumns,
        onTableStateChange: handleTableStateChange,
    });
}
