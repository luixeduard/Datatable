import type React from 'react';
import { useEffect, useRef } from 'react';

/**
 * Propiedades del componente de scroll infinito de la tabla.
 */
export interface TableInfiniteScrollProps {
    mode: 'auto' | 'manual';
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    buttonText?: string;
    loadingText?: string;
}

/**
 * Componente que gestiona el disparador de scroll infinito (automático mediante IntersectionObserver o manual mediante botón centrado).
 *
 * @param { TableInfiniteScrollProps } props Configuración del scroll infinito.
 * @returns { React.ReactNode } Botón centrado o centinela con indicador de carga.
 * @author @luixeduard
 */
export default function TableInfiniteScroll({
    mode,
    loading,
    hasMore,
    onLoadMore,
    buttonText = 'Cargar más datos',
    loadingText = 'Cargando más datos...',
}: TableInfiniteScrollProps): React.ReactNode {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mode !== 'auto' || !hasMore || loading) return;

        const target = sentinelRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry && entry.isIntersecting) {
                    onLoadMore();
                }
            },
            {
                rootMargin: '120px',
                threshold: 0.1,
            },
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [mode, hasMore, loading, onLoadMore]);

    if (!hasMore && !loading) {
        return (
            <div className="datatable-infinite-scroll-end w-full flex justify-center py-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                Has llegado al final de los resultados
            </div>
        );
    }

    if (mode === 'manual') {
        return (
            <div className="datatable-infinite-scroll w-full flex justify-center py-5">
                <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loading}
                    className="datatable-infinite-scroll-btn px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-hidden focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all duration-150 inline-flex items-center gap-2 cursor-pointer"
                >
                    {loading && (
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    )}
                    <span>{loading ? loadingText : buttonText}</span>
                </button>
            </div>
        );
    }

    return (
        <div ref={sentinelRef} className="w-full flex justify-center items-center py-5 min-h-[50px]">
            {loading && (
                <div className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{loadingText}</span>
                </div>
            )}
        </div>
    );
}
