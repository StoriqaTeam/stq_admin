import * as React from 'react';
import { Table } from 'antd';

export interface IAttribute {
  id: number;
  name: string;
}

class AttributesTable extends Table<IAttribute> {
  //
}

export default AttributesTable;
