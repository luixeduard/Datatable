import { FormatOptions } from "date-fns";

export type Column<T = any> = {
  fieldName: NestedKey<T> | keyof T | null;
  orderValue?: NestedKey<T> | keyof T | null;
  renderFn?: (
    data: any,
  ) => any;
  format?: FormatType<T>,
  formatOptions?: Intl.NumberFormatOptions | FormatOptions,
}

export type FormatType<T> = 'currency' | 'decimal' | 'percent' | 'unit' | 'date' | 'datetime' | ((data: T[keyof T]) => string)

export type NestedKey<T> = T extends object
  ? {
    [K in keyof T]: K extends string
    ? `${K}` | `${K}.${NestedKey<T[K]>}`
    : never;
  }[keyof T]
  : never;

export type Data<T = any> = {
  rows: T[];
  page: number;
  records: number;
  count: number;
}

type ClassNameType = React.HTMLAttributes<HTMLElement>["className"];

export type ColumnDef = (
  | { target: number | "_all"; targets?: never }
  | { targets: number[]; target?: never }
) & {
  visible?: boolean;
  searchable?: boolean;
  classname?: ClassNameType;
  orderable?: boolean
}

export type onClickEvent<T> = (evt: React.MouseEvent<HTMLTableRowElement, MouseEvent>, data: T) => void

export type RowDef<T = any> = {
  onClick: onClickEvent<T>,
  onDoubleClick: onClickEvent<T>
}

export type LengthMenu = {
  label: string;
  value: number;
}

export type OrderTable = {
  idx: number,
  order: 'ASC' | 'DESC' | 1 | -1;
}

export type GetData<T> = (
  page: number,
  records: number,
  rows: string[],
  orderValue: [number, 'ASC' | 'DESC' | 1 | -1][],
  search?: string
) => Promise<Data<T>>

export type GetVoidData<T> = () => Promise<Data<T>>

export type Headers = {
  label: string;
  rowspan: number;
  colspan: number;
}

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
  stateRefresh?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
};

type BackControlDatatable<T> = CommonDatatableProps<T> & {
  control: 'back';
  getData: GetData<T>;
  data?: never; // Asegura que `data` no esté presente
};

type FrontControlDatatable<T> = CommonDatatableProps<T> & {
  control: 'front';
} & ({
  data: [T[], React.Dispatch<React.SetStateAction<T[]>>] | [T[]];
  getData?: never; // Asegura que `getData` no esté presente
} | {
  getData: GetVoidData<T>;
  data?: never
});

export type DatatableType<T = any> = BackControlDatatable<T> | FrontControlDatatable<T>;