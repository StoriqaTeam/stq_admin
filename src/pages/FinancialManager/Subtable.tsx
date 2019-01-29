import { Table } from 'antd';

import { IStore } from './Table';
import {
  FinancialManagerQuery_me_financialManager_orders_edges_node_russiaBillingInfo
    as FinancialManagerQueryRussianBillingInfo,
  FinancialManagerQuery_me_financialManager_orders_edges_node_internationalBillingInfo
    as FinancialManagerQueryInternationalBillingInfo,
} from './__generated__/FinancialManagerQuery';

type Maybe = FinancialManagerQueryInternationalBillingInfo | FinancialManagerQueryRussianBillingInfo;

class Subtable extends Table<FinancialManagerQueryInternationalBillingInfo | FinancialManagerQueryRussianBillingInfo> {
  //
}

export default Subtable;
