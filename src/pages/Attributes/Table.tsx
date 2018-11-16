import * as React from 'react';

import { Table } from 'antd';

export interface IAttribute {
  id: string;
  name: string;
}

class AttributesTable extends Table<IAttribute> {
  //
}

export default AttributesTable;
