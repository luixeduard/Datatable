import { LengthMenu } from "./Datatable.type"

export type PagginationType = {
  lengthMenu: (number | LengthMenu)[];
  pageState: [number, React.Dispatch<React.SetStateAction<number>>];
  records: number;
  count?: number;
  onChangeSelectPages: (event: React.ChangeEvent<HTMLSelectElement>) => void
}