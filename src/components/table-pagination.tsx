import type React from 'react';
import { useEffect, useState } from 'react';

export interface TablePaginationProps {
    count?: number;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    records: number;
}

type PaginationButtonType = number | 'first' | 'last' | 'next' | 'before';

/**
 * Controles de navegación y botones de páginas para el Datatable.
 *
 * @param { TablePaginationProps } props Propiedades de cálculo y cambio de página.
 * @returns { React.ReactNode } Barra de botones de páginas numeradas y flechas.
 * @author @luixeduard
 */
export default function TablePagination({
    count,
    page,
    setPage,
    records,
}: TablePaginationProps): React.ReactNode {
    const [buttons, setButtons] = useState<PaginationButtonType[]>([]);

    useEffect(() => {
        if (typeof count === 'number' && count > 0 && page > -1 && records > 0) {
            const totalPages = Math.ceil(count / records);
            if (totalPages <= 1) {
                setButtons([1]);
                return;
            }
            const first = page < 2 ? 1 : page - 1;
            const last = first + 4 <= totalPages ? first + 4 : totalPages;
            const btnList: PaginationButtonType[] = [];
            for (let i = first; i <= last; i++) {
                btnList.push(i);
            }
            if (btnList.length < 5 && btnList.length < totalPages) {
                const diff = Math.min(5 - btnList.length, first - 1);
                for (let index = first - 1; index >= first - diff; index--) {
                    btnList.unshift(index);
                }
            }
            if (page > 0) {
                btnList.unshift('before');
                if (typeof btnList[1] === 'number' && btnList[1] > 1) {
                    btnList.unshift('first');
                }
            }
            if (page < totalPages - 1) {
                btnList.push('next');
                const lastNum = btnList[btnList.length - 2];
                if (typeof lastNum === 'number' && lastNum < totalPages) {
                    btnList.push('last');
                }
            }
            setButtons(btnList);
        } else {
            setButtons([]);
        }
    }, [count, page, records]);

    function renderButton(value: PaginationButtonType, index: number) {
        const isFirst = index === 0;
        const isLast = index === buttons.length - 1;
        const totalPages = count && records ? Math.max(0, Math.ceil(count / records) - 1) : 0;

        if (typeof value === 'number') {
            const isActive = page + 1 === value;
            return (
                <button
                    type="button"
                    onClick={() => setPage(value - 1)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`cursor-pointer select-none flex items-center justify-center px-3.5 h-9 text-xs font-semibold leading-tight border transition-colors ${
                        isFirst ? 'rounded-s-lg' : ''
                    } ${isLast ? 'rounded-e-lg' : ''} ${
                        isActive
                            ? 'z-10 text-slate-900 border-slate-300 bg-slate-100 font-bold dark:border-slate-600 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                    }`}
                >
                    {value}
                </button>
            );
        }

        if (value === 'before') {
            return (
                <button
                    type="button"
                    onClick={() => setPage((val) => Math.max(0, val - 1))}
                    title="Página anterior"
                    className={`cursor-pointer select-none flex items-center justify-center px-3 h-9 text-xs leading-tight text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors ${
                        isFirst ? 'rounded-s-lg' : ''
                    }`}
                >
                    <span className="sr-only">Anterior</span>
                    <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
                    </svg>
                </button>
            );
        }

        if (value === 'first') {
            return (
                <button
                    type="button"
                    onClick={() => setPage(0)}
                    title="Primera página"
                    className={`cursor-pointer select-none flex items-center justify-center px-3 h-9 text-xs leading-tight text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors ${
                        isFirst ? 'rounded-s-lg' : ''
                    }`}
                >
                    <span className="sr-only">Primera página</span>
                    <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 10 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 1 1 5l2 4M7 1 5 5l2 4" />
                    </svg>
                </button>
            );
        }

        if (value === 'next') {
            return (
                <button
                    type="button"
                    onClick={() => setPage((val) => val + 1)}
                    title="Página siguiente"
                    className={`cursor-pointer select-none flex items-center justify-center px-3 h-9 text-xs leading-tight text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors ${
                        isLast ? 'rounded-e-lg' : ''
                    }`}
                >
                    <span className="sr-only">Siguiente</span>
                    <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                    </svg>
                </button>
            );
        }

        return (
            <button
                type="button"
                onClick={() => setPage(totalPages)}
                title="Última página"
                className={`cursor-pointer select-none flex items-center justify-center px-3 h-9 text-xs leading-tight text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors ${
                    isLast ? 'rounded-e-lg' : ''
                }`}
            >
                <span className="sr-only">Última página</span>
                <svg className="w-3 h-3 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 10 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1 3 5l-2 4M5 1 7 5l-2 4" />
                </svg>
            </button>
        );
    }

    if (buttons.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Navegación de páginas">
            <ul className="flex items-center -space-x-px h-9 text-xs shadow-2xs">
                {buttons.map((valuePagging, index) => (
                    <li key={`page-btn-${index}-${valuePagging}`}>
                        {renderButton(valuePagging, index)}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
