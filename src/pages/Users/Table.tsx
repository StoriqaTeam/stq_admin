import { Table, Spin } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line

import { IUser } from './Users';

class UserTable extends Table<IUser> {}

export default UserTable;
