import { Table } from 'antd';

import { Status } from '../../../__generated__/globalTypes';

export interface IVariant {
  id: string;
  name: string;
}

export interface IGood {
  id: string;
  rawId: number;
  name: string;
  status: Status;
  category: any; // Category;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  rating: number;
  variants: IVariant[];
}

class GoodsTable extends Table<IGood> {
  //
}

export default GoodsTable;
