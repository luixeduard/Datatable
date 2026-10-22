import { PagginationType } from "./Pagination.type";
import { useEffect, useState } from "react";

export default function Pagination({ count, page, setPage, records, lengthMenu, onChangeSelectPages, info }: PagginationType) {
  const [Buttons, setButtons] = useState<(number | 'first' | 'last' | 'next' | 'before')[]>([]);

  useEffect(() => {
    if (typeof count === "number" && count > 0 && page > -1 && records > 0) {
      const totalPages = Math.ceil(count / records);
      if (totalPages <= 1) {
        setButtons([1]);
        return;
      }
      const first = page < 2 ? 1 : page - 1;
      const last = (first + 4) <= totalPages ? first + 4 : totalPages;
      const buttons: (number | 'first' | 'last' | 'next' | 'before')[] = [];
      for (let i = first; i <= last; i++) {
        buttons.push(i);
      }
      if (buttons.length < 5 && buttons.length < totalPages) {
        const dif = Math.min(5 - buttons.length, first - 1);
        for (let index = first - 1; index >= first - dif; index--) {
          buttons.unshift(index);
        }
      }
      if (page > 0) {
        buttons.unshift('before');
        if (typeof buttons[1] === "number" && buttons[1] > 1) {
          buttons.unshift('first');
        }
      }
      if (page < totalPages - 1) {
        buttons.push('next');
        const lastNum = buttons[buttons.length - 2];
        if (typeof lastNum === "number" && lastNum < totalPages) {
          buttons.push('last');
        }
      }
      setButtons(buttons);
    } else {
      setButtons([]);
    }
  }, [count, page, records]);

  function renderButton(value: number | "first" | "last" | "next" | "before", index: number) {
    if (typeof value === "number") {
      return (
        <button
          type="button"
          onClick={() => setPage(value - 1)}
          aria-current={page + 1 === value ? 'page' : undefined}
          className={`${index === 0 && 'rounded-s-lg'} ${index === Buttons.length - 1 && 'rounded-e-lg'} ${page + 1 === value && 'z-10'} cursor-pointer select-none flex items-center justify-center px-4 h-10 leading-tight ${page + 1 === value ? 'text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
        >
          {value}
        </button>
      );
    } else if (value === 'before') {
      return (
        <button
          type="button"
          onClick={() => setPage((val) => Math.max(0, val - 1))}
          className={`cursor-pointer select-none flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 ${index === 0 && 'rounded-s-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
        >
          <span className="sr-only">Anterior</span>
          <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
          </svg>
        </button>
      );
    } else if (value === "first") {
      return (
        <button
          type="button"
          onClick={() => setPage(0)}
          className={`cursor-pointer select-none flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 ${index === 0 && 'rounded-s-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
        >
          <span className="sr-only">Primera pagina</span>
          <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 1 1 5l2 4" />
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 5 5l2 4" />
          </svg>
        </button>
      );
    } else if (value === "next") {
      return (
        <button
          type="button"
          onClick={() => setPage((val) => val + 1)}
          className={`cursor-pointer select-none flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 ${index === Buttons.length - 1 && 'rounded-e-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
        >
          <span className="sr-only">Siguiente</span>
          <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
          </svg>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setPage(count && records ? Math.max(0, Math.ceil(count / records) - 1) : 0)}
        className={`cursor-pointer select-none flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 ${index === Buttons.length - 1 && 'rounded-e-lg'} hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
      >
        <span className="sr-only">Ultima pagina</span>
        <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 10">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1 3 5l-2 4" />
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 7 5l-2 4" />
        </svg>
      </button>
    );
  }

  return (
    <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
      <div className="block">
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 md:inline md:w-auto me-2">Mostrando:</span>
        <select value={records} onChange={onChangeSelectPages} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          {lengthMenu.map((value, idx) => (
            <option key={`menu-${idx}-${typeof value === "number" ? value : value.value}`} value={typeof value === "number" ? value : value.value}>
              {typeof value === "number" ? value : value.label}
            </option>
          ))}
        </select>
      </div>
      {info && (
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto bg-white dark:bg-gray-700 rounded-3xl p-2">
          Mostrando{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {(count ?? 0) === 0 ? 0 : page * records + 1} -{" "}
            {(count ?? 0) === 0
              ? 0
              : (page + 1) * records > (count ?? 0)
              ? count ?? 0
              : (page + 1) * records}
          </span>{" "}
          de <span className="font-semibold text-gray-900 dark:text-white">{count ?? 0}</span>
        </span>
      )}
      <nav aria-label="Pagination Datatable">
        <ul className="flex items-center -space-x-px h-8 text-sm">
          {Buttons.map((valuePagging, index) => (
            <li key={`btn-${index}-${valuePagging}`}>
              {renderButton(valuePagging, index)}
            </li>
          ))}
        </ul>
      </nav>
    </nav>
  );
}