import type { Meta, StoryObj } from '@storybook/react';
import Datatable from '../index';
import { type ProductItem, productsData } from './cards-mock-data';
import type { Column } from '../Datatable.type';

const meta = {
    title: 'Datatable/Columnas y Sticky',
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Demostración del thead completo fijado (sticky header), columnas fijas apiladas en forma de pila (sticky columns) y selector de columnas visibles en tiempo real.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const wideHeaders = [
    'ID',
    'Producto',
    'Categoría',
    'Marca',
    'Precio',
    'Stock',
    'Calificación',
    'Envío',
    'Descripción Larga',
];

const stickyColumns: Column<ProductItem>[] = [
    {
        fieldName: 'id',
        sticky: true,
        renderFn: (data: ProductItem) => (
            <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                #{data.id}
            </span>
        ),
    },
    {
        fieldName: 'title',
        sticky: true,
        renderFn: (data: ProductItem) => (
            <div className="font-semibold text-slate-900 dark:text-slate-100 min-w-[200px]">
                {data.title}
            </div>
        ),
    },
    {
        fieldName: 'category',
        renderFn: (data: ProductItem) => (
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 min-w-[100px]">
                {data.category}
            </span>
        ),
    },
    {
        fieldName: 'brand',
        renderFn: (data: ProductItem) => (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[100px]">
                {data.brand}
            </span>
        ),
    },
    {
        fieldName: 'price',
        format: 'currency',
    },
    {
        fieldName: 'stock',
        renderFn: (data: ProductItem) => (
            <span className={`text-xs font-semibold ${data.stock < 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {data.stock} uds
            </span>
        ),
    },
    {
        fieldName: 'rating.rate',
        renderFn: (data: ProductItem) => (
            <span className="text-xs text-amber-500 font-semibold min-w-[80px]">
                ★ {data.rating.rate.toFixed(1)}
            </span>
        ),
    },
    {
        fieldName: 'freeShipping',
        renderFn: (data: ProductItem) => (
            <span className={`text-xs font-medium ${data.freeShipping ? 'text-emerald-500' : 'text-slate-400'}`}>
                {data.freeShipping ? 'Gratis' : 'Estándar'}
            </span>
        ),
    },
    {
        fieldName: 'description',
        renderFn: (data: ProductItem) => (
            <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[280px] block truncate">
                {data.description}
            </span>
        ),
    },
];

/**
 * 1. Columnas Sticky en Pila (Stacked Sticky Columns):
 * Las dos primeras columnas (ID y Producto) tienen sticky: true. Al desplazarse horizontalmente,
 * la columna ID se fija al borde izquierdo y la columna Producto se fija inmediatamente a su derecha (en pila).
 */
export const StackedStickyColumnsStory: Story = {
    name: '1. Columnas Sticky Apiladas',
    render: () => (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                    Columnas Sticky en Forma de Pila
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Desplaza la tabla horizontalmente hacia la derecha. Las columnas <strong>ID</strong> y{' '}
                    <strong>Producto</strong> se mantienen fijas a la izquierda acumulando sus anchos en pila.
                </p>
            </div>

            <Datatable<ProductItem>
                control="front"
                data={productsData}
                columns={stickyColumns}
                headers={wideHeaders}
                lengthMenu={[5, 10]}
                columnVisibility={true}
            />
        </div>
    ),
};

/**
 * 2. Thead Completo Sticky con Columnas Apiladas (Scroll 2D):
 * Demuestra el encabezado thead completo fijado verticalmente (top: 0) combinado con columnas
 * sticky horizontales acumuladas en pila, dentro de un contenedor con desplazamiento vertical (maxHeight).
 */
export const StickyHeaderAndColumnsStory: Story = {
    name: '2. Thead Sticky y Columnas Apiladas (2D)',
    render: () => (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200 text-sm">
                    Thead Sticky Completo + Columnas Apiladas (Scroll Bidireccional)
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Desplaza verticalmente para ver el <strong>thead completo</strong> mantenerse fijo en la parte superior.
                    Desplaza horizontalmente para ver las columnas <strong>ID</strong> y <strong>Producto</strong> fijadas en pila.
                    Las celdas de intersección (esquinas superiores) conservan máxima prioridad visual (z-30) con fondo opaco.
                </p>
            </div>

            <Datatable<ProductItem>
                control="front"
                data={productsData}
                columns={stickyColumns}
                headers={wideHeaders}
                lengthMenu={[10, 20]}
                columnVisibility={true}
                stickyHeader={true}
                maxHeight="380px"
            />
        </div>
    ),
};

/**
 * 3. Selector de Columnas Visibles:
 * Demuestra el botón desplegable en la barra de herramientas que permite marcar y desmarcar qué columnas
 * mostrar en la tabla en tiempo real.
 */
export const ColumnVisibilityStory: Story = {
    name: '3. Selector de Columnas Visibles',
    render: () => (
        <div className="max-w-5xl mx-auto space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                    Selector de Columnas Activo en Modo Tabla
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Haz clic en el botón <strong>Columnas</strong> en la barra superior para ocultar o mostrar
                    columnas de la tabla. Al cambiar a modo tarjetas con el conmutador de vista, el botón de columnas se oculta automáticamente.
                </p>
            </div>

            <Datatable<ProductItem>
                control="front"
                data={productsData}
                columns={stickyColumns}
                headers={wideHeaders}
                cardsRender="auto"
                cardsPerRow={2}
                lengthMenu={[5]}
                columnVisibility={true}
            />
        </div>
    ),
};
