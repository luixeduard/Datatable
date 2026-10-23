import type React from 'react';
import type { DatatableCoreExtraProps, DatatableType } from './Datatable.type';
import DatatableWithStore from './components/datatable-with-store';
import useDatatable from './hooks/use-datatable';
import useStickyColumns from './hooks/use-sticky-columns';
import TableToolbar from './components/table-toolbar';
import TableHead from './components/table-head';
import TableBody from './components/table-body';
import TableFoot from './components/table-foot';
import CardsView from './components/cards-view';
import TablePaginationBar from './components/table-pagination-bar';
import TableInfiniteScroll from './components/table-infinite-scroll';
import './index.css';

export type * from './Datatable.type';
export * from './datatableSlice';
export { default as TableToolbar } from './components/table-toolbar';
export { default as TableSearch } from './components/table-search';
export { default as TableViewToggle } from './components/table-view-toggle';
export { default as TableColumnVisibility } from './components/table-column-visibility';
export { default as TableHead } from './components/table-head';
export { default as TableBody } from './components/table-body';
export { default as TableFoot } from './components/table-foot';
export { default as CardsView } from './components/cards-view';
export { default as TablePaginationBar } from './components/table-pagination-bar';
export { default as TablePageSize } from './components/table-page-size';
export { default as TableInfo } from './components/table-info';
export { default as TablePagination } from './components/table-pagination';
export { default as TableInfiniteScroll } from './components/table-infinite-scroll';
export { default as useDatatable } from './hooks/use-datatable';
export { default as useStickyColumns } from './hooks/use-sticky-columns';

/**
 * Componente núcleo del Datatable que orquesta la presentación modular de la tabla, tarjetas, paginación y scroll infinito.
 *
 * @param { DatatableType<T> & DatatableCoreExtraProps } props Propiedades de configuración.
 * @returns { React.ReactNode } Interfaz completa de tabla, controles y paginación / scroll infinito.
 * @author @luixeduard
 */
function DatatableCore<T>(props: DatatableType<T> & DatatableCoreExtraProps): React.ReactNode {
    const {
        headers,
        footers,
        columnDef,
        rowDef,
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
        info = true,
        columnVisibility = true,
        stickyHeader = true,
        maxHeight,
        cardsClassName = '',
        cardsRender = false,
        cardsPerRow = 1,
        renderCard,
        infiniteScroll,
        enableInfiniteScroll,
        infiniteScrollMode,
        infiniteScrollButtonText,
        initialSearch,
        initialPage,
        initialRecords,
        initialOrder,
        initialViewMode,
        initialVisibleColumns,
        onTableStateChange,
    } = props;

    const {
        activeView,
        setActiveView,
        isCardsView,
        currentData,
        loading,
        count,
        page,
        setPage,
        records,
        onChangeSelectPages,
        search,
        setSearch,
        orderCol,
        setOrder,
        filters,
        filterColumn,
        toggleColumnVisibility,
        showAllColumns,
        getHeaderLabel,
        renderTd,
        isInfiniteScroll,
        infiniteScrollMode: resolvedInfiniteMode,
        hasMore,
        loadMore,
    } = useDatatable<T>({
        control,
        data,
        getData,
        columns,
        headers,
        columnDef,
        order,
        multiple_order,
        lengthMenu,
        stateRefresh,
        cardsRender,
        infiniteScroll,
        enableInfiniteScroll,
        infiniteScrollMode,
        infiniteScrollButtonText,
        columnVisibility,
        initialSearch,
        initialPage,
        initialRecords,
        initialOrder,
        initialViewMode,
        initialVisibleColumns,
        onTableStateChange,
    });

    const { tableRef, getStickyInfo } = useStickyColumns(columns, filters, filterColumn);

    return (
        <div className="datatable-root w-full flex flex-col text-slate-800 dark:text-slate-100">
            <TableToolbar
                searching={searching}
                search={search}
                onSearchChange={setSearch}
                showViewToggle={cardsRender === 'auto'}
                activeView={activeView}
                onViewChange={setActiveView}
                columnVisibility={columnVisibility}
                columns={columns}
                getHeaderLabel={getHeaderLabel}
                filterColumn={filterColumn}
                onToggleColumn={toggleColumnVisibility}
                onShowAllColumns={showAllColumns}
            />

            {isCardsView ? (
                <CardsView
                    currentData={currentData}
                    columns={columns}
                    filterColumn={filterColumn}
                    getHeaderLabel={getHeaderLabel}
                    loading={loading && currentData.length === 0}
                    renderTd={renderTd}
                    cardsPerRow={cardsPerRow}
                    cardsClassName={cardsClassName}
                    renderCard={renderCard}
                    rowDef={rowDef}
                />
            ) : (
                <div
                    className={`datatable-table-container relative overflow-x-auto shadow-2xs sm:rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 ${
                        maxHeight ? 'overflow-y-auto' : ''
                    }`}
                    style={maxHeight ? { maxHeight } : undefined}
                >
                    <table ref={tableRef} className="datatable-table w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                        <TableHead
                            headers={headers}
                            columns={columns}
                            filters={filters}
                            filterColumn={filterColumn}
                            orderCol={orderCol}
                            onToggleOrder={setOrder}
                            getStickyInfo={getStickyInfo}
                            stickyHeader={stickyHeader}
                        />
                        <TableBody
                            currentData={currentData}
                            columns={columns}
                            filters={filters}
                            filterColumn={filterColumn}
                            loading={loading && currentData.length === 0}
                            renderTd={renderTd}
                            rowDef={rowDef}
                            getStickyInfo={getStickyInfo}
                        />
                        <TableFoot
                            footers={footers}
                            columns={columns}
                            filterColumn={filterColumn}
                            getStickyInfo={getStickyInfo}
                        />
                    </table>
                </div>
            )}

            {isInfiniteScroll ? (
                <>
                    <TableInfiniteScroll
                        mode={resolvedInfiniteMode}
                        loading={loading}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        buttonText={infiniteScrollButtonText}
                    />
                    {info && count !== undefined && (
                        <div className="w-full flex justify-center pb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                            Mostrando {currentData.length} de {count} registros
                        </div>
                    )}
                </>
            ) : (
                <TablePaginationBar
                    pagging={pagging}
                    info={info}
                    count={count}
                    page={page}
                    setPage={setPage}
                    records={records}
                    lengthMenu={lengthMenu}
                    onChangeSelectPages={onChangeSelectPages}
                />
            )}
        </div>
    );
}

/**
 * Componente principal Datatable para React con soporte para backend, frontend, tarjetas, paginación y scroll infinito.
 *
 * @param { DatatableType<T> } props Propiedades completas de la tabla.
 * @returns { React.ReactNode } Datatable renderizado.
 * @author @luixeduard
 */
export default function Datatable<T>(props: DatatableType<T>): React.ReactNode {
    if (props.store && props.tableId) {
        return (
            <DatatableWithStore
                props={props}
                renderCore={(extraProps) => <DatatableCore {...props} {...extraProps} />}
            />
        );
    }

    return <DatatableCore {...props} />;
}