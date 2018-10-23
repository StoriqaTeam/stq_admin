import { Table } from 'antd';

export type IPackage = {
  id: string;
  rawId: number;
  name: string;
  minSize: number;
  maxSize: number;
  minWeight: number;
  maxWeight: number;
};

class PackagesTable extends Table<IPackage> {
  //
}

export default PackagesTable;
