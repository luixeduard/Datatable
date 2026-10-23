import type React from 'react';
import { format, type FormatOptions } from 'date-fns';
import type { Column, Headers, NestedKey } from '../Datatable.type';

export const currencyFormat = Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
export const decimalFormat = Intl.NumberFormat('es-MX', { style: 'decimal' });
export const percentFormat = Intl.NumberFormat('es-MX', { style: 'percent' });

/**
 * Normaliza y limpia una cadena de texto para búsquedas insensibles a acentos y mayúsculas.
 *
 * @param { unknown } input Valor de entrada a normalizar.
 * @returns { string } Cadena limpia y normalizada en minúsculas.
 * @author @luixeduard
 */
export function limpiarString(input?: unknown): string {
    if (input == null) return '';
    const str = String(input).trim().replace(/\s+/g, ' ');
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, (char, index, original) => {
            const prevChar = original[index - 1];
            if (char === '\u0303' && (prevChar === 'n' || prevChar === 'N')) {
                return char;
            }
            return '';
        })
        .toLowerCase();
}

/**
 * Obtiene el valor anidado de un objeto utilizando una clave tipada con notación de punto.
 *
 * @param { O } object Objeto raíz.
 * @param { K } key Ruta anidada de la propiedad.
 * @param { unknown } defaultValue Valor por defecto si la propiedad no existe.
 * @returns { unknown } Valor encontrado o el valor por defecto.
 * @author @luixeduard
 */
export function getValue<O, K extends NestedKey<O>>(object: O, key: K, defaultValue: unknown = '-'): unknown {
    if (!key) return defaultValue;
    return String(key).split('.').reduce<unknown>((obj, k) => {
        if (obj && typeof obj === 'object') {
            return (obj as Record<string, unknown>)[k];
        }
        return defaultValue;
    }, object);
}

/**
 * Obtiene un valor anidado a partir de una ruta en string separada por puntos.
 *
 * @param { unknown } obj Objeto raíz.
 * @param { string } path Ruta en formato 'a.b.c'.
 * @returns { unknown } Valor resuelto o undefined.
 * @author @luixeduard
 */
export function getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
        if (acc && typeof acc === 'object') {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

/**
 * Formatea un valor según la regla de formateo definida en la columna.
 *
 * @param { Column<T> } column Definición de la columna.
 * @param { unknown } value Valor crudo a formatear.
 * @returns { string } Valor formateado en texto legible.
 * @author @luixeduard
 */
export function formatValue<T>(column: Column<T>, value: unknown): string {
    if (value == null) return '-';
    if (column.format) {
        try {
            if (typeof column.format === 'function') {
                return column.format(value as never);
            }
            if (column.format === 'currency') {
                const num = Number(value);
                return !isNaN(num) ? currencyFormat.format(num) : '-';
            }
            if (column.format === 'decimal') {
                const num = Number(value);
                return !isNaN(num) ? decimalFormat.format(num) : '-';
            }
            if (column.format === 'percent') {
                const num = Number(value);
                return !isNaN(num) ? percentFormat.format(num) : '-';
            }
            if (column.format === 'unit') {
                const num = Number(value);
                if (!isNaN(num)) {
                    const unitFormat = Intl.NumberFormat('es-MX', { style: 'unit', ...column.formatOptions });
                    return unitFormat.format(num);
                }
                return '-';
            }
            if (column.format === 'date' || column.format === 'datetime') {
                const dateVal = value instanceof Date
                    ? value
                    : (typeof value === 'string' || typeof value === 'number' ? new Date(value) : null);
                if (dateVal && !isNaN(dateVal.getTime())) {
                    if (column.format === 'date') {
                        return format(dateVal, 'P', column.formatOptions as FormatOptions);
                    }
                    return format(dateVal, 'Pp', column.formatOptions as FormatOptions);
                }
                return 'Fecha inválida';
            }
        } catch {
            return '-';
        }
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
}

/**
 * Renderiza el contenido de una celda evaluando renderFn, rutas anidadas y formateadores.
 *
 * @param { Column<T> } column Definición de la columna.
 * @param { T } object Registro de datos de la fila.
 * @returns { React.ReactNode } Nodo listo para renderizar en tabla o tarjeta.
 * @author @luixeduard
 */
export function renderCell<T>(column: Column<T>, object: T): React.ReactNode {
    if (column.renderFn) {
        return column.renderFn(object, object);
    }
    const fieldName = column.fieldName;
    if (!fieldName) {
        return typeof object === 'object' ? JSON.stringify(object) : String(object);
    }
    const strField = String(fieldName);
    if (strField.includes('.')) {
        const val = getValue(object, fieldName as NestedKey<T>);
        return column.format ? formatValue(column, val) : (val as React.ReactNode);
    }
    const rawVal = (object as Record<string, unknown>)[strField];
    if (column.format) {
        return formatValue(column, rawVal);
    }
    if (rawVal != null && typeof rawVal === 'object') {
        return JSON.stringify(rawVal);
    }
    return rawVal as React.ReactNode;
}

/**
 * Extrae la etiqueta de texto de una cabecera según su índice, soportando cabeceras simples y avanzadas.
 *
 * @param { string[] | Headers[][] } headers Arreglo de cabeceras simples o matriz multinivel.
 * @param { number } index Índice de la columna.
 * @returns { string } Etiqueta legible de la cabecera.
 * @author @luixeduard
 */
export function getHeaderLabel(headers: string[] | Headers[][], index: number): string {
    if (!headers || index < 0) return '';
    const advanced = headers.every((header) => typeof header !== 'string');
    if (!advanced) {
        return (headers as string[])[index] ?? '';
    }
    const advHeaders = headers as Headers[][];
    for (const row of advHeaders) {
        if (row && row[index] && typeof row[index].label === 'string') {
            return row[index].label;
        }
    }
    return '';
}

