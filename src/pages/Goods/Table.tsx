import { Table } from 'antd';

import { Status } from '../../../__generated__/globalTypes';

export interface IVariant {
  id: number;
  price: number;
  characteristics: string[]; // [attrName: attrValue]
}

export interface IGood {
  id: string;
  rawId: number;
  name: string;
  status: Status;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  rating: number;
  variants: IVariant[];
  storeRawId: number | null;
}

class GoodsTable extends Table<IGood> {
  //
}

export default GoodsTable;
