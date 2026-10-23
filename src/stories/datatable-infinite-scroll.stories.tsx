import type { Meta, StoryObj } from '@storybook/react';
import Datatable from '../index';
import { type ProductItem, productsData } from './cards-mock-data';
import { productColumns } from './cards-columns';

const meta = {
    title: 'Datatable/Scroll Infinito',
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Demostración de scroll infinito en Datatable con modos manual (botón centrado) y automático (append por IntersectionObserver). Cuando está activo, la paginación estándar se desactiva.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const productHeaders = ['Producto', 'Categoría', 'Calificación', 'Precio', 'Stock', 'Acciones'];

/**
 * Genera un conjunto extendido de datos de prueba replicando los productos base.
 */
function createExtendedProducts(copies = 3): ProductItem[] {
    const list: ProductItem[] = [];
    let counter = 1;
    for (let c = 0; c < copies; c++) {
        for (const item of productsData) {
            list.push({
                ...item,
                id: counter,
                title: `${item.title} #${counter}`,
            });
            counter++;
        }
    }
    return list;
}

const largeProducts = createExtendedProducts(4); // 40 productos

/**
 * Modo Manual:
 * Al llegar al final de la página o lote actual, muestra un botón centrado "Cargar más datos".
 * Al presionarlo, realiza un append del siguiente bloque de datos utilizando la paginación tradicional.
 * La paginación tradicional queda desactivada.
 */
export const ManualScrollTable: Story = {
    name: '1. Manual (Botón centrado - Tabla)',
    render: () => (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">
                    Modo Manual Activo (`infiniteScroll="manual"`)
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    La paginación está desactivada. Al final de la tabla se presenta un botón centrado para cargar
                    más datos vía append tradicional por lotes de 6 registros.
                </p>
            </div>

            <Datatable<ProductItem>
                control="front"
                data={largeProducts}
                columns={productColumns}
                headers={productHeaders}
                lengthMenu={[6]}
                infiniteScroll="manual"
                infiniteScrollButtonText="Cargar más productos"
                info={true}
                searching={true}
            />
        </div>
    ),
};

/**
 * Modo Automático:
 * Al hacer scroll hacia el final de los resultados, se activa un centinela con IntersectionObserver
 * que solicita y anexa (append) el siguiente lote de datos de manera fluida.
 */
export const AutomaticScrollTable: Story = {
    name: '2. Automático (Scroll fluido - Tabla)',
    render: () => (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                    Modo Automático Activo (`infiniteScroll="auto"`)
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Desplaza la tabla hacia abajo. Cada vez que llegues al final de los resultados visibles,
                    se cargará y anexará automáticamente el siguiente lote.
                </p>
            </div>

            <Datatable<ProductItem>
                control="front"
                data={largeProducts}
                columns={productColumns}
                headers={productHeaders}
                lengthMenu={[6]}
                infiniteScroll="auto"
                info={true}
                searching={true}
            />
        </div>
    ),
};

/**
 * Modo Manual en Tarjetas (Cards View):
 * Demuestra la compatibilidad del scroll infinito con la vista moderna de tarjetas.
 */
export const ManualScrollCards: Story = {
    name: '3. Manual en Tarjetas (Cards)',
    render: () => (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
                <h3 className="font-semibold text-purple-900 dark:text-purple-200 text-sm">
                    Scroll Infinito con Vista de Tarjetas
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Funciona de forma idéntica en modo cuadrícula de tarjetas, manteniendo el botón centrado al pie de la cuadrícula.
                </p>
            </div>

            <Datatable<ProductItem>
                control="front"
                data={largeProducts}
                columns={productColumns}
                headers={productHeaders}
                cardsRender={true}
                cardsPerRow={3}
                lengthMenu={[6]}
                infiniteScroll="manual"
                infiniteScrollButtonText="Ver más tarjetas"
                info={true}
                searching={true}
            />
        </div>
    ),
};

/**
 * Modo Backend (control="back"):
 * Simula una API REST paginada con latencia de red de 600ms. Cada página solicitada se anexa progresivamente.
 */
export const BackendInfiniteScroll: Story = {
    name: '4. Backend Simulado (control="back")',
    render: () => {
        const fetchSimulatedApi = async (page: number, records: number, _cols: string[], _order: unknown, search?: string) => {
            await new Promise((resolve) => setTimeout(resolve, 600));

            let filtered = [...largeProducts];
            if (search) {
                const query = search.toLowerCase();
                filtered = filtered.filter((item) => item.title.toLowerCase().includes(query));
            }

            const start = page * records;
            const rows = filtered.slice(start, start + records);

            return {
                rows,
                count: filtered.length,
                page,
                records,
            };
        };

        return (
            <div className="max-w-6xl mx-auto space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                        Carga Asíncrona con Servidor Backend
                    </h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Cada clic en el botón solicita la siguiente página al endpoint simula latencia de 600ms y concatena los resultados.
                    </p>
                </div>

                <Datatable<ProductItem>
                    control="back"
                    getData={fetchSimulatedApi}
                    columns={productColumns}
                    headers={productHeaders}
                    lengthMenu={[5]}
                    infiniteScroll="manual"
                    infiniteScrollButtonText="Cargar más"
                    info={true}
                    searching={true}
                />
            </div>
        );
    },
};
