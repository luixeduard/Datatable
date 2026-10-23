export interface DatatableSavedState {
  page: number;
  records: number;
  search: string;
  order: [number, -1 | "ASC" | "DESC" | 1][];
  scrollX: number;
  scrollY: number;
  viewMode?: "table" | "cards";
  visibleColumns?: Record<number, boolean>;
  updatedAt?: number;
}

export interface DatatableSliceState {
  tables: Record<string, DatatableSavedState>;
}

export interface MinimalReduxStore {
  getState: () => unknown;
  dispatch: (action: { type: string; payload?: unknown }) => unknown;
  subscribe?: (listener: () => void) => () => void;
}

const STORAGE_KEY = '__datatable_redux_state__';

export function loadDatatableStorage(): Record<string, DatatableSavedState> {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return {};
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DatatableSavedState>) : {};
  } catch {
    return {};
  }
}

export function saveDatatableStorage(tables: Record<string, DatatableSavedState>): void {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  } catch {
    // Manejo silencioso ante restricciones o cuotas de almacenamiento
  }
}

export const DATATABLE_SET_STATE = 'datatable/setTableState';
export const DATATABLE_SET_SCROLL = 'datatable/setTableScroll';
export const DATATABLE_SET_VISIBLE_COLUMNS = 'datatable/setTableVisibleColumns';
export const DATATABLE_RESET_STATE = 'datatable/resetTableState';
export const DATATABLE_CLEAR_ALL = 'datatable/clearAllTablesState';

export function setTableState(payload: { tableId: string; state: Partial<DatatableSavedState> }) {
  return { type: DATATABLE_SET_STATE, payload };
}

export function setTableScroll(payload: { tableId: string; scrollX: number; scrollY: number }) {
  return { type: DATATABLE_SET_SCROLL, payload };
}

export function setTableVisibleColumns(payload: { tableId: string; visibleColumns: Record<number, boolean> }) {
  return { type: DATATABLE_SET_VISIBLE_COLUMNS, payload };
}

export function resetTableState(payload: { tableId: string }) {
  return { type: DATATABLE_RESET_STATE, payload };
}

export function clearAllTablesState() {
  return { type: DATATABLE_CLEAR_ALL };
}

const initialDatatableState: DatatableSliceState = {
  tables: loadDatatableStorage(),
};

/**
 * Reducer estándar compatible con Redux Toolkit (configureStore) y Redux clásico.
 * Guarda y recupera automáticamente el estado en sessionStorage.
 */
export function datatableReducer(
  state: DatatableSliceState = initialDatatableState,
  action: { type: string; payload?: unknown }
): DatatableSliceState {
  switch (action.type) {
    case DATATABLE_SET_STATE: {
      const { tableId, state: newState } = action.payload as {
        tableId: string;
        state: Partial<DatatableSavedState>;
      };
      const current = state.tables[tableId] || {
        page: 0,
        records: 10,
        search: '',
        order: [],
        scrollX: 0,
        scrollY: 0,
      };
      const updatedTables = {
        ...state.tables,
        [tableId]: {
          ...current,
          ...newState,
          updatedAt: Date.now(),
        },
      };
      saveDatatableStorage(updatedTables);
      return { ...state, tables: updatedTables };
    }
    case DATATABLE_SET_SCROLL: {
      const { tableId, scrollX, scrollY } = action.payload as {
        tableId: string;
        scrollX: number;
        scrollY: number;
      };
      const current = state.tables[tableId] || {
        page: 0,
        records: 10,
        search: '',
        order: [],
        scrollX: 0,
        scrollY: 0,
      };
      const updatedTables = {
        ...state.tables,
        [tableId]: {
          ...current,
          scrollX,
          scrollY,
          updatedAt: Date.now(),
        },
      };
      saveDatatableStorage(updatedTables);
      return { ...state, tables: updatedTables };
    }
    case DATATABLE_SET_VISIBLE_COLUMNS: {
      const { tableId, visibleColumns } = action.payload as {
        tableId: string;
        visibleColumns: Record<number, boolean>;
      };
      const current = state.tables[tableId] || {
        page: 0,
        records: 10,
        search: '',
        order: [],
        scrollX: 0,
        scrollY: 0,
      };
      const updatedTables = {
        ...state.tables,
        [tableId]: {
          ...current,
          visibleColumns,
          updatedAt: Date.now(),
        },
      };
      saveDatatableStorage(updatedTables);
      return { ...state, tables: updatedTables };
    }
    case DATATABLE_RESET_STATE: {
      const { tableId } = action.payload as { tableId: string };
      const updatedTables = { ...state.tables };
      delete updatedTables[tableId];
      saveDatatableStorage(updatedTables);
      return { ...state, tables: updatedTables };
    }
    case DATATABLE_CLEAR_ALL: {
      saveDatatableStorage({});
      return { ...state, tables: {} };
    }
    default:
      return state;
  }
}

export const selectDatatableState = (
  state: unknown,
  tableId: string
): DatatableSavedState | undefined => {
  const root = state as { datatable?: DatatableSliceState };
  return root?.datatable?.tables?.[tableId];
};

export const selectDatatableVisibleColumns = (
  state: unknown,
  tableId: string
): Record<number, boolean> | undefined => {
  const root = state as { datatable?: DatatableSliceState };
  return root?.datatable?.tables?.[tableId]?.visibleColumns;
};

export const selectAllDatatables = (
  state: unknown
): Record<string, DatatableSavedState> | undefined => {
  const root = state as { datatable?: DatatableSliceState };
  return root?.datatable?.tables;
};
