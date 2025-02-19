import { v4 } from "uuid";
import { PagginationType } from "./Pagination.type";
import { useEffect, useState } from "react";

export default function Pagination({ count, pageState, records, lengthMenu, onChangeSelectPages }: PagginationType) {
  const [Buttons, setButtons] = useState<(number | 'first' | 'last' | 'next' | 'before')[]>([])
  const [page, setPage] = pageState

  useEffect(() => {
    if (count && count > 0) {
      const first = page < 2 ? 1 : page - 1;
      const last = (first + 4) * records < count ? first + 5 : Math.ceil(count / records) + 1
      const buttons: (number | 'first' | 'last' | 'next' | 'before')[] = new Array(last - first).fill(0).map((value, index) => index + first)
      if (buttons.length !== 5) {
        const dif = 5 - buttons.length + 1
        for (let index = first - 1; index > (first - dif < 1 ? 1 : first - dif); index--) {
          buttons.unshift(index)
        }
      }
      if (typeof buttons[0] === "number" && buttons[0] > 1) {
        buttons.unshift('before')
        if (typeof buttons[1] === "number" && buttons[1] > 2) {
          buttons.unshift('first')
        }
      }
      
      setButtons(buttons)
    } else {
      setButtons([])
    }
  }, [count, page, records])

  return (
    <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
      <div className="block">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 md:inline md:w-auto me-2">Mostrando:</span>
        <select onChange={onChangeSelectPages} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          {lengthMenu.map((value, index) => (
            <option key={v4()} selected={index === 0} value={typeof value === "number" ? value : value.value}>{typeof value === "number" ? value : value.label}</option>
          ))}
        </select>
      </div>
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">Mostrando <span className="font-semibold text-gray-900 dark:text-white">{(page * records) + 1} - {count ? ((page + 1) * records) > count ? count : (page + 1) * records : '?'}</span> de <span className="font-semibold text-gray-900 dark:text-white">{count}</span></span>
      <nav aria-label="Pagination Datatable">
        <ul className="flex items-center -space-x-px h-10 text-base">
          {Buttons.map((valuePagging, index) => (
            <li>
              {typeof valuePagging === "number" ?
                <div onClick={() => setPage(valuePagging - 1)} aria-current={page + 1 === valuePagging ? 'page' : undefined} className={`${index === 0 && 'rounded-s-lg'} ${page + 1 === valuePagging && 'z-10'} flex items-center justify-center px-4 h-10 leading-tight ${page + 1 === valuePagging ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}>{valuePagging}</div>
                : valuePagging === 'before' ?
                  <div onClick={() => setPage(page - 1)} className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                    <span className="sr-only">Anterior</span>
                    <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4" />
                    </svg>
                  </div>
                  : <></>}
            </li>
          ))}
        </ul>
      </nav>
    </nav>
  )
}