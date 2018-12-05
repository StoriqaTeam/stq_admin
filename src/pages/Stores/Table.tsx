import { Table } from 'antd';

import { Status } from '../../../__generated__/globalTypes';

export interface IStore {
  id: number;
  base64ID: string;
  name: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  ownerFirstname: string | null;
  ownerLastname: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  address: string | null;
  country: string | null;
  productsCount: number;
}

class StoresTable extends Table<IStore> {
  //
}

export default StoresTable;
