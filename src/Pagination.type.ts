import type React from "react";
import type { LengthMenu } from "./Datatable.type";

export type PagginationType = {
  lengthMenu: (number | LengthMenu)[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  records: number;
  count?: number;
  onChangeSelectPages: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  info?: boolean;
};