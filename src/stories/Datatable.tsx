import { useEffect, useState } from "react";
import { Column, ColumnDef, DatatableType, FormatType, Headers, NestedKey } from "./Datatable.type";
import Pagination from "./Pagination";
import { v4 } from "uuid";
import { format, FormatOptions } from "date-fns";

/**
 * @author Luis Salas @luixeduard
 * @version 2.0.0
 * @name Datatable
 */

const currencyFormat = Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" })
const decimalFormat = Intl.NumberFormat("es-MX", { style: "decimal" })
const percentFormat = Intl.NumberFormat("es-MX", { style: "percent" })

function setStateAllData<T>(data?: [T[], React.Dispatch<React.SetStateAction<T[]>>] | [T[]]) {
  if (data) { //SI EXISTE DATA QUIERE DECIR QUE NO HAY GET DATA
    if (data.length === 1) { //SI DATA.LENGTH ES 1
      return useState<T[]>(data[0]) //SE INSTANCIA NUEVO USE STATE PARA CONTROLAR LA INFORMACIÓN
    }
    return data //SI EL DATA.LENGTH ES 2 RETORNAMOS EL USE STATE
  }
  return useState<T[]>([]) //EXISTE GETDATA Y HAY QUE CONTROLAR DICHA INFORMACION
}

export default function Datatable<T>({
  headers,
  footers,
  columnDef,
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
  info = true
}: DatatableType<T>) {
  const [allData, setAllData] = setStateAllData(data)
  const [filteredData, setFilteredData] = useState<{ is_filtered: boolean, indexes: number[] }>({ is_filtered: false, indexes: [] });
  const [currentData, setCurrentData] = useState<T[]>([]);
  const [page, setPage] = useState<number>(0)
  const [search, setSearch] = useState<string>()
  const [records, setRecords] = useState<number>(typeof lengthMenu[0] === "number" ? lengthMenu[0] : lengthMenu[0].value)
  const [count, setCount] = useState<number | undefined>()
  const [refresh, setRefresh] = !stateRefresh ? useState<boolean>(false) : stateRefresh
  const [orderCol, setOrderCol] = useState<[number, -1 | "ASC" | "DESC" | 1][]>(order.map(ord => Array.isArray(ord) ? ord : [ord.idx, ord.order]))
  const [changedOrder, setChangedOrder] = useState(false)
  const [loading, setLoading] = useState(false)
  const filters = ((new Array(headers.length).fill(null).map((_c, index) => {
    const visible = !columnDef ? true : getValueColumnDef(index, "visible")
    const searchable = !columnDef ? true : getValueColumnDef(index, "searchable")
    const orderable = !columnDef ? true : getValueColumnDef(index, "orderable")

    return {
      target: index,
      visible,
      searchable,
      orderable,
      classname: !columnDef ? undefined : columnDef.filter(c => c.classname && c.classname.length > 0 && (c.target === "_all" || (c.target && c.target === index) || (c.targets && c.targets.includes(index)))).map(c => c.classname).join(' ')
    }
  })))
  const advancedHeaders = headers.every(header => typeof header !== "string")
  const advancedFooters = footers && footers.every(header => typeof header !== "string")

  if (headers.length !== columns.length) {
    throw new Error("Numero de headers y columnas diferente")
  }

  useEffect(() => {
    if (refresh) { //Si se refresca la pagina se establece fresh en false
      setRefresh(false)
    } else { //Si el refresh esta en false se retorna
      return
    }
    if (control === "back") {
      if (!getData) {//Si el getData no esta definido dar error
        throw new Error("No se definio la funcion getData")
      }
    }
    if (control === "back") {
      setLoading(true)
      getData(page, records, columns.map(col => (col.orderValue || col.fieldName) as string), orderCol, search).then((data) => {
        setLoading(false)
        setCurrentData(data.rows);
        setPage(data.page);
        setRecords(data.records);
        setCount(data.count)
      })
    } else {
      if (getData) {
        setLoading(true)
        getData().then((data) => {
          setLoading(false)
          setAllData(data.rows);
          setCount(data.count)
        })
      } else {
        setCount(data[0].length)
      }
    }

  }, [refresh])

  function onChangeSelectPages(event: React.ChangeEvent<HTMLSelectElement>) {
    setPage(0)
    setRecords(Number(event.currentTarget.value))
    setRefresh(true)
  }

  function getValue<T, K extends NestedKey<T>>(object: T, key: K, defaultValue: unknown = "-"): unknown {
    return (key as string).split(".").reduce((obj, key) => {
      if (obj && typeof obj === "object") {
        return (obj as Record<string, unknown>)[key];
      }
      return defaultValue;
    }, object as unknown);
  }

  function getValueColumnDef(index: number, key: keyof ColumnDef): boolean {
    const filter = columnDef?.find(c => key in c && ("target" in c && (c.target === index || c.target === "_all")) || "targets" in c && c.targets?.includes(index))
    return !filter ? true : filter[key] as boolean;
  }

  function formatValue(column: Column<T>, value: T[keyof T] | unknown) {
    if (column.format) {
      try {
        if (column.format === "currency") {
          if (typeof value === "number") {
            return currencyFormat.format(value as number)
          } else if (!isNaN(Number(typeof value))) {
            return currencyFormat.format(Number(value) as number)
          }
          return "NaN"
        } else if (column.format === "decimal") {
          if (typeof value === "number") {
            return decimalFormat.format(value as number)
          } else if (!isNaN(Number(typeof value))) {
            return decimalFormat.format(Number(value) as number)
          }
          return "NaN"
        } else if (column.format === "percent") {
          if (typeof value === "number") {
            return percentFormat.format(value as number)
          } else if (!isNaN(Number(typeof value))) {
            return percentFormat.format(Number(value) as number)
          }
          return "NaN"
        } else if (column.format === "unit") {
          const unitFormat = Intl.NumberFormat("es-MX", { style: "unit", ...column.formatOptions })
          if (typeof value === "number") {
            return unitFormat.format(value as number)
          } else if (!isNaN(Number(typeof value))) {
            return unitFormat.format(Number(value) as number)
          }
          return "NaN"
        } else if (column.format === "date" || column.format === "datetime") {
          if (column.format === "date" && value instanceof Date) {
            return format(value as Date, "P")
          } else if (column.format === "datetime" && value instanceof Date) {
            return format(value as Date, "Pp")
          }
          return "Invalid Date"
        }
        return column.format(value as T[keyof T])
      } catch (error) {
        return "-"
      }
    }
    if (["string", "number", "bigint", "boolean", "undefined"].includes(typeof value)) {
      return value
    }
    return JSON.stringify(value)
  }

  function renderTd(column: Column<T>, object: T) {
    if (column.renderFn) {
      return column.renderFn(object);
    }
    const fieldName = column.fieldName
    if (!fieldName) {
      return JSON.stringify(object)
    }
    if ((fieldName as string).includes(".")) {
      if (column.format) {
        return formatValue(column, getValue(object, fieldName as NestedKey<T>))
      }
      return getValue(object, fieldName as NestedKey<T>)
    }
    if (typeof object[fieldName as keyof T] === "object") {
      if (column.format) {
        return formatValue(column, object[fieldName as keyof T])
      }
      return JSON.stringify(object[fieldName as keyof T])
    }
    if (column.format) {
      return formatValue(column, object[fieldName as keyof T])
    }
    return object[fieldName as keyof T] as string
  }

  function filterColumn(_column: Column<T> | Headers | string, index: number) {
    if (!filters) {
      return false
    }
    return filters.findIndex(fi => fi.target === index && fi.visible === false) === -1
  }

  useEffect(() => {
    setRefresh(true)
  }, [records, page])

  useEffect(() => {
    if (search) {
      setRefresh(true)
    }
  }, [search])

  useEffect(() => {
    setRefresh(true)
  }, [orderCol])

  function setOrder(index: number) {
    setOrderCol((current) => {
      if (!multiple_order) {
        if (current.length === 0) {
          current.push([-1, "ASC"])
        }
        if (current[0][0] !== index) {
          return [[index, "ASC"]]
        }
        if (current[0][1] === "ASC") {
          return [[index, "DESC"]]
        }
        return []
      }
      const find = current.find(curr => curr[0] === index);
      if (find) {
        const is_asc = [1, "ASC"].includes(find[1])
        const idx = find[0]
        if (is_asc) {
          return [
            ...current.filter(curr => curr[0] !== index),
            [idx, "DESC"]]
        }
        return [
          ...current.filter(curr => curr[0] !== index)
        ]
      } else {
        return [...current, [index, "ASC"]]
      }
    })
  }

  function renderOrder(index: number) {
    const find = orderCol.find(ord => ord[0] === index)
    const order = find?.[1]
    return (
      <svg className="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        {!(find && order) ? (<></>) : order === "ASC" ? (
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
    )
  }

  function sortDataMultilevelMulticols(data: T[]) {
    if (orderCol.length === 0) {
      return data
    }
    return data.sort((a, b) => {
      for (const [indexCol, order] of orderCol) {
        const keyPath = columns.filter(filterColumn)[indexCol].fieldName as string || columns[indexCol].orderValue as string
        if (!keyPath) {
          return 0
        }
        // Accede al valor de la clave multinivel
        const valueA = keyPath.split('.').reduce((obj: any, key) => obj?.[key], a);
        const valueB = keyPath.split('.').reduce((obj: any, key) => obj?.[key], b);

        // Manejo de valores undefined o null
        if (valueA == null && valueB != null) return ["ASC", 1].includes(order) ? -1 : 1;
        if (valueB == null && valueA != null) return ["ASC", 1].includes(order) ? 1 : -1;
        if (valueA == null && valueB == null) continue;

        // Comparación para strings y números
        if (typeof valueA === "string" && typeof valueB === "string") {
          const cmp = valueA.localeCompare(valueB);
          if (cmp !== 0) return ["ASC", 1].includes(order) ? cmp : -cmp;
        }
        if (typeof valueA === "number" && typeof valueB === "number") {
          const cmp = valueA - valueB;
          if (cmp !== 0) return ["ASC", 1].includes(order) ? cmp : -cmp;
        }
        const dateA = valueA instanceof Date ? valueA : new Date(valueA);
        const dateB = valueB instanceof Date ? valueB : new Date(valueB);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          const cmp = dateA.getTime() - dateB.getTime();
          if (cmp !== 0) return ["ASC", 1].includes(order) ? cmp : -cmp;
        }
      }
      return 0;
    })
  }

  useEffect(() => {
    if (control === "back") {
      return
    }
    setAllData((curr) => sortDataMultilevelMulticols(curr))
    setChangedOrder(true)
  }, [allData, orderCol])

  function limpiarString(input?: string): string | undefined {
    if (!input) return
    // Eliminar espacios al inicio y al final
    let str = input.trim();

    // Eliminar espacios dobles
    str = str.replace(/\s+/g, ' ');

    // Eliminar acentos excepto la "ñ"
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, (char) => {
      // Mantener la "ñ" y "Ñ"
      if (char === '\u0303' && /[nN]/.test(str[str.indexOf(char) - 1])) {
        return '';
      }
      return '';
    });
  }

  function filterData(data: T[], keys: { key: keyof T | NestedKey<T>, format?: FormatType<T>, formatOptions?: Intl.NumberFormatOptions | FormatOptions }[], searchString: string) {
    return data
      .map((obj, index) => {
        // Obtener y concatenar los valores de las claves dadas
        const concatenatedValues = keys
          .map(({ key, ...col }) => `${(key as string).includes('.') ? (formatValue(col as Column<T>, getValue(obj, key as NestedKey<T>, ""))) : formatValue(col as Column<T>, obj[key as keyof T])}`.toLowerCase())
          .join(" ");

        // Si la cadena de búsqueda está en el string concatenado, guardar el índice
        return concatenatedValues.includes(searchString.toLowerCase()) ? index : -1;
      })
      .filter(index => index !== -1); // Eliminar los -1 (que indican no coincidencias)
  }

  useEffect(() => {
    if (control === "back") {
      return
    } const cleaned_search = limpiarString(search);
    if (!cleaned_search) {
      setFilteredData({ indexes: [], is_filtered: false })
      return
    }
    const keys = columns.map(col => ({ key: col.fieldName || col.orderValue, format: col.format, formatOptions: col.formatOptions }))
      .filter((_k, index) => filters.find(f => f.target === index && f.searchable && f.visible))
      .filter(col => col.key != null) as { key: keyof T | NestedKey<T>, format?: FormatType<T>, formatOptions?: Intl.NumberFormatOptions | FormatOptions }[]
    setFilteredData({ indexes: filterData(allData, keys, cleaned_search), is_filtered: true })
  }, [allData, search])

  function getFilteredData(allData: T[], filteredData: { is_filtered: boolean; indexes: number[]; }) {
    if (!filteredData.is_filtered) {
      setCount(allData.length)
      return allData
    }
    if (filteredData.indexes.length === 0) {
      setCount(0)
      return []
    }
    const filter = allData.filter((_v, index) => filteredData.indexes.includes(index))
    setCount(filter.length)
    return filter
  }

  useEffect(() => {
    if (control === "back") {
      return
    }
    if (changedOrder) {
      setChangedOrder(false)
    }
    const start = page * records
    setCurrentData(getFilteredData(allData, filteredData).slice(start === 0 ? start : start + 1, start + records))
  }, [allData, filteredData, page, records, changedOrder])

  return (
    <>
      {searching && (
        <div className="mb-4">
          <label htmlFor="table-search" className="sr-only">Search</label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input type="text" onInput={({ currentTarget }) => setSearch(currentTarget.value)} id="table-search" className="block py-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar..." />
          </div>
        </div>
      )}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-300 dark:bg-gray-700 dark:text-gray-400">
            {!advancedHeaders ? (
              <tr>
                {
                  headers.filter(filterColumn).map((head, index) => (
                    <th scope="col" className={`px-6 py-3 ${filters.find((filter) => filter.target === index)?.orderable && "hover:bg-gray-400 dark:hover:bg-gray-600 cursor-pointer"}`} onClick={() => setOrder(index)} key={v4()}>
                      <span className="flex items-center">
                        {head}
                        {renderOrder(index)}
                      </span>
                    </th >
                  ))
                }
              </tr>
            ) : <>
              {headers.map(headers => (
                <tr key={v4()}>
                  {headers.filter(filterColumn).map((header, index) => (
                    <>
                      <th key={v4()} rowSpan={header.rowspan} colSpan={header.colspan} scope="col" className={`px-6 py-3 ${filters.find((filter) => filter.target === index)?.orderable && "hover:bg-gray-400 dark:hover:bg-gray-600 cursor-pointer"}`} onClick={() => setOrder(index)}>
                        <span className="flex items-center">
                          {header.label}
                          {renderOrder(index)}
                        </span>
                      </th>
                    </>
                  ))}
                </tr>
              ))}
            </>
            }
          </thead >
          <tbody>
            {loading ? (
              <>
                <td colSpan={headers.filter((_header, index) => filters.find(filter => filter.target !== index && !filter.visible)).length}>
                  <div className="text-center my-10">
                    <div role="status">
                      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                </td>
              </>
            ) : (
              <>
                {currentData.map(row => (
                  <tr key={v4()} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 even:hover:bg-gray-100 even:dark:hover:bg-gray-700">
                    <>
                      {columns
                        .filter(filterColumn)
                        .map((column) => (
                          <td key={v4()} className={`p-3`}>{renderTd(column, row) as string | React.ReactNode}</td>
                        ))}
                    </>
                  </tr>)
                )}
              </>
            )}
          </tbody>
          {footers && footers.length > 0 && (
            <tfoot className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-600 dark:text-gray-400">
              {!advancedFooters ? (
                <tr>
                  {
                    footers.filter(filterColumn).map((foot) => (
                      <th scope="col" className="px-6 py-3" key={v4()}>
                        <span className="flex items-center">
                          {foot}
                        </span>
                      </th >
                    ))
                  }
                </tr>
              ) : <>
                {footers.map(footers => (
                  <tr key={v4()}>
                    {footers.filter(filterColumn).map((foot) => (
                      <>
                        <th key={v4()} rowSpan={foot.rowspan} colSpan={foot.colspan}>
                          <span className="flex items-center">
                            {foot.label}
                          </span>
                        </th>
                      </>
                    ))}
                  </tr>
                ))}
              </>
              }
            </tfoot>
          )}
        </table>
      </div >
      {pagging && (
        <Pagination onChangeSelectPages={onChangeSelectPages} info={info} count={count} lengthMenu={lengthMenu} page={page} setPage={setPage} records={records} />
      )}
    </>
  )
}