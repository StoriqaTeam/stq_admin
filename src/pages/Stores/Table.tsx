import { Table } from 'antd';

import { Status } from '../../../__generated__/globalTypes';

export interface IStore {
  id: number;
  name: string;
  status: Status;
  createdAt: Date;
  ownerFirstname: string | null;
  ownerLastname: string | null;
  ownerEmail: string | null;
  country: string | null;
  productsCount: number;
}

class StoresTable extends Table<IStore> {
  //
}

export default StoresTable;
