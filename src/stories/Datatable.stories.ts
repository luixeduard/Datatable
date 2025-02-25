import type { Meta, StoryObj } from '@storybook/react';
import Datatable from './Datatable';
import axios from "axios"
import { es } from "date-fns/locale"

interface Data {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  stock: number;
  image: string;
  rating: Rating;
  createdAt: Date
}

interface Rating {
  rate: number;
  count: number;
}

const meta = {
  title: 'Datatable',
  component: Datatable<Data>,
  parameters: {

  },
  tags: ['autodocs'],
  argTypes: {

  },
  args: {

  },
} satisfies Meta<typeof Datatable<Data>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    columns: [
      { fieldName: "title" },
      { fieldName: "category" },
      { fieldName: "price", format: "currency" },
      { fieldName: "description" },
      { fieldName: "rating.rate" },
      { fieldName: "createdAt", format: "datetime", formatOptions: { locale: es } },
    ],
    headers: ["title", "category", "price", "description", "Rate", "Creado"],
    footers: ["title", "category", "price", "description", "Rate", "Creado"],
    columnDef: [
      { target: 0, classname: "text-center", visible: false }
    ],
    getData: async (page, records, rows, orderValue, search) => {
      const { data: dataPetition } = await axios.get(`https://fakeapi.net/products?page=${page + 1}&limit=${records}&order=${orderValue[0]}&sort=${orderValue[1]}`)
      const { data, pagination } = dataPetition;
      console.log(data, pagination)
      console.log(rows)
      console.log(search)
      return {
        rows: data.map((row: Data) => ({ ...row, createdAt: new Date() })),
        page: pagination.page - 1,
        records: pagination.limit,
        count: pagination.total
      }
    },
  },
};