import { Table } from 'antd';

export interface IDeliveryCompany {
  id: number;
  logo: string;
  name: string;
  label: string;
}

class DeliveryCompaniesTable extends Table<IDeliveryCompany> {
  //
}

export default DeliveryCompaniesTable;
