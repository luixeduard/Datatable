import type { Meta, StoryObj } from '@storybook/react';
import Datatable, { datatableReducer } from '..';
import axios from "axios";
import { es } from "date-fns/locale";
import { configureStore } from '@reduxjs/toolkit';

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
  createdAt: Date;
}

interface Rating {
  rate: number;
  count: number;
}

const reduxDemoStore = configureStore({
  reducer: {
    datatable: datatableReducer,
  },
});

const sampleProducts: Data[] = [
  { id: 1, title: "Smartphone X", price: 799.99, description: "Latest smartphone with advanced features", category: "electronics", brand: "TechCo", stock: 50, image: "https://fakeapi.net/images/smartphone.jpg", rating: { rate: 4.5, count: 120 }, createdAt: new Date() },
  { id: 2, title: "Classic T-Shirt", price: 29.99, description: "Comfortable cotton t-shirt", category: "clothing", brand: "FashionBrand", stock: 200, image: "https://fakeapi.net/images/tshirt.jpg", rating: { rate: 4.2, count: 85 }, createdAt: new Date() },
  { id: 3, title: "Wireless Earbuds", price: 149.99, description: "High-quality wireless earbuds with noise cancellation", category: "electronics", brand: "AudioTech", stock: 75, image: "https://fakeapi.net/images/earbuds.jpg", rating: { rate: 4.7, count: 200 }, createdAt: new Date() },
  { id: 4, title: "Laptop Pro 15", price: 1499.99, description: "Powerful laptop for professionals", category: "electronics", brand: "CompTech", stock: 30, image: "https://fakeapi.net/images/laptop.jpg", rating: { rate: 4.6, count: 150 }, createdAt: new Date() },
  { id: 5, title: "Running Shoes", price: 69.99, description: "Lightweight and comfortable running shoes", category: "footwear", brand: "RunFast", stock: 120, image: "https://fakeapi.net/images/shoes.jpg", rating: { rate: 4.3, count: 95 }, createdAt: new Date() },
  { id: 6, title: "Blender Pro", price: 89.99, description: "High-power blender for smoothies and more", category: "appliances", brand: "KitchenMaster", stock: 60, image: "https://fakeapi.net/images/blender.jpg", rating: { rate: 4.5, count: 70 }, createdAt: new Date() },
  { id: 7, title: "Yoga Mat", price: 25.99, description: "Non-slip yoga mat for daily practice", category: "sports", brand: "FitWell", stock: 300, image: "https://fakeapi.net/images/yogamat.jpg", rating: { rate: 4.1, count: 40 }, createdAt: new Date() },
  { id: 8, title: "Smart Watch", price: 199.99, description: "Smartwatch with fitness tracking features", category: "electronics", brand: "TechTime", stock: 80, image: "https://fakeapi.net/images/smartwatch.jpg", rating: { rate: 4.4, count: 180 }, createdAt: new Date() },
  { id: 9, title: "Gaming Chair", price: 299.99, description: "Ergonomic gaming chair with lumbar support", category: "furniture", brand: "GameComfort", stock: 40, image: "https://fakeapi.net/images/gamingchair.jpg", rating: { rate: 4.5, count: 90 }, createdAt: new Date() },
  { id: 10, title: "Leather Wallet", price: 49.99, description: "Genuine leather wallet with multiple card slots", category: "accessories", brand: "LuxLeather", stock: 120, image: "https://fakeapi.net/images/wallet.jpg", rating: { rate: 4.3, count: 60 }, createdAt: new Date() },
];

const meta = {
  title: 'Datatable',
  component: Datatable<Data>,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Datatable<Data>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  name: "Modo Backend (Paginado en Servidor)",
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
    headers: ["Título", "Categoría", "Precio", "Descripción", "Calificación", "Creado"],
    footers: ["Título", "Categoría", "Precio", "Descripción", "Calificación", "Creado"],
    columnDef: [
      { target: 0, classname: "font-medium" }
    ],
    getData: async (page, records, _rows, orderValue, search) => {
      const orderParam = orderValue && orderValue[0] ? orderValue[0][0] : 0;
      const sortParam = orderValue && orderValue[0] ? orderValue[0][1] : 'ASC';
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const { data: dataPetition } = await axios.get(
        `https://fakeapi.net/products?page=${page + 1}&limit=${records}&order=${orderParam}&sort=${sortParam}${searchParam}`
      );
      const { data, pagination } = dataPetition;
      return {
        rows: (data as Data[]).map((row) => ({ ...row, createdAt: new Date() })),
        page: pagination.page - 1,
        records: pagination.limit,
        count: pagination.total,
      };
    },
  },
};

export const Secondary: Story = {
  name: "Modo Frontend (En Memoria)",
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
    headers: ["Título", "Categoría", "Precio", "Descripción", "Calificación", "Creado"],
    footers: ["Título", "Categoría", "Precio", "Descripción", "Calificación", "Creado"],
    data: [sampleProducts],
    multiple_order: true,
  },
};

export const WithReduxPersistence: Story = {
  name: "Frontend with Redux Toolkit Persistence",
  args: {
    control: "front",
    tableId: "story-products-table",
    store: reduxDemoStore,
    columns: [
      { fieldName: "title" },
      { fieldName: "category" },
      { fieldName: "price", format: "currency" },
      { fieldName: "description" },
      { fieldName: "rating.rate" },
      { fieldName: "createdAt", format: "datetime", formatOptions: { locale: es } },
    ],
    headers: ["Título", "Categoría", "Precio", "Descripción", "Rate", "Creado"],
    footers: ["Título", "Categoría", "Precio", "Descripción", "Rate", "Creado"],
    columnDef: [
      { target: 0, classname: "text-center", visible: true }
    ],
    data: [sampleProducts],
    multiple_order: true,
    lengthMenu: [3, 5, 10],
    cardsRender: "auto",
    cardsPerRow: 2,
  },
};

export const AutoCardsToggle: Story = {
  name: "Auto Cards Toggle (Table / Cards)",
  args: {
    control: "front",
    cardsRender: "auto",
    cardsPerRow: 3,
    columns: [
      { fieldName: "title" },
      { fieldName: "category" },
      { fieldName: "price", format: "currency" },
      { fieldName: "rating.rate" },
    ],
    headers: ["Título", "Categoría", "Precio", "Calificación"],
    data: [sampleProducts],
    multiple_order: true,
    lengthMenu: [3, 6, 12],
  },
};