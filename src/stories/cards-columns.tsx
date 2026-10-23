import type { Column } from '../Datatable.type';
import {
    type ProductItem,
    type TeamMember,
    fallbackSvg,
} from './cards-mock-data';

/**
 * Columnas modernas para productos con diseño contemporáneo, sin sobrecarga de emojis.
 */
export const productColumns: Column<ProductItem>[] = [
    {
        fieldName: 'title',
        hideCardLabel: true,
        renderFn: (data: ProductItem) => (
            <div className="flex items-center gap-3.5 w-full">
                <div className="relative shrink-0">
                    <img
                        src={data.image}
                        alt={data.title}
                        onError={(event) => {
                            (event.currentTarget as HTMLImageElement).src = fallbackSvg;
                        }}
                        className="w-13 h-13 rounded-xl object-cover border border-slate-200/90 dark:border-slate-700/80 shadow-xs"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                            {data.brand}
                        </span>
                        {data.freeShipping && (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                                Envío gratis
                            </span>
                        )}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate mt-0.5">
                        {data.title}
                    </h3>
                </div>
            </div>
        ),
    },
    {
        fieldName: 'category',
        renderFn: (data: ProductItem) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                {data.category}
            </span>
        ),
    },
    {
        fieldName: 'rating.rate',
        renderFn: (data: ProductItem) => (
            <div className="inline-flex items-center gap-1.5">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {data.rating.rate.toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-400">
                    ({data.rating.count})
                </span>
            </div>
        ),
    },
    {
        fieldName: 'price',
        renderFn: (data: ProductItem) => (
            <div className="inline-flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ${data.price.toFixed(2)}
                </span>
                {data.discount && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70">
                        -{data.discount}%
                    </span>
                )}
            </div>
        ),
    },
    {
        fieldName: 'stock',
        renderFn: (data: ProductItem) => {
            const isLow = data.stock < 15;
            const isOut = data.stock === 0;
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span
                        className={`w-2 h-2 rounded-full ${
                            isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                    />
                    <span>
                        {isOut ? 'Agotado' : isLow ? `${data.stock} restantes` : `En stock (${data.stock})`}
                    </span>
                </span>
            );
        },
    },
    {
        fieldName: null,
        hideCardLabel: true,
        renderFn: (data: ProductItem) => (
            <div className="flex items-center gap-2 w-full">
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        alert(`Añadido al carrito: ${data.title}`);
                    }}
                    className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer text-center"
                >
                    Añadir al carrito
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        alert(`Guardado en favoritos: ${data.title}`);
                    }}
                    className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Añadir a favoritos"
                >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </button>
            </div>
        ),
    },
];

/**
 * Columnas para el directorio de equipo con avatares modernos y estilo minimalista.
 */
export const teamColumns: Column<TeamMember>[] = [
    {
        fieldName: 'name',
        hideCardLabel: true,
        renderFn: (member: TeamMember) => {
            const statusMap = {
                online: { label: 'En línea', badge: 'bg-emerald-500' },
                busy: { label: 'En reunión', badge: 'bg-amber-500' },
                vacation: { label: 'Vacaciones', badge: 'bg-slate-400' },
            };
            const currentStatus = statusMap[member.status];

            return (
                <div className="flex items-center gap-3 w-full">
                    <div className="relative shrink-0">
                        <img
                            src={member.avatar}
                            alt={member.name}
                            onError={(event) => {
                                (event.currentTarget as HTMLImageElement).src = fallbackSvg;
                            }}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${currentStatus.badge}`}
                            title={currentStatus.label}
                        />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                            {member.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            {member.role}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        fieldName: 'department',
        renderFn: (member: TeamMember) => (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {member.department}
            </span>
        ),
    },
    {
        fieldName: 'email',
        renderFn: (member: TeamMember) => (
            <a
                href={`mailto:${member.email}`}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                {member.email}
            </a>
        ),
    },
    {
        fieldName: null,
        hideCardLabel: true,
        renderFn: (member: TeamMember) => (
            <div className="flex flex-wrap gap-1.5 pt-1 w-full">
                {member.tags.map((tag) => (
                    <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        ),
    },
];
