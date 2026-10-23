import type React from 'react';
import type { Column, RowDef } from '../Datatable.type';

export interface CardsViewProps<T> {
    currentData: T[];
    columns: Column<T>[];
    filterColumn: (col: Column<T>, index: number) => boolean;
    getHeaderLabel: (index: number) => string;
    loading: boolean;
    renderTd: (column: Column<T>, object: T) => React.ReactNode;
    cardsPerRow: number;
    cardsClassName: string;
    renderCard?: (data: T, rowIndex: number) => React.ReactNode;
    rowDef?: RowDef<T>;
}

/**
 * Vista de Tarjetas (Cards) responsiva con soporte para celdas automáticas o plantilla personalizada con renderCard.
 *
 * @param { CardsViewProps<T> } props Configuración de datos, columnas, tarjetas por fila y diseño libre.
 * @returns { React.ReactNode } Contenedor grid con tarjetas renderizadas.
 * @author @luixeduard
 */
export default function CardsView<T>({
    currentData,
    columns,
    filterColumn,
    getHeaderLabel,
    loading,
    renderTd,
    cardsPerRow,
    cardsClassName,
    renderCard,
    rowDef,
}: CardsViewProps<T>): React.ReactNode {
    if (loading) {
        return (
            <div className="datatable-cards-wrapper w-full datatable-fade-enter">
                <div className="flex flex-col justify-center items-center p-12 gap-3">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Cargando tarjetas...
                    </span>
                </div>
            </div>
        );
    }

    if (currentData.length === 0) {
        return (
            <div className="datatable-cards-wrapper w-full datatable-fade-enter">
                <div className="datatable-card--empty text-center p-12 font-semibold text-slate-400">
                    SIN DATOS
                </div>
            </div>
        );
    }

    return (
        <div className="datatable-cards-wrapper w-full">
            <div
                className="datatable-cards-grid"
                style={{
                    '--datatable-cards-per-row': cardsPerRow,
                    '--cards-per-row': cardsPerRow,
                } as React.CSSProperties}
            >
                {currentData.map((row, rowIndex) => {
                    const record = row as Record<string, unknown> | null | undefined;
                    const rowKey =
                        (record?._id as string | number | undefined) ??
                        (record?.id as string | number | undefined) ??
                        `card-row-${rowIndex}`;
                    const staggerDelay = Math.min(rowIndex * 35, 350);

                    return (
                        <div
                            key={rowKey}
                            onDoubleClick={(evt) => rowDef?.onDoubleClick?.(evt, row)}
                            onClick={(evt) => rowDef?.onClick?.(evt, row)}
                            style={{ animationDelay: `${staggerDelay}ms` }}
                            className={['datatable-card', cardsClassName].filter(Boolean).join(' ')}
                        >
                            {renderCard ? (
                                renderCard(row, rowIndex)
                            ) : (
                                columns.map((column, colIndex) => {
                                    if (!filterColumn(column, colIndex)) return null;
                                    const label = getHeaderLabel(colIndex);
                                    const showLabel = Boolean(label) && !column.hideCardLabel;

                                    return (
                                        <div
                                            key={`cell-${colIndex}`}
                                            className={[
                                                'datatable-card__cell',
                                                !showLabel ? 'datatable-card__cell--unlabeled' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        >
                                            {showLabel && (
                                                <span className="datatable-card__label">{label}</span>
                                            )}
                                            <div className="datatable-card__value">
                                                {renderTd(column, row)}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
