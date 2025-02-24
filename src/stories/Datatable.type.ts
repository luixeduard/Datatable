export type Column<T = any> = {
  fieldName: NestedKey<T> | keyof T | null;
  orderValue?: NestedKey<T> | keyof T | null;
  renderFn?: <K = {}>(
    data: T | keyof T,
  ) => K;
  format?: 'currency' | 'date' | ((data: T | keyof T) => string),
}

export type NestedKey<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? `${K}` | `${K}.${NestedKey<T[K]>}`
        : never;
    }[keyof T]
  : never;

type Data<T = any> = {
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

export type LengthMenu = {
  label: string;
  value: number;
}

export type OrderTable = {
  idx: number,
  order: 'ASC' | 'DESC' | 1 | -1;
}

export type Headers = {
  label: string;
  rowspan: number;
  colspan: number;
}

export type DatatableType<T = any> = (| {
  data: [T[], React.Dispatch<React.SetStateAction<T[]>>];
  getData?: never;
} | {
  getData: (
    page: number,
    records: number,
    rows: string[],
    orderValue: [number, 'ASC' | 'DESC' | 1 | -1][],
    search?: string
  ) => Promise<Data<T>>;
  data?: never
}) & {
  headers: string[] | Headers[][];
  columns: Column<T>[];
  columnDef?: ColumnDef[];
  control?: 'back' | 'front';
  pagging?: boolean;
  info?: boolean;
  searching?: boolean;
  saveState?: boolean;
  lengthMenu?: (number | LengthMenu)[];
  order?: ([number, 'ASC' | 'DESC' | 1 | -1] | OrderTable)[];
  multiple_order?: boolean;
  stateRefresh?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}