type Column<T = any> = {
  fieldName: keyof T | null;
  orderValue?: keyof T | null;
  renderFn?: <K = {}>(
    data: T | keyof T,
  ) => K;
  format?: 'currency' | 'date' | ((data: T | keyof T) => string),
}

type OrderPetition = {
  column: string;
  order: 'ASC' | 'DESC' | 1 | 0;
}

type Data<T = any> = {
  rows: T[];
  page: number;
  records: number;
  count: number;
}

type ColumnDef = (
  | { target: number | "_all"; targets?: never }
  | { targets: number[] | "_all"; target?: never }
) & {
  visible?: boolean;
  searchable?: boolean;
  classname?: string;
  orderable?: boolean
}

export type LengthMenu = {
  label: string;
  value: number;
}

type OrderTable = {
  idx: number,
  order: 'ASC' | 'DESC' | 1 | 0;
}

type Headers = {
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
    rows: (keyof T | null)[],
    orderValue: ([number, 'ASC' | 'DESC' | 1 | 0] | OrderTable)[]
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
  order?: ([number, 'ASC' | 'DESC' | 1 | 0] | OrderTable)[];
  stateRefresh?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}