import { Table } from 'antd';

import { Currency, PaymentState } from '../../../__generated__/globalTypes';
import {
  FinancialManagerQuery_me_financialManager_orders_edges_node_russiaBillingInfo
    as FinancialManagerQueryRussianBillingInfo,
  FinancialManagerQuery_me_financialManager_orders_edges_node_internationalBillingInfo
    as FinancialManagerQueryInternationalBillingInfo,
} from './__generated__/FinancialManagerQuery';

export interface IFinancialManager {
  id: string;
  sellerCurrency: Currency;
  totalAmount: number;
  cashbackAmount: number;
  storeId: number;
  storeName: string;
  state: PaymentState;
  feeAmount: number | null;
  feeCurrency: Currency | null;
  internationalBillingInfo: FinancialManagerQueryInternationalBillingInfo | null;
  russiaBillingInfo: FinancialManagerQueryRussianBillingInfo | null;
  orderSlug: number | null;
  orderCreatedAt: string | number | Date;
}

class FinancialManagerTable extends Table<IFinancialManager> {
  //
}

export default FinancialManagerTable;
