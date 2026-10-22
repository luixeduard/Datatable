import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Column, ColumnDef, DatatableType, Headers, NestedKey } from "./Datatable.type";
import {
  setTableScroll,
  setTableState,
  loadDatatableStorage,
  MinimalReduxStore,
  DatatableSavedState,
} from "./datatableSlice";
import Pagination from "./Pagination";
import { format, FormatOptions } from "date-fns";
import './index.css';

export type * from "./Datatable.type";
export * from "./datatableSlice";

/**
 * @author Luis Salas @luixeduard
 * @version 2.0.0
 * @name Datatable
 */

const currencyFormat = Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const decimalFormat = Intl.NumberFormat("es-MX", { style: "decimal" });
const percentFormat = Intl.NumberFormat("es-MX", { style: "percent" });

function limpiarString(input?: unknown): string {
  if (input == null) return "";
  const str = String(input).trim().replace(/\s+/g, ' ');
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, (char, index, original) => {
    const prevChar = original[index - 1];
    if (char === '\u0303' && (prevChar === 'n' || prevChar === 'N')) {
      return char;
    }
    return '';
  }).toLowerCase();
}

function getValue<O, K extends NestedKey<O>>(object: O, key: K, defaultValue: unknown = "-"): unknown {
  if (!key) return defaultValue;
  return String(key).split(".").reduce<unknown>((obj, k) => {
    if (obj && typeof obj === "object") {
      return (obj as Record<string, unknown>)[k];
    }
    return defaultValue;
  }, object);
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

interface DatatableCoreExtraProps {
  initialSearch?: string;
  initialPage?: number;
  initialRecords?: number;
  initialOrder?: [number, -1 | "ASC" | "DESC" | 1][];
  initialViewMode?: "table" | "cards";
  onTableStateChange?: (state: {
    search: string;
    page: number;
    records: number;
    order: [number, -1 | "ASC" | "DESC" | 1][];
    viewMode?: "table" | "cards";
  }) => void;
}

function DatatableCore<T>({
  headers,
  footers,
  columnDef,
  rowDef,
  control,
  data,
  getData,
  columns,
  order = [],
  multiple_order = true,
  lengthMenu = [5, 10, 20, 40, 100],
  stateRefresh,
  pagging = true,
  searching = true,
  info = true,
  cardsClassName = "",
  cardsRender = false,
  cardsPerRow = 1,
  initialSearch,
  initialPage,
  initialRecords,
  initialOrder,
  initialViewMode,
  onTableStateChange,
}: DatatableType<T> & DatatableCoreExtraProps) {
  // Estado para alternar entre vista de tabla o tarjetas cuando cardsRender === 'auto'
  const [activeView, setActiveView] = useState<"table" | "cards">(() => {
    if (cardsRender === true) return "cards";
    if (cardsRender === false) return "table";
    return initialViewMode ?? "table";
  });

  useEffect(() => {
    if (cardsRender === true) {
      setActiveView("cards");
    } else if (cardsRender === false) {
      setActiveView("table");
    }
  }, [cardsRender]);

  const isCardsView = cardsRender === true || (cardsRender === "auto" && activeView === "cards");

  // Estado interno de datos para modo front
  const [internalAllData, setInternalAllData] = useState<T[]>(() => {
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0])) {
        return (data[0] as T[]) ?? [];
      }
      return (data as T[]) ?? [];
    }
    return [];
  });

  // Sincronizar datos del modo front cuando el prop `data` se actualiza desde el padre
  useEffect(() => {
    if (control === "front" && data) {
      if (Array.isArray(data)) {
        if (data.length > 0 && Array.isArray(data[0])) {
          setInternalAllData(data[0] as T[]);
        } else {
          setInternalAllData(data as T[]);
        }
      }
    }
  }, [control, data]);

  const [currentData, setCurrentData] = useState<T[]>([]);
  const [page, setPage] = useState<number>(() => initialPage ?? 0);
  const [search, setSearch] = useState<string>(() => initialSearch ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState<string>(() => initialSearch ?? "");
  const [records, setRecords] = useState<number>(() => {
    if (typeof initialRecords === "number") return initialRecords;
    return typeof lengthMenu[0] === "number" ? lengthMenu[0] : lengthMenu[0].value;
  });
  const [count, setCount] = useState<number | undefined>();
  const [orderCol, setOrderCol] = useState<[number, -1 | "ASC" | "DESC" | 1][]>(() => {
    if (initialOrder && initialOrder.length > 0) return initialOrder;
    return order.map((ord) => (Array.isArray(ord) ? ord : [ord.idx, ord.order]));
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Notificar cambios de estado para sincronizar con Redux u otros listeners
  useEffect(() => {
    onTableStateChange?.({
      search: debouncedSearch,
      page,
      records,
      order: orderCol,
      viewMode: activeView,
    });
  }, [debouncedSearch, page, records, orderCol, activeView, onTableStateChange]);

  // Escuchar trigger de refresco manual
  const manualRefreshTrigger = stateRefresh ? stateRefresh[0] : false;

  useEffect(() => {
    if (stateRefresh && stateRefresh[0]) {
      stateRefresh[1](false);
    }
  }, [stateRefresh]);

  // Debounce para el término de búsqueda (300ms) y reseteo de página solo si cambió la búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev !== search) {
          setPage(0);
        }
        return search;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const getValueColumnDef = useCallback(
    (index: number, key: keyof ColumnDef): boolean => {
      if (!columnDef) return true;
      const filter = columnDef.find((c) => {
        if (!(key in c)) return false;
        const matchesTarget = "target" in c && (c.target === index || c.target === "_all");
        const matchesTargets = "targets" in c && Array.isArray(c.targets) && c.targets.includes(index);
        return matchesTarget || matchesTargets;
      });
      if (!filter || filter[key] === undefined) return true;
      return Boolean(filter[key]);
    },
    [columnDef]
  );

  const filters = useMemo(() => {
    return new Array(columns.length).fill(null).map((_c, index) => {
      const visible = !columnDef ? true : getValueColumnDef(index, "visible");
      const searchable = !columnDef ? true : getValueColumnDef(index, "searchable");
      const orderable = !columnDef ? true : getValueColumnDef(index, "orderable");

      const classname = !columnDef
        ? undefined
        : columnDef
            .filter(
              (c) =>
                c.classname &&
                c.classname.length > 0 &&
                (c.target === "_all" ||
                  (c.target != null && c.target === index) ||
                  (c.targets != null && c.targets.includes(index)))
            )
            .map((c) => c.classname)
            .join(" ");

      return {
        target: index,
        visible,
        searchable,
        orderable,
        classname: classname || undefined,
      };
    });
  }, [columns.length, columnDef, getValueColumnDef]);

  const filterColumn = useCallback(
    (_col: Column<T>, index: number): boolean => {
      const f = filters[index];
      return !f || f.visible !== false;
    },
    [filters]
  );

  const advancedHeaders = headers.every((header) => typeof header !== "string");
  const advancedFooters = footers && footers.every((header) => typeof header !== "string");

  if (!advancedHeaders && headers.length !== columns.length) {
    throw new Error("Numero de headers y columnas diferente");
  }

  const getHeaderLabel = useCallback(
    (index: number): string => {
      if (!headers || index < 0) return "";
      if (!advancedHeaders) {
        return (headers as string[])[index] ?? "";
      }
      const advHeaders = headers as Headers[][];
      for (const row of advHeaders) {
        if (row && row[index] && typeof row[index].label === "string") {
          return row[index].label;
        }
      }
      return "";
    },
    [headers, advancedHeaders]
  );

  // Petición en modo Back: un único efecto controlado con cancelación
  useEffect(() => {
    if (control !== "back") return;
    if (!getData) {
      throw new Error("No se definio la funcion getData");
    }

    let isCancelled = false;
    setLoading(true);

    const queryColumns = columns.map((col) => (col.orderValue || col.fieldName || "") as string);

    getData(page, records, queryColumns, orderCol, debouncedSearch || undefined)
      .then((res) => {
        if (isCancelled || !res) return;
        setCurrentData(res.rows ?? []);
        setCount(res.count ?? 0);
      })
      .catch((error: unknown) => {
        console.error("Error al obtener datos en Datatable (control='back'):", error);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [control, getData, page, records, orderCol, debouncedSearch, manualRefreshTrigger, columns]);

  // Carga asíncrona en modo Front cuando se define getData
  useEffect(() => {
    if (control !== "front" || !getData) return;

    let isCancelled = false;
    setLoading(true);

    getData()
      .then((res) => {
        if (isCancelled || !res) return;
        setInternalAllData(res.rows ?? []);
        setCount(res.count ?? (res.rows?.length ?? 0));
      })
      .catch((error: unknown) => {
        console.error("Error al obtener datos en Datatable (control='front'):", error);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [control, getData, manualRefreshTrigger]);

  const formatValue = useCallback((column: Column<T>, value: unknown): string => {
    if (value == null) return "-";
    if (column.format) {
      try {
        if (typeof column.format === "function") {
          return column.format(value as never);
        }
        if (column.format === "currency") {
          const num = Number(value);
          return !isNaN(num) ? currencyFormat.format(num) : "-";
        }
        if (column.format === "decimal") {
          const num = Number(value);
          return !isNaN(num) ? decimalFormat.format(num) : "-";
        }
        if (column.format === "percent") {
          const num = Number(value);
          return !isNaN(num) ? percentFormat.format(num) : "-";
        }
        if (column.format === "unit") {
          const num = Number(value);
          if (!isNaN(num)) {
            const unitFormat = Intl.NumberFormat("es-MX", { style: "unit", ...column.formatOptions });
            return unitFormat.format(num);
          }
          return "-";
        }
        if (column.format === "date" || column.format === "datetime") {
          const dateVal = value instanceof Date ? value : (typeof value === "string" || typeof value === "number" ? new Date(value) : null);
          if (dateVal && !isNaN(dateVal.getTime())) {
            if (column.format === "date") {
              return format(dateVal, "P", column.formatOptions as FormatOptions);
            }
            return format(dateVal, "Pp", column.formatOptions as FormatOptions);
          }
          return "Fecha inválida";
        }
      } catch {
        return "-";
      }
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  }, []);

  const renderTd = useCallback(
    (column: Column<T>, object: T): React.ReactNode => {
      if (column.renderFn) {
        return column.renderFn(object, object);
      }
      const fieldName = column.fieldName;
      if (!fieldName) {
        return typeof object === "object" ? JSON.stringify(object) : String(object);
      }
      const strField = String(fieldName);
      if (strField.includes(".")) {
        const val = getValue(object, fieldName as NestedKey<T>);
        return column.format ? formatValue(column, val) : (val as React.ReactNode);
      }
      const rawVal = (object as Record<string, unknown>)[strField];
      if (column.format) {
        return formatValue(column, rawVal);
      }
      if (rawVal != null && typeof rawVal === "object") {
        return JSON.stringify(rawVal);
      }
      return rawVal as React.ReactNode;
    },
    [formatValue]
  );

  // Ordenamiento en memoria (modo front)
  const sortedData = useMemo(() => {
    if (control === "back") return [];
    if (!orderCol || orderCol.length === 0) return internalAllData;

    return [...internalAllData].sort((a, b) => {
      for (const [indexCol, orderDir] of orderCol) {
        const col = columns[indexCol];
        if (!col) continue;
        const keyPath = (col.fieldName || col.orderValue) as string;
        if (!keyPath) continue;

        const valueA = getNestedValue(a, keyPath);
        const valueB = getNestedValue(b, keyPath);

        if (valueA == null && valueB != null) return ["ASC", 1].includes(orderDir) ? -1 : 1;
        if (valueB == null && valueA != null) return ["ASC", 1].includes(orderDir) ? 1 : -1;
        if (valueA == null && valueB == null) continue;

        if (typeof valueA === "string" && typeof valueB === "string") {
          const cmp = valueA.localeCompare(valueB);
          if (cmp !== 0) return ["ASC", 1].includes(orderDir) ? cmp : -cmp;
        }
        if (typeof valueA === "number" && typeof valueB === "number") {
          const cmp = valueA - valueB;
          if (cmp !== 0) return ["ASC", 1].includes(orderDir) ? cmp : -cmp;
        }
        const dateA = valueA instanceof Date ? valueA : (typeof valueA === "string" ? new Date(valueA) : null);
        const dateB = valueB instanceof Date ? valueB : (typeof valueB === "string" ? new Date(valueB) : null);
        if (dateA && dateB && !isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          const cmp = dateA.getTime() - dateB.getTime();
          if (cmp !== 0) return ["ASC", 1].includes(orderDir) ? cmp : -cmp;
        }
      }
      return 0;
    });
  }, [control, internalAllData, orderCol, columns]);

  // Filtrado en memoria (modo front)
  const filteredData = useMemo(() => {
    if (control === "back") return [];
    const query = limpiarString(debouncedSearch);
    if (!query) return sortedData;

    const searchableCols = columns
      .map((col, idx) => ({ col, idx }))
      .filter(({ idx }) => {
        const f = filters[idx];
        return !f || (f.searchable !== false && f.visible !== false);
      });

    return sortedData.filter((row) => {
      return searchableCols.some(({ col }) => {
        let val: unknown = "";
        const field = col.fieldName;
        if (field) {
          if (String(field).includes(".")) {
            val = getValue(row, field as NestedKey<T>, "");
          } else {
            val = (row as Record<string, unknown>)[String(field)];
          }
        }
        if (val == null) return false;
        const formatted = formatValue(col, val);
        if (formatted == null) return false;
        return limpiarString(formatted).includes(query);
      });
    });
  }, [control, sortedData, debouncedSearch, columns, filters, formatValue]);

  // Paginación en modo front (con corrección de slice sin off-by-one)
  useEffect(() => {
    if (control === "front") {
      setCount(filteredData.length);
      const start = page * records;
      setCurrentData(filteredData.slice(start, start + records));
    }
  }, [control, filteredData, page, records]);

  function onChangeSelectPages(event: React.ChangeEvent<HTMLSelectElement>) {
    setPage(0);
    setRecords(Number(event.currentTarget.value));
  }

  function setOrder(index: number) {
    setOrderCol((current) => {
      if (!multiple_order) {
        if (current.length === 0 || current[0][0] !== index) {
          return [[index, "ASC"]];
        }
        if (current[0][1] === "ASC" || current[0][1] === 1) {
          return [[index, "DESC"]];
        }
        return [];
      }
      const find = current.find((curr) => curr[0] === index);
      if (find) {
        const isAsc = [1, "ASC"].includes(find[1]);
        if (isAsc) {
          return [...current.filter((curr) => curr[0] !== index), [index, "DESC"]];
        }
        return current.filter((curr) => curr[0] !== index);
      }
      return [...current, [index, "ASC"]];
    });
  }

  function renderOrder(index: number) {
    const find = orderCol.find((ord) => ord[0] === index);
    const orderDir = find?.[1];
    return (
      <svg className="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        {!(find && orderDir) ? (
          <></>
        ) : orderDir === "ASC" || orderDir === 1 ? (
          <>
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 5l-4 4" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 5l4 4" />
          </>
        ) : (
          <>
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 19l-4-4" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 19l4-4" />
          </>
        )}
      </svg>
    );
  }

  return (
    <>
      {(searching || cardsRender === "auto") && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 w-full px-2 sm:px-0">
          {searching ? (
            <div className="relative w-full max-w-md">
              <label htmlFor="table-search" className="sr-only">
                Buscar
              </label>

              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>

              <input
                id="table-search"
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={({ currentTarget }) => setSearch(currentTarget.value)}
                onInput={({ currentTarget }) => setSearch(currentTarget.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          ) : (
            <div />
          )}

          {cardsRender === "auto" && (
            <div className="ms-auto inline-flex rounded-lg border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-100 dark:bg-gray-800" role="group" aria-label="Cambiar vista">
              <button
                type="button"
                onClick={() => setActiveView("table")}
                title="Vista de tabla"
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeView === "table"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <svg className="w-4 h-4 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-9 4h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Tabla
              </button>
              <button
                type="button"
                onClick={() => setActiveView("cards")}
                title="Vista de tarjetas"
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeView === "cards"
                    ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <svg className="w-4 h-4 me-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Tarjetas
              </button>
            </div>
          )}
        </div>
      )}

      {isCardsView ? (
        <div className="cards-wrapper w-full">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="loader">Cargando...</div>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center p-8 font-bold text-gray-500 dark:text-gray-400">
              SIN DATOS
            </div>
          ) : (
            <div
              className="generic-cards-grid"
              style={{
                "--cards-per-row": cardsPerRow,
              } as React.CSSProperties}
            >
              {currentData.map((row, rowIndex) => {
                const record = row as Record<string, unknown> | null | undefined;
                const rowKey =
                  (record?._id as string | number | undefined) ??
                  (record?.id as string | number | undefined) ??
                  `card-row-${rowIndex}`;

                return (
                  <div
                    key={rowKey}
                    onDoubleClick={(evt) => rowDef?.onDoubleClick?.(evt, row)}
                    onClick={(evt) => rowDef?.onClick?.(evt, row)}
                    className={["generic-card", cardsClassName].filter(Boolean).join(" ")}
                  >
                    {columns.map((column, colIndex) => {
                      if (!filterColumn(column, colIndex)) return null;
                      const label = getHeaderLabel(colIndex);
                      return (
                        <div key={`cell-${colIndex}`} className="generic-card__cell">
                          {label && <span className="generic-card__label">{label}:</span>}
                          <span className="generic-card__value">{renderTd(column, row)}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
              {!advancedHeaders ? (
                <tr>
                  {(headers as string[]).map((head, index) => {
                    const col = columns[index];
                    if (!col || !filterColumn(col, index)) return null;
                    const isOrderable = filters[index]?.orderable;
                    return (
                      <th
                        scope="col"
                        className={`px-6 py-3 ${isOrderable ? "hover:bg-gray-400 dark:hover:bg-gray-600 cursor-pointer" : ""}`}
                        {...(isOrderable && { onClick: () => setOrder(index) })}
                        key={`th-${index}`}
                      >
                        <span className="flex items-center">
                          {head}
                          {renderOrder(index)}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ) : (
                <>
                  {(headers as Headers[][]).map((headerRow, rowIndex) => (
                    <tr key={`header-row-${rowIndex}`}>
                      {headerRow.map((header, index) => {
                        const isOrderable = filters[index]?.orderable;
                        return (
                          <th
                            key={`th-adv-${rowIndex}-${index}`}
                            rowSpan={header.rowspan}
                            colSpan={header.colspan}
                            scope="col"
                            className={`px-6 py-3 ${isOrderable ? "hover:bg-gray-400 dark:hover:bg-gray-600 cursor-pointer" : ""}`}
                            {...(isOrderable && { onClick: () => setOrder(index) })}
                          >
                            <span className="flex items-center">
                              {header.label}
                              {renderOrder(index)}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.filter((c, i) => filterColumn(c, i)).length}>
                    <div className="text-center my-10">
                      <div role="status">
                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                        </svg>
                        <span className="sr-only">Cargando...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {currentData.length === 0 && (
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                      <td colSpan={columns.filter((c, i) => filterColumn(c, i)).length} className="p-3 text-center font-bold">
                        SIN DATOS
                      </td>
                    </tr>
                  )}
                  {currentData.map((row, rowIndex) => {
                    const record = row as Record<string, unknown> | null | undefined;
                    const rowKey =
                      (record?._id as string | number | undefined) ??
                      (record?.id as string | number | undefined) ??
                      `tbody-row-${rowIndex}`;

                    return (
                      <tr
                        key={rowKey}
                        onDoubleClick={(evt) => rowDef?.onDoubleClick?.(evt, row)}
                        onClick={(evt) => rowDef?.onClick?.(evt, row)}
                        className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 even:hover:bg-gray-100 even:dark:hover:bg-gray-700"
                      >
                        {columns.map((column, colIndex) => {
                          if (!filterColumn(column, colIndex)) return null;
                          const customClass = filters[colIndex]?.classname;
                          return (
                            <td key={`td-${colIndex}`} className={`p-3 ${customClass ?? ""}`}>
                              {renderTd(column, row)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
            {footers && footers.length > 0 && (
              <tfoot className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-600 dark:text-gray-400">
                {!advancedFooters ? (
                  <tr>
                    {(footers as string[]).map((foot, index) => {
                      const col = columns[index];
                      if (!col || !filterColumn(col, index)) return null;
                      return (
                        <th scope="col" className="px-6 py-3" key={`tfoot-${index}`}>
                          <span className="flex items-center">{foot}</span>
                        </th>
                      );
                    })}
                  </tr>
                ) : (
                  <>
                    {(footers as Headers[][]).map((footerRow, rowIndex) => (
                      <tr key={`footer-row-${rowIndex}`}>
                        {footerRow.map((foot, index) => (
                          <th key={`tfoot-adv-${rowIndex}-${index}`} rowSpan={foot.rowspan} colSpan={foot.colspan}>
                            <span className="flex items-center">{foot.label}</span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </>
                )}
              </tfoot>
            )}
          </table>
        </div>
      )}

      {pagging && (
        <Pagination
          onChangeSelectPages={onChangeSelectPages}
          info={info}
          count={count}
          lengthMenu={lengthMenu}
          page={page}
          setPage={setPage}
          records={records}
        />
      )}
    </>
  );
}

// Conector opcional con Redux Store sin dependencias duras de paquetes externos
function DatatableWithStore<T>(props: DatatableType<T>) {
  const store = props.store as MinimalReduxStore;
  const tableId = props.tableId as string;

  // Obtener estado inicial desde la store o sessionStorage
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

  // Restaurar posición de scroll en el montaje
  useEffect(() => {
    if (props.restoreScroll === false) return;
    if (savedState && (savedState.scrollX > 0 || savedState.scrollY > 0)) {
      const t = setTimeout(() => {
        window.scrollTo({
          left: savedState.scrollX,
          top: savedState.scrollY,
          behavior: "instant" as ScrollBehavior,
        });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [savedState, props.restoreScroll]);

  // Rastrear posición de scroll en la ventana
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
          })
        );
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [store, tableId, props.restoreScroll]);

  // Sincronizar cambios de búsqueda, página, registros y orden con la store
  const handleTableStateChange = useCallback(
    (newState: {
      search: string;
      page: number;
      records: number;
      order: [number, -1 | "ASC" | "DESC" | 1][];
      viewMode?: "table" | "cards";
    }) => {
      if (!store?.dispatch) return;
      store.dispatch(
        setTableState({
          tableId,
          state: newState,
        })
      );
    },
    [store, tableId]
  );

  return (
    <DatatableCore
      {...props}
      initialSearch={savedState?.search}
      initialPage={savedState?.page}
      initialRecords={savedState?.records}
      initialOrder={savedState?.order}
      initialViewMode={savedState?.viewMode}
      onTableStateChange={handleTableStateChange}
    />
  );
}

// Componente principal: activa persistencia Redux únicamente si se declara `store` y `tableId`
export default function Datatable<T>(props: DatatableType<T>) {
  if (props.store && props.tableId) {
    return <DatatableWithStore {...props} />;
  }

  return <DatatableCore {...props} />;
}