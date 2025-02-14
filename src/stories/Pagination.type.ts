import { LengthMenu } from "./Datatable.type"

export type PagginationType = {
  lengthMenu: (number | LengthMenu)[];
  page: number;
  records: number;
  count?: number;
}