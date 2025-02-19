import type { Meta, StoryObj } from '@storybook/react';
import Datatable from './Datatable';

interface Data {
  name: string
}

const meta = {
  title: 'Example/Button',
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
      { fieldName: "name" }
    ],
    headers: ["name"],
    columnDef: [
      { target: 0, classname: "text-center" }
    ],
    getData: async (page, records, rows, orderValue) => {
      console.log(page, records, rows, orderValue)
      return {
        rows: [],
        page,
        records,
        count: 67
      }
    },
  },
};