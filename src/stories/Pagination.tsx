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
      if (page > 0) {
        buttons.unshift('before')
        if (typeof buttons[1] === "number" && buttons[1] > 1) {
          buttons.unshift('first')
        }
      }
      if (page < Math.ceil(count / records) - 1) {
        buttons.push('next')
        const lastIndex = buttons.length - 2
        if (typeof buttons[lastIndex] === "number" && buttons[lastIndex] < Math.ceil(count / records)) {
          buttons.push('last')
        }
      }

      setButtons(buttons)
    } else {
      setButtons([])
    }
  }, [count, page, records])

  function renderButton(value: number | "first" | "last" | "next" | "before", index: number) {
    if (typeof value === "number") {
      return <div onClick={() => setPage(value - 1)} aria-current={page + 1 === value ? 'page' : undefined} className={`${index === 0 && 'rounded-s-lg'} ${index === Buttons.length - 1 && 'rounded-e-lg'} ${page + 1 === value && 'z-10'} flex items-center justify-center px-4 h-10 leading-tight ${page + 1 === value ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}>{value}</div>
    } else if (value === 'before') {
      return (
        <div onClick={() => setPage(page - 1)} className={`flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 ${index === 0 && 'rounded-s-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}>
          <span className="sr-only">Anterior</span>
          <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4" />
          </svg>
        </div>
      )
    } else if (value === "first") {
      return (
        <div onClick={() => setPage(0)} className={`flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 ${index === 0 && 'rounded-s-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}>
          <span className="sr-only">Primera pagina</span>
          <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 1 1 5l2 4" />
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 1 5 5l2 4" />
          </svg>
        </div>
      )
    } else if (value === "next") {
      return (
        <div onClick={() => setPage(page + 1)} className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 ${index === Buttons.length - 1 && 'rounded-e-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}>
          <span className="sr-only">Siguiente</span>
          <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
          </svg>
        </div>
      )
    }
    return (
      <div onClick={() => setPage(count ? Math.ceil(count / records) - 1 : 0)} className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 ${index === Buttons.length - 1 && 'rounded-e-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}>
        <span className="sr-only">Ultima pagina</span>
        <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1 3 5l-2 4" />
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 7 5l-2 4" />
        </svg>
      </div>
    )
  }

  return (
    <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
      <div className="block">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 md:inline md:w-auto me-2">Mostrando:</span>
        <select value={records} onChange={onChangeSelectPages} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          {lengthMenu.map((value) => (
            <option key={v4()} value={typeof value === "number" ? value : value.value}>{typeof value === "number" ? value : value.label}</option>
          ))}
        </select>
      </div>
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">Mostrando <span className="font-semibold text-gray-900 dark:text-white">{(page * records) + 1} - {count ? ((page + 1) * records) > count ? count : (page + 1) * records : '?'}</span> de <span className="font-semibold text-gray-900 dark:text-white">{count}</span></span>
      <nav aria-label="Pagination Datatable">
        <ul className="flex items-center -space-x-px h-8 text-sm">
          {Buttons.map((valuePagging, index) => (
            <li>
              {renderButton(valuePagging, index)}
            </li >
          ))}
        </ul>
      </nav>
    </nav >
  )
}