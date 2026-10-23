import type React from "react";
import type { FormatOptions } from "date-fns";

export type Column<T = unknown> = {
  fieldName?: NestedKey<T> | keyof T | null;
  orderValue?: NestedKey<T> | keyof T | null;
  renderFn?: (
    data: T,
    row?: T,
  ) => React.ReactNode;
  format?: FormatType<T>;
  formatOptions?: Intl.NumberFormatOptions | FormatOptions;
  hideCardLabel?: boolean;
  sticky?: boolean;
};

export type FormatType<T = unknown> =
  | 'currency'
  | 'decimal'
  | 'percent'
  | 'unit'
  | 'date'
  | 'datetime'
  | ((data: T extends object ? T[keyof T] : unknown) => string);

type PrevDepth = [never, 0, 1, 2, 3];

type AnyFunction = (...args: unknown[]) => unknown;

export type NestedKey<T, Depth extends number = 3> = [Depth] extends [0]
  ? never
  : T extends Date | AnyFunction | unknown[] | RegExp | Map<unknown, unknown> | Set<unknown>
  ? never
  : T extends object
  ? {
      [K in keyof T & string]: `${K}` | `${K}.${NestedKey<T[K], PrevDepth[Depth]>}`;
    }[keyof T & string]
  : never;

export type Data<T = unknown> = {
  rows: T[];
  page: number;
  records: number;
  count: number;
};

type ClassNameType = React.HTMLAttributes<HTMLElement>["className"];

export type ColumnDef = (
  | { target: number | "_all"; targets?: never }
  | { targets: number[]; target?: never }
) & {
  visible?: boolean;
  searchable?: boolean;
  classname?: ClassNameType;
  orderable?: boolean;
  sticky?: boolean;
};

export type onClickEvent<T = unknown> = (
  evt: React.MouseEvent<HTMLTableRowElement | HTMLDivElement>,
  data: T
) => void;

export type RowDef<T = unknown> = {
  onClick?: onClickEvent<T>;
  onDoubleClick?: onClickEvent<T>;
};

export type LengthMenu = {
  label: string;
  value: number;
};

export type OrderTable = {
  idx: number;
  order: 'ASC' | 'DESC' | 1 | -1;
};

export type GetData<T = unknown> = (
  page: number,
  records: number,
  rows: string[],
  orderValue: [number, 'ASC' | 'DESC' | 1 | -1][],
  search?: string
) => Promise<Data<T>>;

export type GetVoidData<T = unknown> = () => Promise<Data<T>>;

export type Headers = {
  label: string;
  rowspan: number;
  colspan: number;
};

type CommonDatatableProps<T> = {
  headers: string[] | Headers[][];
  footers?: string[] | Headers[][];
  columns: Column<T>[];
  columnDef?: ColumnDef[];
  rowDef?: RowDef<T>;
  pagging?: boolean;
  info?: boolean;
  searching?: boolean;
  saveState?: boolean;
  lengthMenu?: (number | LengthMenu)[];
  order?: ([number, 'ASC' | 'DESC' | 1 | -1] | OrderTable)[];
  multiple_order?: boolean;
  stateRefresh?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  cardsRender?: boolean | 'auto';
  cardsClassName?: string;
  cardsPerRow?: number;
  renderCard?: (data: T, rowIndex: number) => React.ReactNode;
  tableId?: string;
  store?: unknown;
  restoreScroll?: boolean;
  infiniteScroll?: boolean | 'auto' | 'manual';
  enableInfiniteScroll?: boolean;
  infiniteScrollMode?: 'auto' | 'manual';
  infiniteScrollButtonText?: string;
  columnVisibility?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string | number;
};

type BackControlDatatable<T> = CommonDatatableProps<T> & {
  control: 'back';
  getData: GetData<T>;
  data?: never;
};

type FrontControlDatatable<T> = CommonDatatableProps<T> & {
  control: 'front';
} & (
  | {
      data: [T[], React.Dispatch<React.SetStateAction<T[]>>] | [T[]] | T[];
      getData?: never;
    }
  | {
      getData: GetVoidData<T>;
      data?: never;
    }
);

export type DatatableType<T = unknown> = BackControlDatatable<T> | FrontControlDatatable<T>;

export interface DatatableCoreExtraProps {
  initialSearch?: string;
  initialPage?: number;
  initialRecords?: number;
  initialOrder?: [number, -1 | 'ASC' | 'DESC' | 1][];
  initialViewMode?: 'table' | 'cards';
  initialVisibleColumns?: Record<number, boolean>;
  onTableStateChange?: (state: {
    search: string;
    page: number;
    records: number;
    order: [number, -1 | 'ASC' | 'DESC' | 1][];
    viewMode?: 'table' | 'cards';
    visibleColumns?: Record<number, boolean>;
  }) => void;
}