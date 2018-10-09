import * as React from 'react';
import { Button, Menu, Dropdown, Icon, Spin } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  concat,
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
} from 'ramda';

import StoresTable, { IStore } from './Table';
import {
  StoresListQuery,
  StoresListQueryVariables,
  StoresListQuery_me_admin_storesSearch_edges_node as StoresListQueryEdgeNode,
  StoresListQuery_me_admin_storesSearch_edges as StoresListQueryEdge,
} from './__generated__/StoresListQuery';
import {
  PublishStoreMutation,
  PublishStoreMutationVariables,
} from './__generated__/PublishStoreMutation';
import {
  DraftStoreMutation,
  DraftStoreMutationVariables,
} from './__generated__/DraftStoreMutation';
import {
  Status,
  SearchModeratorStoreInput,
} from '../../../__generated__/globalTypes';
import {
  STORES_LIST_QUERY,
  STORE_PUBLISH_MUTATION,
  STORE_DRAFT_MUTATION,
} from './queries';
import FilterForm, { StatusFilter } from './FilterForm';
import * as styles from './Stores.scss';

const RECORDS_PER_PAGE = 20;

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  first: number;
  after: string | null;
  dataSource: IStore[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
  searchTerms: SearchModeratorStoreInput;
}

class Stores extends React.Component<PropsType, StateType> {
  state: StateType = {
    first: RECORDS_PER_PAGE,
    after: null,
    dataSource: [],
    isLoading: false,
    error: null,
    hasNextPage: false,
    searchTerms: {},
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
            href={`https://nightly.stq.cloud/store/${record.id}`}
            target="_blank"
          >
            {record.name}
          </a>
        ),
      },
      {
        key: 'ownerEmail',
        title: 'Email',
        dataIndex: 'ownerEmail',
      },
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
                  this.changeStatusForStore(record.id, key as Status);
                }}
              >
                {map(
                  item => (
                    <Menu.Item key={item}>{item}</Menu.Item>
                  ),
                  Object.keys(Status),
                )}
              </Menu>
            }
          >
            <Button>
              {record.status} <Icon type="down" />
            </Button>
          </Dropdown>
        ),
      },
      {
        key: 'Created',
        title: 'createdAt',
        dataIndex: 'createdAt',
        render: () => '-',
      },
      {
        key: 'goods',
        title: 'Goods',
        dataIndex: 'goods',
        width: 50,
        render: (_, record) => (
          <Button
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
          first: RECORDS_PER_PAGE,
          after: this.state.after,
          searchTerm: this.state.searchTerms,
        },
      })
      .then(({ data }) => {
        const after = pathOr(
          null,
          ['me', 'admin', 'storesSearch', 'pageInfo', 'endCursor'],
          data,
        );
        const hasNextPage = pathOr(
          null,
          ['me', 'admin', 'storesSearch', 'pageInfo', 'hasNextPage'],
          data,
        );
        const dsChunk = this.prepareDataSource(data);
        this.setState(prevState => ({
          dataSource: concat(prevState.dataSource, dsChunk),
          after,
          hasNextPage,
        }));
      })
      .catch(err => {
        this.setState({ error: err });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  prepareDataSource = (data: StoresListQuery): IStore[] => {
    const edges =
      (data.me &&
        data.me.admin.storesSearch &&
        data.me.admin.storesSearch.edges) ||
      [];
    return map((edge: StoresListQueryEdge) => {
      const node: StoresListQueryEdgeNode = edge.node;
      return {
        id: node.rawId,
        name: pathOr('', [0, 'text'], node.name),
        status: node.status,
        createdAt: new Date(), // TODO
        ownerFirstname: node.storeManager && node.storeManager.firstName,
        ownerLastname: node.storeManager && node.storeManager.lastName,
        ownerEmail: node.storeManager && node.storeManager.email,
        country: node.addressFull.country,
        productsCount: node.productsCount,
      };
    }, edges);
  };

  changeStatusForStore = (id: number, status: Status) => {
    if (status === 'DRAFT') {
      this.setState({ isLoading: true });
      this.props.client
        .mutate<DraftStoreMutation, DraftStoreMutationVariables>({
          mutation: STORE_DRAFT_MUTATION,
          variables: {
            id: id,
          },
        })
        .then(({ data }) => {
          const rawId = pathOr(null, ['draftStore', 'rawId'], data);
          const newStatus = pathOr(null, ['draftStore', 'status'], data);
          if (rawId && newStatus) {
            this.updateStatusForStoreInDS(rawId, newStatus);
          }
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    } else if (status === 'PUBLISHED') {
      this.setState({ isLoading: true });
      this.props.client
        .mutate<PublishStoreMutation, PublishStoreMutationVariables>({
          mutation: STORE_PUBLISH_MUTATION,
          variables: {
            id: id,
          },
        })
        .then(({ data }) => {
          const rawId = pathOr(null, ['publishStore', 'rawId'], data);
          const newStatus = pathOr(null, ['publishStore', 'status'], data);
          if (rawId && newStatus) {
            this.updateStatusForStoreInDS(rawId, newStatus);
          }
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    }
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
      case StatusFilter.DRAFT:
        return Status.DRAFT;
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
                after: null,
                dataSource: [],
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
          footer={() =>
            this.state.hasNextPage && (
              <Button
                block
                type="primary"
                loading={this.state.isLoading}
                onClick={this.loadMore}
              >
                Load more
              </Button>
            )
          }
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
