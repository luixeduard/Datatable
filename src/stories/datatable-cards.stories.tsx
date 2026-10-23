import type { Meta, StoryObj } from '@storybook/react';
import Datatable from '..';
import {
    type ProductItem,
    type TeamMember,
    fallbackSvg,
    productsData,
    teamData,
} from './cards-mock-data';
import { productColumns, teamColumns } from './cards-columns';

/**
 * Metadatos para Storybook en la sección de Tarjetas Personalizadas.
 */
const meta = {
    title: 'Datatable/Tarjetas Personalizadas (Cards)',
    parameters: {
        docs: {
            description: {
                component:
                    'Demostración de tarjetas modernas con tipografía refinada, alineación clave-valor equilibrada y estilo contemporáneo.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta;

export default meta;

/**
 * Story 1: Tarjetas Modernas mediante configuración de Columnas (Modo auto con selector tabla/tarjetas).
 */
export const RichCardsColumns: StoryObj = {
    name: 'Cards Modernas (Configuración de Columnas)',
    render: () => (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl">
            <Datatable<ProductItem>
                control="front"
                data={[productsData]}
                cardsRender="auto"
                cardsPerRow={3}
                cardsClassName="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg transition-all duration-200 p-5"
                columns={productColumns}
                headers={['Producto', 'Categoría', 'Calificación', 'Precio', 'Disponibilidad', 'Acciones']}
                multiple_order={true}
                lengthMenu={[3, 6, 12]}
            />
        </div>
    ),
};

/**
 * Story 2: Plantilla Libre Contemporánea mediante la propiedad `renderCard`.
 */
export const CustomCardLayout: StoryObj = {
    name: 'Plantilla Libre con renderCard',
    render: () => (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl">
            <Datatable<ProductItem>
                control="front"
                data={[productsData]}
                cardsRender="auto"
                cardsPerRow={3}
                cardsClassName="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 p-5 flex flex-col justify-between"
                columns={productColumns}
                headers={['Producto', 'Categoría', 'Calificación', 'Precio', 'Disponibilidad', 'Acciones']}
                multiple_order={true}
                lengthMenu={[3, 6, 12]}
                renderCard={(item) => (
                    <div className="flex flex-col h-full justify-between gap-4">
                        <div>
                            <div className="flex items-start gap-3.5">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    onError={(event) => {
                                        (event.currentTarget as HTMLImageElement).src = fallbackSvg;
                                    }}
                                    className="w-14 h-14 rounded-xl object-cover border border-slate-200/90 dark:border-slate-700/80 shadow-xs shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            {item.brand}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <span className="text-amber-400">★</span>
                                            <span>{item.rating.rate}</span>
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug truncate mt-0.5">
                                        {item.title}
                                    </h4>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        {item.category} • {item.rating.count} opiniones
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>

                            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                    Entrega 24-48h
                                </span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                    Garantía oficial
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                {item.originalPrice && (
                                    <span className="text-xs text-slate-400 line-through block">
                                        ${item.originalPrice.toFixed(2)}
                                    </span>
                                )}
                                <span className="text-base font-bold text-slate-900 dark:text-white">
                                    ${item.price.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        alert(`Añadido al carrito: ${item.title}`);
                                    }}
                                    className="py-2 px-3.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    ),
};

/**
 * Story 3: Directorio de Equipo Contemporáneo.
 */
export const TeamDirectory: StoryObj = {
    name: 'Directorio de Equipo',
    render: () => (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl">
            <Datatable<TeamMember>
                control="front"
                data={[teamData]}
                cardsRender={true}
                cardsPerRow={2}
                cardsClassName="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg transition-all duration-200 p-5"
                columns={teamColumns}
                headers={['Colaborador', 'Departamento', 'Contacto', 'Especialidades']}
                multiple_order={true}
                lengthMenu={[2, 4, 8]}
            />
        </div>
    ),
};
