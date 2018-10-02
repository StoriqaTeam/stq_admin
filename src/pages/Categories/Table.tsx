import * as React from 'react';

import { Table } from 'antd';

export interface ICategory {
  id: number;
  name: string;
  level: number;
  children?: ICategory[] | null;
}

class CategoriesTable extends Table<ICategory> {
  //
}

export default CategoriesTable;
