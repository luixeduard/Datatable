import type { Meta, StoryObj } from '@storybook/react';
import Datatable from '..';
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
  name: "Backend controlled",
  args: {
    control: "back",
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
      return {
        rows: data.map((row: Data) => ({ ...row, createdAt: new Date() })),
        page: pagination.page - 1,
        records: pagination.limit,
        count: pagination.total
      }
    },
  },
};

export const Secondary: Story = {
  name: "Front controlled",
  args: {
    control: "front",
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
    data: [[{"id":1,"title":"Smartphone X","price":799.99,"description":"Latest smartphone with advanced features","category":"electronics","brand":"TechCo","stock":50,"image":"https://fakeapi.net/images/smartphone.jpg","specs":{"color":"black","weight":"180g","storage":"128GB"},"rating":{"rate":4.5,"count":120}},{"id":2,"title":"Classic T-Shirt","price":29.99,"description":"Comfortable cotton t-shirt","category":"clothing","brand":"FashionBrand","stock":200,"image":"https://fakeapi.net/images/tshirt.jpg","specs":{"color":"white","material":"100% cotton","size":"M"},"rating":{"rate":4.2,"count":85}},{"id":3,"title":"Wireless Earbuds","price":149.99,"description":"High-quality wireless earbuds with noise cancellation","category":"electronics","brand":"AudioTech","stock":75,"image":"https://fakeapi.net/images/earbuds.jpg","specs":{"color":"white","battery":"24h","waterproof":true},"rating":{"rate":4.7,"count":200}},{"id":4,"title":"Laptop Pro 15","price":1499.99,"description":"Powerful laptop for professionals","category":"electronics","brand":"CompTech","stock":30,"image":"https://fakeapi.net/images/laptop.jpg","specs":{"screen":"15 inch","ram":"16GB","storage":"512GB SSD"},"rating":{"rate":4.6,"count":150}},{"id":5,"title":"Running Shoes","price":69.99,"description":"Lightweight and comfortable running shoes","category":"footwear","brand":"RunFast","stock":120,"image":"https://fakeapi.net/images/shoes.jpg","specs":{"color":"blue","size":"10","material":"mesh"},"rating":{"rate":4.3,"count":95}},{"id":6,"title":"Blender Pro","price":89.99,"description":"High-power blender for smoothies and more","category":"appliances","brand":"KitchenMaster","stock":60,"image":"https://fakeapi.net/images/blender.jpg","specs":{"color":"silver","power":"1200W","capacity":"1.5L"},"rating":{"rate":4.5,"count":70}},{"id":7,"title":"Yoga Mat","price":25.99,"description":"Non-slip yoga mat for daily practice","category":"sports","brand":"FitWell","stock":300,"image":"https://fakeapi.net/images/yogamat.jpg","specs":{"color":"purple","thickness":"6mm","material":"PVC"},"rating":{"rate":4.1,"count":40}},{"id":8,"title":"Smart Watch","price":199.99,"description":"Smartwatch with fitness tracking features","category":"electronics","brand":"TechTime","stock":80,"image":"https://fakeapi.net/images/smartwatch.jpg","specs":{"color":"black","battery":"48h","waterproof":true},"rating":{"rate":4.4,"count":180}},{"id":9,"title":"Gaming Chair","price":299.99,"description":"Ergonomic gaming chair with lumbar support","category":"furniture","brand":"GameComfort","stock":40,"image":"https://fakeapi.net/images/gamingchair.jpg","specs":{"color":"red","material":"leather","maxWeight":"150kg"},"rating":{"rate":4.5,"count":90}},{"id":10,"title":"Leather Wallet","price":49.99,"description":"Genuine leather wallet with multiple card slots","category":"accessories","brand":"LuxLeather","stock":120,"image":"https://fakeapi.net/images/wallet.jpg","specs":{"color":"brown","material":"leather","compartments":10},"rating":{"rate":4.3,"count":60}}]],
    multiple_order: false
  }
}