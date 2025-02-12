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

type LengthMenu = {
  label: string;
  value: number;
}

type OrderTable = {
  idx: number,
  order: 'ASC' | 'DESC' | 1 | 0;
}

export type DatatableType<T = any> = (| {
  data: [Data<T>, React.Dispatch<React.SetStateAction<Data<T>>>];
  getData?: never;
} | {
  getData: (
    page: number,
    records: number,
    rows: string | string[],
    orderValue: string | string[] | OrderPetition | OrderPetition[]
  ) => Promise<Data<T>>;
  data?: never
}) & {
  headers: string[];
  columns: Column<T>[];
  columnDef?: ColumnDef[];
  control?: 'back' | 'front';
  pagging?: boolean;
  info?: boolean;
  searching?: boolean;
  saveState?: boolean;
  lengthMenu?: (number | LengthMenu)[];
  order?: [([string, number] | OrderTable)];
  stateRefresh?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}