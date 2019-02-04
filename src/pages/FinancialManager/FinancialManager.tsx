import * as React from 'react';
import { Spin, Pagination, message, Checkbox, Modal, Table, Tag } from 'antd';
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
  toPairs,
  addIndex,
  toString,
} from 'ramda';
import { format } from 'date-fns';

import FinancialManagerTable, { IFinancialManager } from './Table';
import Subtable from './Subtable';
import {
  FinancialManagerQuery,
  FinancialManagerQueryVariables,
  FinancialManagerQuery_me_financialManager_orders_edges_node as FinancialManagerQueryEdgeNode,
  FinancialManagerQuery_me_financialManager_orders_edges as FinancialManagerQueryEdge,
} from './__generated__/FinancialManagerQuery';
import {
  PaymentState,
  FeeStatus,
  OrderBillingSearchInput,
} from '../../../__generated__/globalTypes';
import { FINANCIAL_MANAGER_QUERY, SET_PAID_TO_SELLER_ORDER_STATE_MUTATION, CHARGE_FEE_MUTATION } from './queries';
import FilterForm, { PaymentStateFilter } from './FilterForm';
import * as styles from './FinancialManager.scss';
import {
  SetPaidToSellerOrderState,
  SetPaidToSellerOrderStateVariables,
} from './__generated__/SetPaidToSellerOrderState';

import {
  ChargeFee,
  ChargeFeeVariables,
} from './__generated__/ChargeFee';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: IFinancialManager[];
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
      pageItemsCount: 20,
      totalPages: 1,
    },
  };

  columns: Array<ColumnProps<IFinancialManager>> = [];

  constructor(props: PropsType) {
    super(props);

    this.columns = [
      {
        key: 'orderSlug',
        title: 'Order',
        dataIndex: 'orderSlug',
      },
      {
        key: 'orderCreatedAt',
        title: 'Order created at',
        dataIndex: 'orderCreatedAt',
        render: (_, record) => format(record.orderCreatedAt, 'DD.MM.YYYY HH:mm'),
      },
      {
        key: 'storeId',
        title: 'Store ID',
        dataIndex: 'storeId',
      },
      {
        key: 'state',
        title: 'Order billing status',
        dataIndex: 'state',
      },
      {
        key: 'totalAmount',
        title: 'Total amount',
        dataIndex: 'totalAmount',
        render: (_, record) => (`${record.totalAmount} ${record.sellerCurrency}`),
      },
      {
        key: 'cashbackAmount',
        title: 'Cashback amount',
        dataIndex: 'cashbackAmount',
        render: (_, record) => (record.cashbackAmount
          ? `${record.cashbackAmount || 0} ${record.sellerCurrency || ''}`
          : '-'),
      },
      {
        key: 'storiqaFee',
        title: 'Storiqa fee',
        dataIndex: 'storiqaFee',
        render: (_, record) => (record.feeAmount
          ? `${parseFloat((record.feeAmount || 0).toFixed(8))} ${record.feeCurrency || ''}`
          : '-'),
      },
      {
        key: 'transactionFee',
        title: 'Transaction fee',
        dataIndex: 'transactionFee',
        render: (_, record) => (record.stripeFee ? `${record.stripeFee} ${record.sellerCurrency}` : '-'),
      },
      {
        key: 'feeStatus',
        title: 'Fee status',
        dataIndex: 'feeStatus',
      },
      {
        key: 'paidToSeller',
        title: 'Paid to seller',
        dataIndex: 'state',
        render: (_, record) => {
          const { setPaidToSellerOrderState } = this;
          const { id, state, internationalBillingInfo, russiaBillingInfo } = record;
          const orderDataSource = addIndex(map)((item, idx) => {
            return {
              key: toString(idx),
              // @ts-ignore: Unreachable code error
              detailLabel: item[0],
              // @ts-ignore: Unreachable code error
              detailValue: item[1],
            };
          }, toPairs(pick([
            'orderSlug',
            'orderCreatedAt',
            'storeId',
            'totalAmount',
            'cashbackAmount',
            'sellerCurrency',
            'feeAmount',
            'feeCurrency',
          ], record)));

          return (
            <Checkbox
              checked={state === 'PAID_TO_SELLER'}
              disabled={state === 'PAID_TO_SELLER' || state !== 'PAYMENT_TO_SELLER_NEEDED'}
              onChange={() => {
                Modal.confirm({
                  width: 800,
                  title: 'Are you sure paid to seller?',
                  content: (
                    <div>
                      {internationalBillingInfo && (
                        <React.Fragment>
                          <Table
                            size="small"
                            columns={[
                              {
                                key: 'detailLabel',
                                title: <Tag>Order info</Tag>,
                                dataIndex: 'detailLabel',
                              },
                              {
                                key: 'detailValue',
                                title: '',
                                dataIndex: 'detailValue',
                              },
                            ]}
                            dataSource={orderDataSource}
                            rowKey="id"
                            pagination={false}
                          />
                          <br />
                          <Table
                            size="small"
                            columns={[
                              {
                                key: 'detailLabel',
                                title: <Tag>Billing info</Tag>,
                                dataIndex: 'detailLabel',
                              },
                              {
                                key: 'detailValue',
                                title: '',
                                dataIndex: 'detailValue',
                              },
                            ]}
                            dataSource={addIndex(map)((item, idx) => {
                              return {
                                key: toString(idx),
                                // @ts-ignore: Unreachable code error
                                detailLabel: item[0],
                                // @ts-ignore: Unreachable code error
                                detailValue: item[1],
                              };
                              // @ts-ignore: Unreachable code error
                            }, toPairs(internationalBillingInfo))}
                            rowKey="id"
                            pagination={false}
                          />
                        </React.Fragment>
                      )}
                      {russiaBillingInfo && (
                        <React.Fragment>
                          <Table
                            size="small"
                            columns={[
                              {
                                key: 'detailLabel',
                                title: <Tag>Order info</Tag>,
                                dataIndex: 'detailLabel',
                              },
                              {
                                key: 'detailValue',
                                title: '',
                                dataIndex: 'detailValue',
                              },
                            ]}
                            dataSource={orderDataSource}
                            rowKey="id"
                            pagination={false}
                          />
                          <br />
                          <Table
                            size="small"
                            columns={[
                              {
                                key: 'detailLabel',
                                title: <Tag>Billing info</Tag>,
                                dataIndex: 'detailLabel',
                              },
                              {
                                key: 'detailValue',
                                title: '',
                                dataIndex: 'detailValue',
                              },
                            ]}
                            dataSource={addIndex(map)((item, idx) => {
                              return {
                                key: toString(idx),
                                // @ts-ignore: Unreachable code error
                                detailLabel: item[0],
                                // @ts-ignore: Unreachable code error
                                detailValue: item[1],
                              };
                              // @ts-ignore: Unreachable code error
                            }, toPairs(russiaBillingInfo))}
                            rowKey="id"
                            pagination={false}
                          />
                        </React.Fragment>
                      )}
                    </div>
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
      {
        key: 'paidFee',
        title: 'Paid fee',
        dataIndex: 'feeStatus',
        render: (_, record) => {
          const { feeStatus, id, state } = record;
          const { chargeFee } = this;
          return (
            <Checkbox
              checked={feeStatus === 'PAID'}
              disabled={!feeStatus || feeStatus === 'PAID' || state === 'INITIAL' || state === 'DECLINED'}
              onChange={() => {
                Modal.confirm({
                  title: 'Are you sure paid fee?',
                  content: (
                    <div>{`${record.feeAmount} ${record.feeCurrency}`}</div>
                  ),
                  okText: 'Yes',
                  okType: 'danger',
                  cancelText: 'No',
                  onOk() {
                    chargeFee(id);
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

  prepareDataSource = (data: FinancialManagerQuery): IFinancialManager[] => {
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
        feeStatus: node.fee ? node.fee.status : null,
        internationalBillingInfo: node.internationalBillingInfo,
        russiaBillingInfo: node.russiaBillingInfo,
        orderSlug: node.order ? node.order.slug : null,
        orderCreatedAt: node.order ? node.order.createdAt : '',
        stripeFee: node.stripeFee,
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

  chargeFee = (id: string) => {
    this.setState({ isLoading: true });

    this.props.client
      .mutate<ChargeFee, ChargeFeeVariables>({
        mutation: CHARGE_FEE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            orderId: id,
          },
        },
      })
      .then(({ data }) => {
        if (data && data.ChargeFee && data.ChargeFee.orderId) {
          this.updateFeeStatus(id, FeeStatus.PAID);
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

  updateFeeStatus = (id: string, status: FeeStatus) => {
    const idx = findIndex(whereEq({ id: id }), this.state.dataSource);
    const lens = lensPath([idx]);
    this.setState(prevState => ({
      dataSource: over(lens, assoc('feeStatus', status), prevState.dataSource),
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
          size="small"
          columns={this.columns}
          dataSource={this.state.dataSource}
          rowKey={record => `${record.id}`}
          pagination={false}
          rowClassName={() => styles.row}
          expandedRowRender={(data: IFinancialManager) => {
            const { internationalBillingInfo, russiaBillingInfo } = data;
            if (internationalBillingInfo) {
              return (
                <Subtable
                  size="small"
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
              pageSize={this.state.pageInfo.pageItemsCount}
              current={this.state.pageInfo.currentPage}
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
              defaultCurrent={1}
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
