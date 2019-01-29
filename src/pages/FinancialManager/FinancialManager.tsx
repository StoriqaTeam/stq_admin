import * as React from 'react';
import { Button, Menu, Dropdown, Icon, Spin, Pagination, message, Checkbox, Modal } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { ApolloConsumer } from 'react-apollo';
import ApolloClient, { ApolloError } from 'apollo-client';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  map,
  pathOr,
  findIndex,
  lensPath,
  over,
  whereEq,
  assoc,
  reject,
  isNil,
  isEmpty,
  anyPass,
  pick,
} from 'ramda';
import { parse, format } from 'date-fns';

import FinancialManagerTable, { IStore } from './Table';
import Subtable from './Subtable';
import {
  FinancialManagerQuery,
  FinancialManagerQueryVariables,
  FinancialManagerQuery_me_financialManager_orders_edges_node as FinancialManagerQueryEdgeNode,
  FinancialManagerQuery_me_financialManager_orders_edges as FinancialManagerQueryEdge,
} from './__generated__/FinancialManagerQuery';
// import {
//   SetStoreModerationStatus,
//   SetStoreModerationStatusVariables,
// } from './__generated__/SetStoreModerationStatus';
import {
  Status,
  PaymentState,
  SearchModeratorStoreInput,
  OrderBillingSearchInput,
} from '../../../__generated__/globalTypes';
import { FINANCIAL_MANAGER_QUERY, SET_PAID_TO_SELLER_ORDER_STATE_MUTATION } from './queries';
import FilterForm, { PaymentStateFilter } from './FilterForm';
import * as styles from './FinancialManager.scss';
import {
  SetPaidToSellerOrderState,
  SetPaidToSellerOrderStateVariables,
} from './__generated__/SetPaidToSellerOrderState';
import { SET_MODERATION_STATUS_FOR_STORE_MUTATION } from '../Stores/queries';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: IStore[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  searchTerms: OrderBillingSearchInput;
  pageInfo: {
    currentPage: number;
    pageItemsCount: number;
    totalPages: number;
  };
}

class FinancialManager extends React.Component<PropsType, StateType> {
  state: StateType = {
    dataSource: [],
    isLoading: false,
    error: null,
    hasNextPage: false,
    searchTerms: {},
    pageInfo: {
      currentPage: 1,
      pageItemsCount: 10,
      totalPages: 1,
    },
  };

  columns: Array<ColumnProps<IStore>> = [];

  constructor(props: PropsType) {
    super(props);

    this.columns = [
      {
        key: 'orderSlug',
        title: 'Order',
        dataIndex: 'orderSlug',
      },
      {
        key: 'storeId',
        title: 'Store ID',
        dataIndex: 'storeId',
      },
      {
        key: 'state',
        title: 'State',
        dataIndex: 'state',
      },
      {
        key: 'totalAmount',
        title: 'Total amount',
        dataIndex: 'totalAmount',
      },
      {
        key: 'cashbackAmount',
        title: 'Cashback amount',
        dataIndex: 'cashbackAmount',
      },
      {
        key: 'sellerCurrency',
        title: 'Seller currency',
        dataIndex: 'sellerCurrency',
      },
      {
        key: 'feeAmount',
        title: 'Fee amount',
        dataIndex: 'feeAmount',
      },
      {
        key: 'feeCurrency',
        title: 'Fee currency',
        dataIndex: 'feeCurrency',
      },
      {
        key: 'paidToSeller',
        title: 'Paid to seller',
        dataIndex: 'state',
        render: (_, record) => {
          const { setPaidToSellerOrderState } = this;
          const { id, state } = record;
          return (
            <Checkbox
              checked={state === 'PAID_TO_SELLER'}
              disabled={state === 'PAID_TO_SELLER' || state !== 'PAYMENT_TO_SELLER_NEEDED'}
              onChange={() => {
                Modal.confirm({
                  title: 'Are you sure paid to seller?',
                  content: (
                    <div>Some descriptions</div>
                  ),
                  okText: 'Yes',
                  okType: 'danger',
                  cancelText: 'No',
                  onOk() {
                    setPaidToSellerOrderState(id);
                  },
                  onCancel() {
                    //
                  },
                });
              }}
            />
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.loadMore();
  }

  loadMore = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<FinancialManagerQuery, FinancialManagerQueryVariables>({
        query: FINANCIAL_MANAGER_QUERY,
        fetchPolicy: 'network-only',
        variables: {
          currentPage: this.state.pageInfo.currentPage,
          itemsCount: this.state.pageInfo.pageItemsCount,
          searchTerm: this.state.searchTerms,
        },
      })
      .then(({ data }) => {
        const dsChunk = this.prepareDataSource(data);
        this.setState(prevState => ({
          dataSource: dsChunk,
          pageInfo: pick(
            ['currentPage', 'pageItemsCount', 'totalPages'],
            (data.me &&
              data.me.financialManager.orders &&
              data.me.financialManager.orders.pageInfo) ||
              prevState.pageInfo,
          ),
        }));
      })
      .catch((err: Error) => {
        this.setState({ error: err });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  prepareDataSource = (data: FinancialManagerQuery): IStore[] => {
    const edges =
      (data.me &&
        data.me.financialManager.orders &&
        data.me.financialManager.orders.edges) ||
      [];
    return map((edge: FinancialManagerQueryEdge) => {
      const node: FinancialManagerQueryEdgeNode = edge.node;
      return {
        id: node.id,
        sellerCurrency: node.sellerCurrency,
        totalAmount: node.totalAmount,
        cashbackAmount: node.cashbackAmount,
        storeId: node.storeId,
        storeName: pathOr('', [0, 'text'], node.store.name),
        state: node.state,
        feeAmount: node.fee ? node.fee.amount : null,
        feeCurrency: node.fee ? node.fee.currency : null,
        internationalBillingInfo: node.internationalBillingInfo,
        russiaBillingInfo: node.russiaBillingInfo,
        orderSlug: node.order ? node.order.slug : null,
        orderCreatedAt: node.order ? node.order.createdAt : null,
      };
    }, edges);
  };

  setPaidToSellerOrderState = (id: string) => {
    this.setState({ isLoading: true });

    this.props.client
      .mutate<SetPaidToSellerOrderState, SetPaidToSellerOrderStateVariables>({
        mutation: SET_PAID_TO_SELLER_ORDER_STATE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            orderId: id,
          },
        },
      })
      .then(({ data }) => {
        if (data && data.setPaidToSellerOrderState.mock) {
          this.updateStatus(id, PaymentState.PAID_TO_SELLER);
        }
      })
      .catch((error: ApolloError) => {
        message.error(error.message);
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  updateStatus = (id: string, status: PaymentState) => {
    const idx = findIndex(whereEq({ id: id }), this.state.dataSource);
    const lens = lensPath([idx]);
    this.setState(prevState => ({
      dataSource: over(lens, assoc('state', status), prevState.dataSource),
    }));
  };

  getStatusFromFilter = (
    filterStatus: PaymentStateFilter | null | undefined,
  ): PaymentState | null => {
    if (!filterStatus) {
      return null;
    }

    switch (filterStatus) {
      case PaymentStateFilter.INITIAL:
        return PaymentState.INITIAL;
      case PaymentStateFilter.DECLINED:
        return PaymentState.DECLINED;
      case PaymentStateFilter.CAPTURED:
        return PaymentState.CAPTURED;
      case PaymentStateFilter.REFUND_NEEDED:
        return PaymentState.REFUND_NEEDED;
      case PaymentStateFilter.REFUNDED:
        return PaymentState.REFUNDED;
      case PaymentStateFilter.PAID_TO_SELLER:
        return PaymentState.PAID_TO_SELLER;
      case PaymentStateFilter.PAYMENT_TO_SELLER_NEEDED:
        return PaymentState.PAYMENT_TO_SELLER_NEEDED;
      default:
        return null;
    }
  };

  render() {
    return (
      <Spin spinning={this.state.isLoading}>
        <FilterForm
          onApplyFilter={data => {
            this.setState(
              {
                searchTerms: reject(anyPass([isNil, isEmpty]), {
                  storeId: data.storeId || null,
                  orderSlug: data.orderSlug || null,
                  paymentState: this.getStatusFromFilter(data.paymentState),
                }),
              },
              () => {
                this.loadMore();
              },
            );
          }}
        />
        <FinancialManagerTable
          columns={this.columns}
          dataSource={this.state.dataSource}
          rowKey={record => `${record.id}`}
          pagination={false}
          rowClassName={() => styles.row}
          expandedRowRender={(store: IStore) => {
            const { internationalBillingInfo, russiaBillingInfo } = store;
            if (internationalBillingInfo) {
              return (
                <Subtable
                  columns={[
                    {
                      key: 'account',
                      title: 'Account',
                      dataIndex: 'account',
                    },
                    {
                      key: 'currency',
                      title: 'Currency',
                      dataIndex: 'currency',
                    },
                    {
                      key: 'name',
                      title: 'Name',
                      dataIndex: 'name',
                    },
                    {
                      key: 'bank',
                      title: 'Bank',
                      dataIndex: 'bank',
                    },
                    {
                      key: 'swift',
                      title: 'swift',
                      dataIndex: 'swift',
                    },
                    {
                      key: 'bankAddress',
                      title: 'Bank address',
                      dataIndex: 'bankAddress',
                    },
                    {
                      key: 'country',
                      title: 'Country',
                      dataIndex: 'country',
                    },
                    {
                      key: 'city',
                      title: 'City',
                      dataIndex: 'city',
                    },
                    {
                      key: 'recipientAddress',
                      title: 'Recipient address',
                      dataIndex: 'recipientAddress',
                    },
                  ]}
                  dataSource={[internationalBillingInfo]}
                  rowKey="id"
                  pagination={false}
                />
              );
            }
            if (russiaBillingInfo) {
              return (
                <Subtable
                  columns={[
                    {
                      key: 'bankName',
                      title: 'Branch name',
                      dataIndex: 'bankName',
                    },
                    {
                      key: 'branchName',
                      title: 'SWIFT BIC',
                      dataIndex: 'branchName',
                    },
                    {
                      key: 'swiftBic',
                      title: 'Tax ID',
                      dataIndex: 'swiftBic',
                    },
                    {
                      key: 'taxId',
                      title: 'Correspondent account',
                      dataIndex: 'taxId',
                    },
                    {
                      key: 'correspondentAccount',
                      title: 'Current account',
                      dataIndex: 'correspondentAccount',
                    },
                    {
                      key: 'currentAccount',
                      title: 'Personal account',
                      dataIndex: 'currentAccount',
                    },
                    {
                      key: 'personalAccount',
                      title: 'Beneficiary’s full name',
                      dataIndex: 'personalAccount',
                    },
                    {
                      key: 'beneficiaryFullName',
                      title: '',
                      dataIndex: 'beneficiaryFullName',
                    },
                  ]}
                  dataSource={[russiaBillingInfo]}
                  rowKey="id"
                  pagination={false}
                />
              );
            }
            return (
              <div>No billing info</div>
            );
          }}
          footer={() => (
            <Pagination
              showSizeChanger
              onShowSizeChange={(current, pageSize) => {
                this.setState(
                  {
                    dataSource: [],
                    pageInfo: {
                      ...this.state.pageInfo,
                      currentPage: current,
                      pageItemsCount: pageSize,
                    },
                  },
                  () => {
                    this.loadMore();
                  },
                );
              }}
              onChange={pageNumber => {
                this.setState(
                  {
                    pageInfo: {
                      ...this.state.pageInfo,
                      currentPage: pageNumber,
                    },
                  },
                  () => {
                    this.loadMore();
                  },
                );
              }}
              defaultCurrent={this.state.pageInfo.currentPage}
              total={
                this.state.pageInfo.totalPages *
                this.state.pageInfo.pageItemsCount
              }
            />
          )}
        />
      </Spin>
    );
  }
}

const FinancialManagerWithRouter = withRouter(FinancialManager);

export default (props: PropsType) => (
  <ApolloConsumer>
    {client => <FinancialManagerWithRouter {...props} client={client} />}
  </ApolloConsumer>
);
