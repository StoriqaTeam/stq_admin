import * as React from 'react';
import { Button, Menu, Dropdown, Icon, Spin, Pagination, message } from 'antd';
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

import StoresTable, { IStore } from './Table';
import Subtable from './Subtable';
import {
  StoresListQuery,
  StoresListQueryVariables,
  StoresListQuery_me_admin_storesSearchPages_edges_node as StoresListQueryEdgeNode,
  StoresListQuery_me_admin_storesSearchPages_edges as StoresListQueryEdge,
} from './__generated__/StoresListQuery';
import {
  SetStoreModerationStatus,
  SetStoreModerationStatusVariables,
} from './__generated__/SetStoreModerationStatus';
import {
  Status,
  SearchModeratorStoreInput,
} from '../../../__generated__/globalTypes';
import {
  STORES_LIST_QUERY,
  SET_MODERATION_STATUS_FOR_STORE_MUTATION,
} from './queries';
import FilterForm, { StatusFilter } from './FilterForm';
import * as styles from './Stores.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: IStore[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  searchTerms: SearchModeratorStoreInput;
  pageInfo: {
    currentPage: number;
    pageItemsCount: number;
    totalPages: number;
  };
}

class Stores extends React.Component<PropsType, StateType> {
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
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        render: (_, record) => (
          <a
            href={`${process.env.PRODUCT_URL}/store/${record.id}`}
            target="_blank"
          >
            {record.name}
          </a>
        ),
      },
      {
        key: 'edit',
        title: 'Edit',
        dataIndex: 'edit',
        width: 50,
        render: (_, record) => (
          <a
            href={`${process.env.PRODUCT_URL}/manage/store/${record.id}`}
            target="_blank"
          >
            <Icon type="right-square" />
          </a>
        ),
      },
      {
        key: 'ownerEmail',
        title: 'Email',
        dataIndex: 'ownerEmail',
      },
      {
        key: 'country',
        title: 'Country',
        dataIndex: 'country',
      },
      {
        key: 'productsCount',
        title: 'Products',
        dataIndex: 'productsCount',
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        render: (_, record) => (
          <Dropdown
            overlay={
              <Menu
                onClick={({ key }) => {
                  this.changeStatusForStore(record.base64ID, key as Status);
                }}
              >
                {map(
                  item => (
                    <Menu.Item
                      key={item}
                      data-test={`stores-table-row-${
                        record.name
                      }-status-${item}`}
                    >
                      {item}
                    </Menu.Item>
                  ),
                  Object.keys(Status),
                )}
              </Menu>
            }
          >
            <Button data-test={`stores-table-row-${record.name}-status`}>
              {record.status} <Icon type="down" />
            </Button>
          </Dropdown>
        ),
      },
      {
        key: 'Created',
        title: 'createdAt',
        dataIndex: 'createdAt',
        render: (_, record) => format(record.createdAt, 'YYYY/MM/DD HH:mm'),
      },
      {
        key: 'Updated',
        title: 'updatedAt',
        dataIndex: 'updatedAt',
        render: (_, record) => format(record.updatedAt, 'YYYY/MM/DD HH:mm'),
      },
      {
        key: 'goods',
        title: 'Goods',
        dataIndex: 'goods',
        width: 50,
        render: (_, record) => (
          <Button
            data-test={`stores-table-row-${record.name}-goods`}
            icon="appstore"
            shape="circle"
            onClick={() => {
              this.props.history.push(`/stores/${record.id}/goods`);
            }}
          />
        ),
      },
    ];
  }

  componentDidMount() {
    this.loadMore();
  }

  loadMore = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<StoresListQuery, StoresListQueryVariables>({
        query: STORES_LIST_QUERY,
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
              data.me.admin.storesSearchPages &&
              data.me.admin.storesSearchPages.pageInfo) ||
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

  prepareDataSource = (data: StoresListQuery): IStore[] => {
    const edges =
      (data.me &&
        data.me.admin.storesSearchPages &&
        data.me.admin.storesSearchPages.edges) ||
      [];
    return map((edge: StoresListQueryEdge) => {
      const node: StoresListQueryEdgeNode = edge.node;
      return {
        base64ID: node.id,
        id: node.rawId,
        name: pathOr('', [0, 'text'], node.name),
        status: node.status,
        createdAt: parse(node.createdAt),
        updatedAt: parse(node.updatedAt),
        ownerPhone: node.storeManager && node.storeManager.phone,
        ownerFirstname: node.storeManager && node.storeManager.firstName,
        ownerLastname: node.storeManager && node.storeManager.lastName,
        ownerEmail: node.storeManager && node.storeManager.email,
        country: node.addressFull.country,
        address: node.addressFull.value,
        productsCount: node.productsCount,
      };
    }, edges);
  };

  changeStatusForStore = (ID: string, status: Status) => {
    this.setState({ isLoading: true });

    this.props.client
      .mutate<SetStoreModerationStatus, SetStoreModerationStatusVariables>({
        mutation: SET_MODERATION_STATUS_FOR_STORE_MUTATION,
        variables: {
          id: ID,
          status,
        },
      })
      .then(({ data }) => {
        const rawId: number | null = pathOr(
          null,
          ['setModerationStatusStore', 'rawId'],
          data,
        );
        const receivedStatus: Status | null = pathOr(
          null,
          ['setModerationStatusStore', 'status'],
          data,
        );
        if (rawId && receivedStatus) {
          this.updateStatusForStoreInDS(rawId, receivedStatus);
        }
      })
      .catch((error: ApolloError) => {
        message.error(error.message);
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  updateStatusForStoreInDS = (id: number, status: Status) => {
    const idx = findIndex(whereEq({ id: id }), this.state.dataSource);
    const lens = lensPath([idx]);
    this.setState(prevState => ({
      dataSource: over(lens, assoc('status', status), prevState.dataSource),
    }));
  };

  getStatusFromFilter = (
    filterStatus: StatusFilter | null | undefined,
  ): Status | null => {
    if (!filterStatus) {
      return null;
    }

    switch (filterStatus) {
      case StatusFilter.PUBLISHED:
        return Status.PUBLISHED;
      case StatusFilter.DECLINE:
        return Status.DECLINE;
      case StatusFilter.DRAFT:
        return Status.DRAFT;
      case StatusFilter.MODERATION:
        return Status.MODERATION;
      case StatusFilter.BLOCKED:
        return Status.BLOCKED;
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
                  name: data.name || null,
                  storeManagerEmail: data.email || null,
                  state: this.getStatusFromFilter(data.status),
                }),
              },
              () => {
                this.loadMore();
              },
            );
          }}
        />
        <StoresTable
          columns={this.columns}
          dataSource={this.state.dataSource}
          rowKey={record => `${record.id}`}
          pagination={false}
          rowClassName={() => styles.row}
          expandedRowRender={(store: IStore) => (
            <Subtable
              columns={[
                {
                  key: 'ownerFirstname',
                  title: 'First name',
                  dataIndex: 'ownerFirstname',
                },
                {
                  key: 'ownerLastname',
                  title: 'Last name',
                  dataIndex: 'ownerLastname',
                },
                {
                  key: 'ownerPhone',
                  title: 'Phone',
                  dataIndex: 'ownerPhone',
                },
                {
                  key: 'address',
                  title: 'Address',
                  dataIndex: 'address',
                },
              ]}
              dataSource={[store]}
              rowKey="id"
              pagination={false}
            />
          )}
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

const StoresWithRouter = withRouter(Stores);

export default (props: PropsType) => (
  <ApolloConsumer>
    {client => <StoresWithRouter {...props} client={client} />}
  </ApolloConsumer>
);
