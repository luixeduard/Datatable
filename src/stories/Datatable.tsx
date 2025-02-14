import { useEffect, useState } from "react";
import { DatatableType } from "./Datatable.type";
import Pagination from "./Pagination";

export default function Datatable<T>({
  headers,
  columnDef,
  control = "back",
  data,
  getData,
  defaultRecords = 5,
  columns,
  order = [[0, "DESC"]],
  lengthMenu = [5, 10, 20, 40, 100],
  stateRefresh,
  pagging = true
}: DatatableType<T>) {
  const [allData, setAllData] = control === "front" && data ? data : useState<T[]>([]);
  const [page, setPage] = useState(0)
  const [records, setRecords] = useState(defaultRecords)
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

  return (
    <>
      <thead>
        {!advancedHeaders ? (
          <tr>
            {
              headers.map(head => (<th>{head}</th>))
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
      {pagging && (
        <Pagination count={count} lengthMenu={lengthMenu} page={page} records={records} />
      )
      }
    </>
  )
}