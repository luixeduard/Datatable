import { useEffect, useState } from "react";
import { DatatableType } from "./Datatable.type";
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
  const advancedHeaders = headers.every(header => typeof header !== "string")

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
      getData(page, records, columns.map(col => col.orderValue || col.fieldName), order).then((data) => {
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
                  headers.map(head => (<th scope="col" className="px-6 py-3">{head}</th>))
                }
              </tr>
            ) : <>
              {headers.map(headers => (
                <tr>
                  {headers.map(header => <th rowSpan={header.rowspan} colSpan={header.colspan}>{header.label}</th>)}
                </tr>
              ))}
            </>
            }
          </thead >
        </table>
      </div>
      {pagging && (
        <Pagination onChangeSelectPages={onChangeSelectPages} count={count} lengthMenu={lengthMenu} pageState={[page, setPage]} records={records} />
      )}

    </>
  )
}