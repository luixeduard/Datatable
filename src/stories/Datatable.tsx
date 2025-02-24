import { useEffect, useState } from "react";
import { Column, ColumnDef, DatatableType, Headers, NestedKey } from "./Datatable.type";
import Pagination from "./Pagination";
import { v4 } from "uuid";

export default function Datatable<T>({
  headers,
  columnDef,
  control = "back",
  data,
  getData,
  columns,
  order = [[0, "DESC"]],
  multiple_order = false,
  lengthMenu = [5, 10, 20, 40, 100],
  stateRefresh,
  pagging = true,
  searching = true
}: DatatableType<T>) {
  const [allData, setAllData] = control === "front" && data ? data : useState<T[]>([]);
  const [page, setPage] = useState(0)
  const [records, setRecords] = useState(typeof lengthMenu[0] === "number" ? lengthMenu[0] : lengthMenu[0].value)
  const [count, setCount] = useState<number | undefined>()
  const [refresh, setRefresh] = stateRefresh ? stateRefresh : useState<boolean>(true)
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

  if (headers.length !== columns.length) {
    throw new Error("Numero de headers y columnas diferente")
  }

  useEffect(() => {
    if (refresh) { //Si se refresca la pagina se establece fresh en false
      setRefresh(false)
    } else { //Si el refresh esta en false se retorna
      return
    }
    if (control === "back") {//Si el control esta por back
      if (!getData) {//Si el getData no esta definido dar error
        throw new Error("No se definio la funcion getData")
      }
      getData(page, records, columns.map(col => (col.orderValue || col.fieldName) as string), order).then((data) => {
        if (setAllData) {
          setAllData(data.rows);
          setPage(data.page);
          setRecords(data.records);
          setCount(data.count)
        }
      })
    }
  }, [control, refresh])

  function onChangeSelectPages(event: React.ChangeEvent<HTMLSelectElement>) {
    setPage(0)
    setRecords(Number(event.currentTarget.value))
    setRefresh(true)
  }

  function getValue(object: T, key: NestedKey<T>) {
    const keys = (key as string).split(".")
    let curr_object = object as any
    keys.some(key => {
      if (key in curr_object) {
        curr_object = curr_object[key]
        return false
      }
      curr_object = "-";
      return true
    })
    return curr_object
  }

  function getValueColumnDef(index: number, key: keyof ColumnDef): boolean {
    const filter = columnDef?.find(c => key in c && ("target" in c && (c.target === index || c.target === "_all")) || "targets" in c && c.targets?.includes(index))
    return !filter ? true : filter[key] as boolean;
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
      return getValue(object, fieldName as NestedKey<T>)
    }
    if (typeof object[fieldName as keyof T] === "object") {
      return JSON.stringify(object[fieldName as keyof T])
    }
    return object[fieldName as keyof T] as string
  }

  function filterColumn(_column: Column<T> | Headers | string, index: number) {
    if (!filters) {
      return false
    }
    return filters.findIndex(fi => fi.target === index && fi.visible === false) === -1
  }

  return (
    <>
      {searching && (
        <div className="pb-4 bg-white dark:bg-gray-900">
          <label htmlFor="table-search" className="sr-only">Search</label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input type="text" id="table-search" className="block py-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar..." />
          </div>
        </div>
      )}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            {!advancedHeaders ? (
              <tr>
                {
                  headers.filter(filterColumn).map((head) => (
                    <th scope="col" className="px-6 py-3">
                      <span className="flex items-center">
                        {head}
                        <svg className="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="blue" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 19l-4-4" />
                          <path stroke="blue" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 19l4-4" />
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 5l-4 4" />
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 5l4 4" />
                        </svg>
                      </span>
                    </th >
                  ))
                }
              </tr>
            ) : <>
              {headers.map(headers => (
                <tr>
                  {headers.filter(filterColumn).map((header) => (
                    <>
                      <th rowSpan={header.rowspan} colSpan={header.colspan}>
                        <span className="flex items-center">
                          {header.label}
                          <svg className="w-4 h-4 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 19l-4-4" />
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 19l4-4" />
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 5l-4 4" />
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 5l4 4" />
                          </svg>
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
            {allData.map(row => (
              <tr key={v4()}>
                {columns
                  .filter(filterColumn)
                  .map((column) => (
                    <td>{renderTd(column, row)}</td>
                  ))}
              </tr>)
            )}
          </tbody>
        </table>
      </div >
      {pagging && (
        <Pagination onChangeSelectPages={onChangeSelectPages} count={count} lengthMenu={lengthMenu} pageState={[page, setPage]} records={records} />
      )
      }

    </>
  )
}